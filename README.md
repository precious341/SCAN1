# MedScan

> **Tagline:** Understand Your Health. With Clarity.  
> **Type:** Professional Medical Report Management and Understanding Platform.

---

## 1. Overview & Problem Statement

Medical laboratory documents are often dense, confusing, and packed with complex clinical terminology, unfamiliar reference intervals, and non-intuitive units. Patients frequently leave clinic appointments or download diagnostic portals without a clear understanding of what their test results mean, what questions to ask their physicians, or how current values compare to previous examinations.

**MedScan** bridges this gap. It provides a secure, hospital-grade patient portal where users can upload medical laboratory reports (PDFs, scans, or text documents), extract structured biomarkers, read plain-language clinical explanations, review longitudinal comparisons, and generate informed, doctor-ready discussion questions.

---

## 2. Key Features

- **Document Text & Laboratory Analyte Extraction:**  
  Extracts laboratory tests (e.g., Hemoglobin, WBC, RBC, Platelets, Fasting Glucose, Creatinine, Electrolytes, Cholesterol panels), numerical values, units, and stated reference intervals using a clinical extraction pipeline with magic-byte validation.

- **Plain-Language Medical Explanations:**  
  Powered by Google Gemini (`gemini-3.8-flash`) through a secure, server-side Express backend. Translates clinical findings into clear, empathetic prose without diagnostic overreach.

- **Physician Discussion Preparation:**  
  Generates 3–5 targeted questions tailored to the user's specific test results for their next clinical appointment.

- **Longitudinal Report Comparison:**  
  Chronologically compares multiple visits side by side, aligning equivalent biomarkers, highlighting baseline changes, and checking unit compatibility.

- **Interactive Medical Assistant:**  
  Full multi-thread conversational assistant scoped to specific patient reports or general medical terminology, featuring authoritative medical source citations (MedlinePlus, Mayo Clinic, NIH).

- **Hospital-Style User Experience:**  
  Designed with clean clinical tokens (Deep Navy `#123047`, Medical Teal `#168C91`, Off-White `#F4F7FA`), accessible status flags, zero-pill discipline, and responsive mobile/desktop layouts.

- **Private & Secure Storage:**  
  Medical documents are held in private server storage outside the web root, accessible only through authenticated session checks.

---

## 3. Technology Stack

- **Frontend:** React 19, Vite, JavaScript, JSX, Tailwind CSS, React Router, Lucide React
- **Backend:** Node.js, Express (ES Modules)
- **Database:** PostgreSQL with `pg` driver (with zero-config embedded PostgreSQL layer for sandbox preview)
- **Authentication:** Express-session with HTTP-only cookies, bcrypt password hashing (12 rounds)
- **AI Integration:** Google GenAI SDK (`@google/genai`) with `gemini-3.8-flash` on Express backend
- **Document Processing:** `pdf-parse` with file magic-byte validation

---

## 4. Architecture

```
React + Vite Frontend (JSX)
        │
        │ HTTP / Cookies (SameSite=Lax, HttpOnly)
        ▼
Node.js + Express Backend
        │
        ├─ PostgreSQL Database (pg / pglite)
        ├─ Private Document Storage (/storage/documents/)
        ├─ Server-Side Gemini API (@google/genai)
        └─ PDF Text & Analyte Extraction Engine
```

The frontend never connects directly to PostgreSQL or calls the Gemini API directly. All database access, AI queries, and document file transfers pass through the authenticated Express API layer.

---

## 5. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Server Port
PORT=3000

# Environment Mode
NODE_ENV=development

# Gemini API Key (Server-side only)
GEMINI_API_KEY="your-gemini-api-key"

# Gemini Model Alias
GEMINI_MODEL="gemini-3.8-flash"

# Session Secret (random 32+ character string)
SESSION_SECRET="medscan-super-secure-session-secret-key-32chars"

# Optional External PostgreSQL Connection (Neon, Cloud SQL, Local)
# If left empty, an embedded PostgreSQL instance is automatically used.
DATABASE_URL=""
```

---

## 6. Local Development & Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Dev Server (runs Express + Vite unified on port 3000):**
   ```bash
   npm run dev
   ```

3. **Open the Application:**
   Visit `http://localhost:3000` in your browser.

4. **Demo Account Credentials:**
   - **Email:** `preciousifeanyichukwu64@gmail.com`
   - **Password:** `Password123!`
   *(Or click the "Fill Demo" button on the Sign In page for one-click access)*

---

## 7. Testing & Verification

Run the test suite or verify API endpoints:

```bash
# Run unit & validation tests
npm test

# Build production assets
npm run build
```

---

## 8. Clinical & Medical Disclaimer

MedScan is designed solely as an educational and informational tool. It does not provide medical diagnoses, clinical treatment plans, or emergency medical advice. Laboratory reference intervals can vary between testing institutions and patient demographics. Patients should always consult a licensed healthcare professional for clinical interpretation and care.
