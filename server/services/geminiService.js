import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Google Gemini API key is missing. Please ensure GEMINI_API_KEY is configured in your environment or Secrets panel.');
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Resilient model cascade: prioritizing gemini-3.8-flash
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

const MEDICAL_SYSTEM_INSTRUCTION = `
You are the MedScan Clinical Assistant, an expert, empathetic, and evidence-grounded health information assistant.
Your goal is to help patients understand complex laboratory reports, diagnostic biomarkers, units of measurement, and reference intervals in clear, plain language.

CORE CLINICAL & SAFETY PRINCIPLES:
1. INFORMATIONAL ONLY: You do NOT provide formal clinical diagnoses, alter prescriptions, or replace a licensed physician. Always remind the patient to consult their healthcare provider.
2. EVIDENCE GROUNDED: Base all explanations strictly on verified laboratory science. Clearly describe what each analyte represents (e.g., bone marrow activity, liver enzymes, kidney filtration, lipid metabolism, inflammation markers).
3. CLEAR FORMATTING: Structure your answers using clean markdown:
   - Use bold section headers and bullet points.
   - Group related biomarkers logically.
   - Provide "What this means in plain English".
   - Include 2-3 specific, actionable "Questions to discuss with your healthcare professional".
4. SENSITIVITY & CONTEXT: Never cause undue alarm. Emphasize that single test fluctuations can occur due to hydration, diet, exercise, or lab-specific calibration differences.
`;

/**
 * Helper to enforce request timeout
 */
function withTimeout(promise, timeoutMs = 28000, errorMsg = 'AI request timed out after 28 seconds. Please click Retry.') {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMsg)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Executes a Gemini request with automatic fallback between model candidates
 */
async function callGeminiWithFallback(fn) {
  let lastError = null;
  const ai = getAIClient();

  for (const model of MODEL_CANDIDATES) {
    try {
      return await withTimeout(fn(ai, model));
    } catch (err) {
      console.warn(`[GeminiService] Model ${model} encountered an issue: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  throw new Error(`Google Gemini service unavailable: ${lastError?.message || 'Request failed across available model candidates'}. Please try again in a few moments.`);
}

/**
 * Sanitizes markdown JSON strings before parsing
 */
function cleanJsonString(str) {
  if (!str) return '{}';
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

/**
 * Analyzes structured report results and generates plain-language explanations
 */
export async function analyzeReportWithGemini(reportTitle, rawText, extractedResults) {
  const prompt = `
Please conduct a thorough clinical explanation of the following laboratory report:
Report Title: ${reportTitle}
Extracted Test Results:
${JSON.stringify(extractedResults, null, 2)}

Full Document Text Sample:
${(rawText || '').substring(0, 2000)}

Please return a valid JSON object matching this exact schema:
{
  "plain_language_summary": "Comprehensive 2-3 paragraph overview explaining the significance of the findings in clear, patient-friendly language.",
  "key_findings": [
    "Specific observation on normal or out-of-range parameters with values and biological context"
  ],
  "questions_for_clinician": [
    "Thoughtful, specific questions the patient should bring to their doctor's appointment"
  ],
  "citations": [
    {"title": "Authoritative clinical reference title (e.g. MedlinePlus, Mayo Clinic, NIH)", "url": "https://..."}
  ]
}
`;

  return await callGeminiWithFallback(async (ai, model) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: MEDICAL_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const text = cleanJsonString(response.text);
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn('[GeminiService] JSON parse failed, returning fallback structure');
      parsed = {
        plain_language_summary: response.text || 'Your report has been analyzed. Please review the extracted metrics with your doctor.',
        key_findings: [],
        questions_for_clinician: [],
      };
    }

    return {
      plain_language_summary: parsed.plain_language_summary || 'Your report has been analyzed. Please review the extracted metrics with your doctor.',
      key_findings: Array.isArray(parsed.key_findings) ? parsed.key_findings : [],
      questions_for_clinician: Array.isArray(parsed.questions_for_clinician) ? parsed.questions_for_clinician : [],
      citations: Array.isArray(parsed.citations) && parsed.citations.length > 0 ? parsed.citations : [
        { title: 'National Institutes of Health - MedlinePlus Medical Tests', url: 'https://medlineplus.gov/lab-tests/' },
        { title: 'Mayo Clinic - Laboratory Test Directory', url: 'https://www.mayoclinic.org/tests-procedures' }
      ],
      modelVersion: model,
    };
  });
}

/**
 * Normalizes multi-turn conversation history for Gemini API
 * Gemini requires:
 * 1. Strictly alternating user and model turns
 * 2. The first turn MUST have role: 'user'
 * 3. Every turn must have non-empty text parts
 */
function sanitizeConversationHistory(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return [];
  }

  const validTurns = [];
  for (const msg of history) {
    const text = (msg.message_text || '').trim();
    if (!text) continue;
    const role = msg.sender_role === 'assistant' || msg.sender_role === 'model' ? 'model' : 'user';

    // If empty, first turn MUST be 'user'
    if (validTurns.length === 0) {
      if (role === 'user') {
        validTurns.push({ role: 'user', parts: [{ text }] });
      }
      continue;
    }

    const lastRole = validTurns[validTurns.length - 1].role;
    if (lastRole === role) {
      // Merge with previous turn if same role to maintain strict alternation
      validTurns[validTurns.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      validTurns.push({ role, parts: [{ text }] });
    }
  }

  // Ensure last turn in history is 'model' so current user message alternates correctly
  if (validTurns.length > 0 && validTurns[validTurns.length - 1].role === 'user') {
    validTurns.pop();
  }

  return validTurns;
}

/**
 * Generates an interactive chat response for the MedScan Assistant
 */
export async function chatWithAssistant(userMessage, conversationHistory, reportContext) {
  const contextPrompt = reportContext ? `
CURRENT PATIENT REPORT CONTEXT:
Report Title: ${reportContext.title}
Report Date: ${reportContext.report_date || 'Not specified'}
Extracted Lab Biomarkers:
${JSON.stringify(reportContext.results || [], null, 2)}
` : 'No specific report selected. Provide general, educational medical guidance and laboratory terminology explanation.';

  const formattedHistory = sanitizeConversationHistory(conversationHistory);

  return await callGeminiWithFallback(async (ai, model) => {
    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: `${contextPrompt}\n\nPatient Question: ${userMessage}` }]
      }
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: MEDICAL_SYSTEM_INSTRUCTION,
      },
    });

    let answer = response.text || '';
    if (!answer.includes('diagnosis') && !answer.includes('healthcare professional') && !answer.includes('doctor')) {
      answer += '\n\n---\n*Disclaimer: This information is for educational purposes and is not a medical diagnosis. Please review your findings with a licensed healthcare provider.*';
    }

    return {
      message: answer,
      sources: [
        { title: 'National Institutes of Health - MedlinePlus Lab Tests', url: 'https://medlineplus.gov/lab-tests/' },
        { title: 'National Library of Medicine - Understanding Blood Tests', url: 'https://www.ncbi.nlm.nih.gov/' }
      ],
      modelVersion: model
    };
  });
}
