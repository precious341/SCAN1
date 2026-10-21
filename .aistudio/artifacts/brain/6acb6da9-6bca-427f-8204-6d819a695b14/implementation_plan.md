# MedScan - Phase 1 Architectural Blueprint & Engineering Plan

> **Tagline:** Understand Your Health. With Clarity.  
> **System Status:** Phase 1 Architecture, Schema & System Design Specification. Awaiting user approval to proceed to Phase 2.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The application uses **JavaScript and JSX exclusively** (`.js` and `.jsx`), with an Express backend, PostgreSQL database driver (`pg`), private document storage, and server-side Google GenAI (`gemini-3.8-flash`).

- **Confirmed Decision 1 (Language & Frameworks)**: Pure JavaScript & JSX (`.js` / `.jsx`), React 19 + Vite, Tailwind CSS, Express backend. No TypeScript/TSX, no Supabase, no Firebase.
- **Confirmed Decision 2 (PostgreSQL Persistence)**: Dual-mode connection strategy. When `DATABASE_URL` is provided (e.g., Neon, Cloud SQL, local Postgres), the backend initializes a native `pg.Pool`. In ephemeral preview/testing where no external database is connected, it seamlessly runs an in-process PostgreSQL-compatible storage layer (`@electric-sql/pglite` / WASM Postgres) maintaining identical schema, migrations, and parameterized SQL queries.
- **Confirmed Decision 3 (Document Processing Pipeline)**: Text-based PDFs are parsed via `pdf-parse` with validation of MIME types and magic bytes; scanned lab results and photo uploads are routed to OCR.
- **Confirmed Decision 4 (Synthetic Sample Demonstrations)**: Realistic synthetic reports (Complete Blood Count - CBC, Comprehensive Metabolic Panel - CMP, Lipid Panel) are pre-seeded for immediate testing without exposing real patient records.

---

## 1. Overview & Core Concept

**MedScan** is a clinical-grade medical report management and understanding platform designed for patients and caregivers. It transforms confusing, jargon-heavy laboratory documents into structured, understandable test results with clear reference ranges, plain-language explanations, trend comparisons across historical visits, and doctor-ready discussion questions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MEDSCAN SYSTEM TOPOLOGY                         │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client Browser: Desktop / Tablet / Mobile ]
        │
        │ HTTP / Secure Cookies (SameSite=Lax, HttpOnly)
        ▼
 ┌───────────────────────────────────────────────────────────────────────────┐
 │ Node.js Express Backend (ES Modules, server/index.js)                    │
 │ ├─ Security: Helmet, Rate Limiter, CSRF & File Signature Validation       │
 │ ├─ Session Store: connect-pg-simple / Express Sessions                    │
 │ ├─ Authentication: bcrypt password hashing                               │
 │ ├─ Storage Manager: Private filesystem storage (/storage/documents)      │
 │ ├─ PDF Parser & OCR Pipeline: pdf-parse + Tesseract extraction            │
 │ └─ AI Service: @google/genai (gemini-3.8-flash)                          │
 └───────┬───────────────────────────────┬─────────────────────────┬─────────┘
         │                               │                         │
         ▼                               ▼                         ▼
 ┌─────────────────┐           ┌───────────────────┐     ┌───────────────────┐
 │ PostgreSQL (pg) │           │ Private Document  │     │ Google Gemini API │
 │  Users, Reports,│           │ Storage           │     │ (Server-Side SDK) │
 │  Lab Results,   │           │ (Non-public disk, │     │ Term explanations,│
 │  Chat Messages  │           │  encrypted paths) │     │ Doctor questions  │
 └─────────────────┘           └───────────────────┘     └───────────────────┘
```

---

## 2. User Experience & Visual Design

The UI replicates the approved clinical design language from the specification and design tokens:
- **Design Tokens**:
  - Deep navy: `#123047`
  - Dark navy: `#0B2235`
  - Medical teal: `#168C91`
  - Light teal: `#E8F5F5`
  - Page background: `#F4F7FA`
  - Border: `#DCE5EC`
  - Primary text: `#263746`
  - Secondary text: `#697B89`
  - Success: `#237A57` (`#DEF7EC` background)
  - Warning: `#B7791F` (`#FEF3C7` background)
  - Error: `#B42318` (`#FEE2E2` background)
- **Top Bar & Navigation**: Fixed 1-line top bar with clean wordmark, whitespace-nowrap links, and primary CTA.
- **Hospital Dashboard**: 240px navy left sidebar (`Dashboard`, `Upload Report`, `My Reports`, `Compare Reports`, `Medical Assistant`, `Profile`, `Settings`), user profile header with quick action cards, recent report status table, and recent activity timeline.
- **Report Analysis & Comparison**: Structured tabular laboratory view showing Test Name, Result Value, Unit, Reference Range, and Status (`Normal`, `Low`, `High`), paired with AI explanation cards and clinician question generator.
- **Assistant Chat**: Multi-conversation sidebar, report selector chips, clear user/assistant message bubbles, suggested follow-up chips, and mandatory clinical disclaimers.

---

## 3. Folder Structure (JavaScript & JSX)

```
medscan/
├── public/
│   ├── favicon.svg
│   └── site.webmanifest
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopHeader.jsx
│   │   │   └── Footer.jsx
│   │   ├── dashboard/
│   │   │   ├── QuickActionCard.jsx
│   │   │   ├── RecentReportsTable.jsx
│   │   │   └── RecentActivityList.jsx
│   │   ├── reports/
│   │   │   ├── FileUploadZone.jsx
│   │   │   ├── ResultsTable.jsx
│   │   │   ├── ExplanationCard.jsx
│   │   │   └── ReportComparisonTable.jsx
│   │   └── assistant/
│   │       ├── ConversationSidebar.jsx
│   │       ├── ChatMessage.jsx
│   │       └── QuestionPrompts.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ReportContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useReports.js
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── UploadReportPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── ReportDetailsPage.jsx
│   │   ├── CompareReportsPage.jsx
│   │   ├── AssistantPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── formatters.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── reportController.js
│   │   ├── analysisController.js
│   │   ├── assistantController.js
│   │   └── profileController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── assistantRoutes.js
│   │   └── profileRoutes.js
│   ├── services/
│   │   ├── geminiService.js
│   │   ├── pdfExtractionService.js
│   │   └── storageService.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── fileValidationMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── database/
│   │   ├── db.js
│   │   ├── migrate.js
│   │   └── seed.js
│   ├── validators/
│   │   └── schemas.js
│   ├── app.js
│   └── index.js
├── database/
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_reports.sql
│   │   ├── 003_create_results.sql
│   │   ├── 004_create_analysis.sql
│   │   └── 005_create_conversations.sql
│   └── seeds/
│       └── demo_reports.sql
├── storage/
│   └── documents/
│       └── .gitkeep
├── tests/
│   ├── unit/
│   ├── integration/
│   └── api.test.js
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── vite.config.js
└── README.md
```

---

## 4. PostgreSQL Database Schema & Relationships

### Entity Relationship Model

```
 ┌──────────────────────┐         1:N         ┌─────────────────────────┐
 │        users         │ ──────────────────< │     medical_reports     │
 ├──────────────────────┤                     ├─────────────────────────┤
 │ id (UUID PK)         │                     │ id (UUID PK)            │
 │ full_name (VARCHAR)  │                     │ user_id (UUID FK)       │
 │ email (VARCHAR UNIQ) │                     │ title (VARCHAR)         │
 │ password_hash (TEXT) │                     │ file_path (TEXT)        │
 │ created_at (TIMESTAM)│                     │ file_size (INT)         │
 │ updated_at (TIMESTAM)│                     │ mime_type (VARCHAR)     │
 └──────────┬───────────┘                     │ report_date (DATE)      │
            │                                 │ status (VARCHAR)        │
            │ 1:N                             │ raw_text (TEXT)         │
            │                                 │ created_at (TIMESTAMP)  │
            ▼                                 └───────────┬─────────────┘
 ┌──────────────────────┐                                 │
 │    conversations     │                                 │ 1:N
 ├──────────────────────┤                                 ▼
 │ id (UUID PK)         │                     ┌─────────────────────────┐
 │ user_id (UUID FK)    │                     │  extracted_test_results │
 │ report_id (UUID FK)  │                     ├─────────────────────────┤
 │ title (VARCHAR)      │                     │ id (UUID PK)            │
 │ created_at (TIMESTAM)│                     │ report_id (UUID FK)     │
 └──────────┬───────────┘                     │ test_name (VARCHAR)     │
            │                                 │ result_value (NUMERIC)  │
            │ 1:N                             │ unit (VARCHAR)          │
            ▼                                 │ ref_range_low (NUMERIC) │
 ┌──────────────────────┐                     │ ref_range_high (NUMERIC)│
 │    chat_messages     │                     │ flag (normal/low/high)  │
 ├──────────────────────┤                     │ created_at (TIMESTAMP)  │
 │ id (UUID PK)         │                     └───────────┬─────────────┘
 │ conversation_id (FK) │                                 │
 │ sender (user/ai)     │                                 │ 1:1
 │ message (TEXT)       │                                 ▼
 │ sources (JSONB)      │                     ┌─────────────────────────┐
 │ created_at (TIMESTAM)│                     │    analysis_records     │
 └──────────────────────┘                     ├─────────────────────────┤
                                              │ id (UUID PK)            │
                                              │ report_id (UUID FK)     │
                                              │ summary (TEXT)          │
                                              │ clinical_context (TEXT) │
                                              │ questions_for_doc(JSONB)│
                                              │ disclaimer_acknowledged │
                                              │ created_at (TIMESTAMP)  │
                                              └─────────────────────────┘
```

### Table Definitions:

1. **`users`**
   - `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `full_name`: VARCHAR(255) NOT NULL
   - `email`: VARCHAR(255) UNIQUE NOT NULL (indexed)
   - `password_hash`: VARCHAR(255) NOT NULL
   - `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   - `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

2. **`medical_reports`**
   - `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `user_id`: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE (indexed)
   - `title`: VARCHAR(255) NOT NULL
   - `original_filename`: VARCHAR(255) NOT NULL
   - `stored_filename`: VARCHAR(255) NOT NULL UNIQUE
   - `file_size`: INTEGER NOT NULL
   - `mime_type`: VARCHAR(100) NOT NULL
   - `report_date`: DATE
   - `status`: VARCHAR(50) NOT NULL CHECK (status IN ('uploaded', 'processing', 'completed', 'failed'))
   - `error_message`: TEXT
   - `raw_text`: TEXT
   - `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

3. **`extracted_test_results`**
   - `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `report_id`: UUID NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE (indexed)
   - `test_name`: VARCHAR(255) NOT NULL
   - `category`: VARCHAR(100)
   - `result_value`: VARCHAR(50) NOT NULL
   - `numeric_value`: NUMERIC(10, 4)
   - `unit`: VARCHAR(50)
   - `reference_range`: VARCHAR(100)
   - `ref_range_low`: NUMERIC(10, 4)
   - `ref_range_high`: NUMERIC(10, 4)
   - `flag`: VARCHAR(20) CHECK (flag IN ('normal', 'low', 'high', 'abnormal', 'unknown'))
   - `notes`: TEXT
   - `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

4. **`analysis_records`**
   - `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `report_id`: UUID NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE UNIQUE
   - `plain_language_summary`: TEXT NOT NULL
   - `key_findings`: JSONB NOT NULL DEFAULT '[]'::jsonb
   - `questions_for_clinician`: JSONB NOT NULL DEFAULT '[]'::jsonb
   - `citations`: JSONB DEFAULT '[]'::jsonb
   - `model_version`: VARCHAR(50) NOT NULL
   - `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

5. **`conversations`**
   - `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `user_id`: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE (indexed)
   - `report_id`: UUID REFERENCES medical_reports(id) ON DELETE SET NULL
   - `title`: VARCHAR(255) NOT NULL
   - `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   - `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

6. **`chat_messages`**
   - `id`: UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - `conversation_id`: UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE (indexed)
   - `sender_role`: VARCHAR(20) NOT NULL CHECK (sender_role IN ('user', 'assistant'))
   - `message_text`: TEXT NOT NULL
   - `supporting_sources`: JSONB DEFAULT '[]'::jsonb
   - `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

---

## 5. Backend API Endpoint Plan

All endpoints communicate via JSON responses with standard schemas: `{ success: true, data: ... }` or `{ success: false, error: { message, code } }`.

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Create user account, hash password with bcrypt (salt factor 12), establish session.
- `POST /api/auth/login`: Authenticate email and password, issue HTTP-only cookie.
- `POST /api/auth/logout`: Destroy session and clear cookie.
- `GET /api/auth/me`: Return authenticated user info (never password hash).
- `POST /api/auth/forgot-password`: Validate email; return explicit availability message regarding SMTP delivery.

### Medical Reports (`/api/reports`)
- `POST /api/reports/upload`: Multi-part document upload (`multer` with memory/temporary disk validation, MIME + magic bytes inspection).
- `GET /api/reports`: List user's medical reports with processing statuses and dates.
- `GET /api/reports/:id`: Get full report details, extracted lab results, and analysis.
- `GET /api/reports/:id/results`: Get structured test results table.
- `GET /api/reports/:id/download`: Authenticated, ownership-validated secure file download.
- `DELETE /api/reports/:id`: Safely delete report record, extracted rows, and private disk file.
- `GET /api/reports/compare`: Compare 2 or more reports by matching test names and compatible units over time.

### Analysis & AI (`/api/analysis`)
- `POST /api/analysis/:reportId/start`: Trigger/retry Gemini analysis on extracted test data.
- `GET /api/analysis/:reportId`: Retrieve explanation cards, plain language summary, and questions for doctor.

### Medical Assistant (`/api/assistant`)
- `GET /api/assistant/conversations`: List user's chat threads.
- `POST /api/assistant/conversations`: Create a new conversation thread (optionally scoped to a report).
- `GET /api/assistant/conversations/:id/messages`: Retrieve conversation history.
- `POST /api/assistant/conversations/:id/messages`: Send user query, call Gemini with report context and medical instructions, stream/return response.
- `DELETE /api/assistant/conversations/:id`: Delete conversation and messages.

### User Profile & System (`/api/profile`, `/api/health`)
- `GET /api/profile`: Retrieve profile information.
- `PUT /api/profile`: Update allowed user profile fields (e.g., name).
- `GET /api/health`: Check server and database health status.

---

## 6. Security & Privacy Architecture

1. **Authentication & Sessions**:
   - Passwords hashed using `bcrypt` (12 rounds).
   - Server-side sessions using `express-session` with `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, and strong random `SESSION_SECRET`.
   - Never store JWTs or tokens in browser `localStorage`.
2. **Private File Storage**:
   - Files stored outside the web root in `/storage/documents/`.
   - Original filenames sanitized; stored under randomized UUIDs (`uuid.v4() + path.extname(name)`).
   - Directory traversal (`../`) strictly prevented.
   - Files are served only through an authenticated controller verifying `user_id = req.session.userId`.
3. **Input Validation & SQL Safety**:
   - All parameters sanitized and validated using schema validators.
   - All database queries use parameterized SQL (`$1, $2, ...`) via `pg`. Zero string concatenation.
4. **Rate Limiting & Headers**:
   - `express-rate-limit` on `/api/auth/*` (prevent brute-force attacks) and `/api/reports/upload` (prevent storage exhaustion).
   - `helmet` security headers for Content-Security-Policy, anti-clickjacking (`X-Frame-Options`), and MIME sniffing prevention.

---

## 7. Document Processing & OCR Approach

1. **Upload Validation**:
   - Max file size: 10MB.
   - Permitted formats: `application/pdf`, `image/png`, `image/jpeg`.
   - Verification of magic file headers (e.g. `%PDF` for PDF, `\x89PNG` for PNG).
2. **Digital PDF Extraction**:
   - Processed with `pdf-parse` to extract raw text, page structure, and line sequences.
3. **Structured Entity Parsing**:
   - Regex and rule-based parser scans text for clinical lab patterns:
     - Standard test names: Hemoglobin, WBC, RBC, Platelets, Glucose, Creatinine, AST, ALT, Cholesterol, etc.
     - Units: `g/dL`, `10^9/L`, `mg/dL`, `U/L`, `mmol/L`, `%`, etc.
     - Reference ranges: `[low - high]` or `< max` or `> min`.
   - Normal/High/Low evaluation compares numeric values against stated reference ranges without diagnosing disease.
4. **Scanned Images & OCR Fallback**:
   - When a PDF contains no embedded text or an image is uploaded, the OCR pipeline (Tesseract.js) extracts textual content.
   - If extraction confidence is low, the status is marked as completed with extraction warnings, prompting user review.

---

## 8. Gemini API Integration

1. **Server-Side Integration**:
   - SDK: `@google/genai` with model `gemini-3.8-flash`.
   - Header: `httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }`.
   - `GEMINI_API_KEY` stays strictly server-side in `process.env.GEMINI_API_KEY`.
2. **Clinical Guardrails & Prompt Engineering**:
   - System instruction enforces:
     - Clear plain-language explanation of what each test measures.
     - Strict disclaimer: "MedScan is an informational tool and does NOT provide medical diagnoses or replace clinical consultations."
     - Contextual preparation of 3–5 informed questions the patient can ask their physician.
     - Highlighting missing clinical context (e.g., fasting status, symptoms, medical history).
3. **Resilience & Graceful Degradation**:
   - If the Gemini API call times out or fails, the report data and raw laboratory extractions remain intact and fully accessible.
   - Meaningful error notification displayed in UI with retry button.

---

## 9. Testing Strategy

1. **Unit & Validation Tests**:
   - Password hashing and verification routines.
   - Medical range evaluation logic (checking values against reference ranges).
   - Filename sanitization and path traversal prevention.
2. **API Integration Tests**:
   - Authentication flow: registration, login, session retention, logout.
   - Protected route authorization: attempting to access another user's report returns 403/404.
   - File upload restrictions: rejecting oversized or malicious file types.
3. **Frontend Component & Accessibility Tests**:
   - Keyboard navigation on tables, modals, and forms.
   - Form error state rendering and responsive layout validation.

---

## 10. Deployment Strategy & Cost Analysis

1. **Deployment Architecture**:
   - Single Node.js server container (Cloud Run or equivalent) serving the built Vite React frontend static assets (`dist/`) and mounting `/api` routes from Express.
   - Single-port unified architecture (`PORT=3000`).
2. **Database Provisioning**:
   - Production connects to managed PostgreSQL (e.g., Cloud SQL or Neon) via `DATABASE_URL`.
   - Zero-config local development/preview automatically falls back to in-process Postgres layer with the identical SQL schema.
3. **Storage Handling**:
   - Document files stored in configured persistent mount or private disk directory.
4. **Estimated Costs**:
   - Gemini 3.8 Flash: Cost-effective tier for text extraction and summaries.
   - Node.js container: Scales to zero when idle.
   - PostgreSQL: Free tier / Developer instance capable.

---

## Technical Assumptions & Confirmations

1. **JavaScript & JSX**: Codebase is written entirely in modern JavaScript (`.js` and `.jsx`) using ES modules. TypeScript is excluded per requirements.
2. **Preview Mode Readiness**: Development server runs seamlessly on port 3000 with Express serving Vite middleware, allowing instant live interaction in AI Studio.
