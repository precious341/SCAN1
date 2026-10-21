import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Known laboratory analyte dictionary with standard reference boundaries for context
const CLINICAL_DICTIONARY = [
  { name: 'White Blood Cell (WBC)', aliases: ['wbc', 'white blood cell', 'white blood count', 'leukocytes'], category: 'Hematology', unit: '10^9/L', low: 4.0, high: 11.0, rangeStr: '4.0 - 11.0' },
  { name: 'Red Blood Cell (RBC)', aliases: ['rbc', 'red blood cell', 'erythrocytes'], category: 'Hematology', unit: '10^12/L', low: 4.2, high: 5.8, rangeStr: '4.2 - 5.8' },
  { name: 'Hemoglobin (HGB)', aliases: ['hemoglobin', 'hgb', 'hb'], category: 'Hematology', unit: 'g/dL', low: 12.0, high: 16.0, rangeStr: '12.0 - 16.0' },
  { name: 'Hematocrit (HCT)', aliases: ['hematocrit', 'hct', 'pcv'], category: 'Hematology', unit: '%', low: 37.0, high: 47.0, rangeStr: '37.0 - 47.0' },
  { name: 'Platelets', aliases: ['platelet', 'platelets', 'plt', 'thrombocytes'], category: 'Hematology', unit: '10^9/L', low: 150, high: 450, rangeStr: '150 - 450' },
  { name: 'Mean Corpuscular Volume (MCV)', aliases: ['mcv', 'mean corpuscular volume'], category: 'Hematology', unit: 'fL', low: 80.0, high: 100.0, rangeStr: '80.0 - 100.0' },
  { name: 'Mean Corpuscular Hemoglobin (MCH)', aliases: ['mch', 'mean corpuscular hemoglobin'], category: 'Hematology', unit: 'pg', low: 27.0, high: 33.0, rangeStr: '27.0 - 33.0' },
  { name: 'Glucose (Fasting)', aliases: ['glucose', 'blood sugar', 'fasting blood glucose', 'fbg'], category: 'Metabolic', unit: 'mg/dL', low: 70.0, high: 99.0, rangeStr: '70.0 - 99.0' },
  { name: 'Hemoglobin A1c (HbA1c)', aliases: ['hba1c', 'a1c', 'glycated hemoglobin'], category: 'Metabolic', unit: '%', low: 4.0, high: 5.6, rangeStr: '4.0 - 5.6' },
  { name: 'Blood Urea Nitrogen (BUN)', aliases: ['bun', 'blood urea nitrogen', 'urea'], category: 'Renal', unit: 'mg/dL', low: 7.0, high: 20.0, rangeStr: '7.0 - 20.0' },
  { name: 'Serum Creatinine', aliases: ['creatinine', 'serum creatinine', 'creat'], category: 'Renal', unit: 'mg/dL', low: 0.6, high: 1.2, rangeStr: '0.6 - 1.2' },
  { name: 'eGFR', aliases: ['egfr', 'glomerular filtration rate'], category: 'Renal', unit: 'mL/min/1.73m2', low: 60.0, high: 120.0, rangeStr: '>= 60' },
  { name: 'Sodium', aliases: ['sodium', 'na'], category: 'Electrolytes', unit: 'mmol/L', low: 136.0, high: 145.0, rangeStr: '136.0 - 145.0' },
  { name: 'Potassium', aliases: ['potassium', 'k'], category: 'Electrolytes', unit: 'mmol/L', low: 3.5, high: 5.1, rangeStr: '3.5 - 5.1' },
  { name: 'Chloride', aliases: ['chloride', 'cl'], category: 'Electrolytes', unit: 'mmol/L', low: 96.0, high: 106.0, rangeStr: '96.0 - 106.0' },
  { name: 'Total Calcium', aliases: ['calcium', 'total calcium', 'ca'], category: 'Electrolytes', unit: 'mg/dL', low: 8.5, high: 10.5, rangeStr: '8.5 - 10.5' },
  { name: 'Total Cholesterol', aliases: ['cholesterol', 'total cholesterol'], category: 'Lipids', unit: 'mg/dL', low: 120.0, high: 200.0, rangeStr: '< 200' },
  { name: 'Triglycerides', aliases: ['triglycerides', 'trig'], category: 'Lipids', unit: 'mg/dL', low: 50.0, high: 150.0, rangeStr: '< 150' },
  { name: 'HDL Cholesterol', aliases: ['hdl', 'hdl cholesterol', 'high-density lipoprotein'], category: 'Lipids', unit: 'mg/dL', low: 40.0, high: 90.0, rangeStr: '> 40' },
  { name: 'LDL Cholesterol', aliases: ['ldl', 'ldl cholesterol', 'low-density lipoprotein'], category: 'Lipids', unit: 'mg/dL', low: 50.0, high: 100.0, rangeStr: '< 100' },
  { name: 'Alanine Aminotransferase (ALT)', aliases: ['alt', 'sgpt', 'alanine aminotransferase'], category: 'Hepatic', unit: 'U/L', low: 7.0, high: 56.0, rangeStr: '7 - 56' },
  { name: 'Aspartate Aminotransferase (AST)', aliases: ['ast', 'sgot', 'aspartate aminotransferase'], category: 'Hepatic', unit: 'U/L', low: 10.0, high: 40.0, rangeStr: '10 - 40' },
  { name: 'Alkaline Phosphatase (ALP)', aliases: ['alp', 'alk phos', 'alkaline phosphatase'], category: 'Hepatic', unit: 'U/L', low: 44.0, high: 147.0, rangeStr: '44 - 147' },
  { name: 'Total Bilirubin', aliases: ['bilirubin', 'total bilirubin'], category: 'Hepatic', unit: 'mg/dL', low: 0.1, high: 1.2, rangeStr: '0.1 - 1.2' },
  { name: 'Serum Albumin', aliases: ['albumin', 'alb'], category: 'Hepatic', unit: 'g/dL', low: 3.5, high: 5.0, rangeStr: '3.5 - 5.0' },
  { name: 'Total Protein', aliases: ['total protein', 'tp'], category: 'Hepatic', unit: 'g/dL', low: 6.0, high: 8.3, rangeStr: '6.0 - 8.3' },
  { name: 'Thyroid Stimulating Hormone (TSH)', aliases: ['tsh', 'thyroid stimulating hormone'], category: 'Endocrine', unit: 'uIU/mL', low: 0.4, high: 4.0, rangeStr: '0.4 - 4.0' },
  { name: 'Vitamin D (25-Hydroxy)', aliases: ['vitamin d', '25-hydroxy vitamin d', 'vit d'], category: 'Nutritional', unit: 'ng/mL', low: 30.0, high: 100.0, rangeStr: '30.0 - 100.0' },
  { name: 'Ferritin', aliases: ['ferritin'], category: 'Iron Studies', unit: 'ng/mL', low: 13.0, high: 150.0, rangeStr: '13.0 - 150.0' }
];

/**
 * Extracts raw text from a PDF buffer or file path
 */
export async function extractTextFromPDF(filePathOrBuffer) {
  try {
    const buffer = typeof filePathOrBuffer === 'string' 
      ? await fs.promises.readFile(filePathOrBuffer)
      : filePathOrBuffer;

    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('[PDF Extraction] Error reading PDF document:', err);
    throw new Error('Unable to parse PDF text content. File might be protected or corrupted.');
  }
}

/**
 * Parses laboratory values, units, and reference ranges from document text
 */
export function parseClinicalResults(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return [];
  }

  const results = [];
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  for (const item of CLINICAL_DICTIONARY) {
    let matched = false;

    for (const alias of item.aliases) {
      if (matched) break;

      // Look for lines containing alias
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${alias}(?:[:\\s-]|$)`, 'i');
      const matchingLine = lines.find(line => regex.test(line));

      if (matchingLine) {
        // Look for numeric values in line
        // Example: "Hemoglobin (HGB): 11.8 g/dL (Reference: 12.0 - 16.0)"
        // or "WBC 6.8 10^9/L 4.0-11.0"
        const numMatches = matchingLine.match(/([<>]=?\s*)?(\d+(?:\.\d+)?)/g);
        if (numMatches && numMatches.length > 0) {
          // The first numerical token after the test name is typically the result value
          // Find token position relative to alias
          const aliasIndex = matchingLine.toLowerCase().indexOf(alias.toLowerCase());
          const restOfLine = matchingLine.substring(aliasIndex + alias.length);
          const valMatch = restOfLine.match(/[:\s]+([<>]=?\s*)?(\d+(?:\.\d+)?)/);

          if (valMatch && valMatch[2]) {
            const rawValStr = valMatch[2];
            const numericVal = parseFloat(rawValStr);

            // Check if explicit reference range is written in the line
            let refRange = item.rangeStr;
            let low = item.low;
            let high = item.high;

            const customRangeMatch = restOfLine.match(/(?:ref(?:erence)?|range)?[:\s]*\(?(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\)?/i);
            if (customRangeMatch && customRangeMatch[1] && customRangeMatch[2]) {
              low = parseFloat(customRangeMatch[1]);
              high = parseFloat(customRangeMatch[2]);
              refRange = `${low} - ${high}`;
            }

            // Flag calculation
            let flag = 'normal';
            if (low !== null && numericVal < low) {
              flag = 'low';
            } else if (high !== null && numericVal > high) {
              flag = 'high';
            }

            // Check for explicit [Low] or [High] or [Abnormal] markers in the text
            if (/\[?(low|below|l)\]?/i.test(restOfLine)) {
              flag = 'low';
            } else if (/\[?(high|above|h)\]?/i.test(restOfLine)) {
              flag = 'high';
            }

            results.push({
              test_name: item.name,
              category: item.category,
              result_value: rawValStr,
              numeric_value: numericVal,
              unit: item.unit,
              reference_range: refRange,
              ref_range_low: low,
              ref_range_high: high,
              flag,
            });

            matched = true;
          }
        }
      }
    }
  }

  // If no dictionary match was found, attempt generic line-by-line tabular parsing
  if (results.length === 0) {
    for (const line of lines) {
      const genericMatch = line.match(/^([A-Za-z\s()-]{3,30})[:\s]+(\d+(?:\.\d+)?)\s*([a-zA-Z0-9/%^]+)?(?:\s+(?:ref|range)?[:\s]*(\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?))?/i);
      if (genericMatch) {
        const testName = genericMatch[1].trim();
        const numVal = parseFloat(genericMatch[2]);
        const unit = genericMatch[3] || '';
        const range = genericMatch[4] || '';

        let low = null;
        let high = null;
        let flag = 'normal';

        if (range) {
          const parts = range.split('-').map(p => parseFloat(p.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            low = parts[0];
            high = parts[1];
            if (numVal < low) flag = 'low';
            else if (numVal > high) flag = 'high';
          }
        }

        results.push({
          test_name: testName,
          category: 'General',
          result_value: String(numVal),
          numeric_value: numVal,
          unit,
          reference_range: range || 'N/A',
          ref_range_low: low,
          ref_range_high: high,
          flag,
        });
      }
    }
  }

  return results;
}
