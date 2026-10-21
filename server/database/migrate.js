import { query } from './db.js';
import bcrypt from 'bcryptjs';

export async function runMigrations() {
  console.log('[Database] Running schema migrations...');

  // Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Medical reports table
  await query(`
    CREATE TABLE IF NOT EXISTS medical_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      original_filename VARCHAR(255) NOT NULL,
      stored_filename VARCHAR(255) NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      report_date DATE,
      status VARCHAR(50) NOT NULL DEFAULT 'uploaded',
      error_message TEXT,
      raw_text TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Extracted laboratory results table
  await query(`
    CREATE TABLE IF NOT EXISTS extracted_test_results (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE,
      test_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      result_value VARCHAR(100) NOT NULL,
      numeric_value NUMERIC(12, 4),
      unit VARCHAR(50),
      reference_range VARCHAR(100),
      ref_range_low NUMERIC(12, 4),
      ref_range_high NUMERIC(12, 4),
      flag VARCHAR(20) DEFAULT 'normal',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // AI analysis records table
  await query(`
    CREATE TABLE IF NOT EXISTS analysis_records (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE,
      plain_language_summary TEXT NOT NULL,
      key_findings TEXT NOT NULL,
      questions_for_clinician TEXT NOT NULL,
      citations TEXT,
      model_version VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Conversations table
  await query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      report_id TEXT REFERENCES medical_reports(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Chat messages table
  await query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_role VARCHAR(20) NOT NULL,
      message_text TEXT NOT NULL,
      supporting_sources TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('[Database] Migrations applied successfully.');

  // Check if demo user exists, if not seed demo user and synthetic reports
  await seedDemoData();
}

async function seedDemoData() {
  const { rows } = await query('SELECT id FROM users LIMIT 1');
  if (rows.length > 0) {
    return; // Already seeded
  }

  console.log('[Database] Seeding demo user and synthetic clinical records...');
  const demoUserId = 'usr_demo_precious_01';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  await query(
    `INSERT INTO users (id, full_name, email, password_hash)
     VALUES ($1, $2, $3, $4)`,
    [demoUserId, 'Precious Ifeanyi', 'preciousifeanyichukwu64@gmail.com', passwordHash]
  );

  // Seed Report 1: Complete Blood Count (CBC)
  const rep1Id = 'rep_demo_cbc_01';
  await query(
    `INSERT INTO medical_reports (id, user_id, title, original_filename, stored_filename, file_size, mime_type, report_date, status, raw_text)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      rep1Id,
      demoUserId,
      'Complete Blood Count (CBC)',
      'CBC_Lab_Report_Oct2025.pdf',
      'demo_cbc_report.pdf',
      128450,
      'application/pdf',
      '2025-10-16',
      'completed',
      'ST. JUDE HEALTH SYSTEM - CLINICAL PATHOLOGY\nPATIENT: Precious Ifeanyi\nDATE: 2025-10-16\nTEST: Complete Blood Count (CBC)\nWhite Blood Cell (WBC): 6.8 10^9/L (Reference: 4.0 - 11.0)\nRed Blood Cell (RBC): 4.12 10^12/L (Reference: 4.2 - 5.8) [Low]\nHemoglobin (HGB): 11.8 g/dL (Reference: 12.0 - 16.0) [Low]\nHematocrit (HCT): 36.5 % (Reference: 37.0 - 47.0) [Low]\nPlatelets: 230 10^9/L (Reference: 150 - 450)\nMCV: 88.5 fL (Reference: 80 - 100)\nMCH: 28.6 pg (Reference: 27 - 33)'
    ]
  );

  // Extracted results for CBC
  const cbcResults = [
    { name: 'White Blood Cell (WBC)', val: '6.8', num: 6.8, unit: '10^9/L', ref: '4.0 - 11.0', low: 4.0, high: 11.0, flag: 'normal' },
    { name: 'Red Blood Cell (RBC)', val: '4.12', num: 4.12, unit: '10^12/L', ref: '4.2 - 5.8', low: 4.2, high: 5.8, flag: 'low' },
    { name: 'Hemoglobin (HGB)', val: '11.8', num: 11.8, unit: 'g/dL', ref: '12.0 - 16.0', low: 12.0, high: 16.0, flag: 'low' },
    { name: 'Hematocrit (HCT)', val: '36.5', num: 36.5, unit: '%', ref: '37.0 - 47.0', low: 37.0, high: 47.0, flag: 'low' },
    { name: 'Platelets', val: '230', num: 230, unit: '10^9/L', ref: '150 - 450', low: 150, high: 450, flag: 'normal' },
    { name: 'Mean Corpuscular Volume (MCV)', val: '88.5', num: 88.5, unit: 'fL', ref: '80.0 - 100.0', low: 80.0, high: 100.0, flag: 'normal' },
    { name: 'Mean Corpuscular Hemoglobin (MCH)', val: '28.6', num: 28.6, unit: 'pg', ref: '27.0 - 33.0', low: 27.0, high: 33.0, flag: 'normal' }
  ];

  for (let i = 0; i < cbcResults.length; i++) {
    const r = cbcResults[i];
    await query(
      `INSERT INTO extracted_test_results 
       (id, report_id, test_name, category, result_value, numeric_value, unit, reference_range, ref_range_low, ref_range_high, flag)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [`res_cbc_${i+1}`, rep1Id, r.name, 'Hematology', r.val, r.num, r.unit, r.ref, r.low, r.high, r.flag]
    );
  }

  // Analysis for CBC
  await query(
    `INSERT INTO analysis_records (id, report_id, plain_language_summary, key_findings, questions_for_clinician, citations, model_version)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      'ans_cbc_01',
      rep1Id,
      'Your Complete Blood Count demonstrates normal white blood cell and platelet counts, indicating a healthy immune defense and blood clotting capability. However, hemoglobin (11.8 g/dL), hematocrit (36.5%), and RBC count (4.12 10^12/L) are slightly below the standard adult reference range. This pattern can be associated with mild anemia, which may stem from nutritional factors such as dietary iron or vitamin levels, or minor blood loss.',
      JSON.stringify([
        'White Blood Cells (6.8 10^9/L) and Platelets (230 10^9/L) are fully within normal reference limits.',
        'Hemoglobin is slightly decreased at 11.8 g/dL (normal range: 12.0 - 16.0 g/dL).',
        'Red blood cell indices (MCV, MCH) are within normal limits, reflecting normocytic red blood cell sizing.'
      ]),
      JSON.stringify([
        'Does my mildly reduced hemoglobin level warrant follow-up ferritin or iron saturation testing?',
        'Could recent dietary changes or minor blood loss explain these subtle findings?',
        'Are there specific nutritional adjustments or supplements you would recommend?'
      ]),
      JSON.stringify([
        { title: 'National Heart, Lung, and Blood Institute - Understanding Blood Tests', url: 'https://www.nhlbi.nih.gov/health/blood-tests' },
        { title: 'Mayo Clinic - Complete Blood Count (CBC)', url: 'https://www.mayoclinic.org/tests-procedures/complete-blood-count/about/pac-20384919' }
      ]),
      'gemini-3.8-flash'
    ]
  );

  // Seed Report 2: Liver Function Test (LFT)
  const rep2Id = 'rep_demo_lft_01';
  await query(
    `INSERT INTO medical_reports (id, user_id, title, original_filename, stored_filename, file_size, mime_type, report_date, status, raw_text)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      rep2Id,
      demoUserId,
      'Liver Function Test',
      'Liver_Panel_Oct2025.pdf',
      'demo_lft_report.pdf',
      98210,
      'application/pdf',
      '2025-10-12',
      'completed',
      'ST. JUDE HEALTH SYSTEM - BIOCHEMISTRY\nPATIENT: Precious Ifeanyi\nDATE: 2025-10-12\nTEST: Comprehensive Hepatic Function Panel\nALT (Alanine Aminotransferase): 24 U/L (Reference: 7 - 56)\nAST (Aspartate Aminotransferase): 22 U/L (Reference: 10 - 40)\nAlkaline Phosphatase: 68 U/L (Reference: 44 - 147)\nTotal Bilirubin: 0.8 mg/dL (Reference: 0.1 - 1.2)\nAlbumin: 4.4 g/dL (Reference: 3.5 - 5.0)\nTotal Protein: 7.2 g/dL (Reference: 6.0 - 8.3)'
    ]
  );

  const lftResults = [
    { name: 'Alanine Aminotransferase (ALT)', val: '24', num: 24, unit: 'U/L', ref: '7 - 56', low: 7, high: 56, flag: 'normal' },
    { name: 'Aspartate Aminotransferase (AST)', val: '22', num: 22, unit: 'U/L', ref: '10 - 40', low: 10, high: 40, flag: 'normal' },
    { name: 'Alkaline Phosphatase (ALP)', val: '68', num: 68, unit: 'U/L', ref: '44 - 147', low: 44, high: 147, flag: 'normal' },
    { name: 'Total Bilirubin', val: '0.8', num: 0.8, unit: 'mg/dL', ref: '0.1 - 1.2', low: 0.1, high: 1.2, flag: 'normal' },
    { name: 'Albumin', val: '4.4', num: 4.4, unit: 'g/dL', ref: '3.5 - 5.0', low: 3.5, high: 5.0, flag: 'normal' },
    { name: 'Total Protein', val: '7.2', num: 7.2, unit: 'g/dL', ref: '6.0 - 8.3', low: 6.0, high: 8.3, flag: 'normal' }
  ];

  for (let i = 0; i < lftResults.length; i++) {
    const r = lftResults[i];
    await query(
      `INSERT INTO extracted_test_results 
       (id, report_id, test_name, category, result_value, numeric_value, unit, reference_range, ref_range_low, ref_range_high, flag)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [`res_lft_${i+1}`, rep2Id, r.name, 'Hepatic', r.val, r.num, r.unit, r.ref, r.low, r.high, r.flag]
    );
  }

  // Seed Report 3: Kidney Function Test
  const rep3Id = 'rep_demo_kft_01';
  await query(
    `INSERT INTO medical_reports (id, user_id, title, original_filename, stored_filename, file_size, mime_type, report_date, status, raw_text)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      rep3Id,
      demoUserId,
      'Kidney Function Test',
      'Renal_Panel_Oct2025.pdf',
      'demo_kft_report.pdf',
      112000,
      'application/pdf',
      '2025-10-10',
      'completed',
      'ST. JUDE HEALTH SYSTEM - RENAL FUNCTION\nPATIENT: Precious Ifeanyi\nDATE: 2025-10-10\nTEST: Renal Function Profile\nBlood Urea Nitrogen (BUN): 14 mg/dL (Reference: 7 - 20)\nCreatinine: 0.9 mg/dL (Reference: 0.6 - 1.2)\neGFR: > 90 mL/min/1.73m2 (Reference: >= 60)\nSodium: 140 mmol/L (Reference: 136 - 145)\nPotassium: 4.2 mmol/L (Reference: 3.5 - 5.1)'
    ]
  );

  const kftResults = [
    { name: 'Blood Urea Nitrogen (BUN)', val: '14', num: 14, unit: 'mg/dL', ref: '7 - 20', low: 7, high: 20, flag: 'normal' },
    { name: 'Serum Creatinine', val: '0.9', num: 0.9, unit: 'mg/dL', ref: '0.6 - 1.2', low: 0.6, high: 1.2, flag: 'normal' },
    { name: 'eGFR', val: '98', num: 98, unit: 'mL/min/1.73m2', ref: '>= 60', low: 60, high: 120, flag: 'normal' },
    { name: 'Sodium', val: '140', num: 140, unit: 'mmol/L', ref: '136 - 145', low: 136, high: 145, flag: 'normal' },
    { name: 'Potassium', val: '4.2', num: 4.2, unit: 'mmol/L', ref: '3.5 - 5.1', low: 3.5, high: 5.1, flag: 'normal' }
  ];

  for (let i = 0; i < kftResults.length; i++) {
    const r = kftResults[i];
    await query(
      `INSERT INTO extracted_test_results 
       (id, report_id, test_name, category, result_value, numeric_value, unit, reference_range, ref_range_low, ref_range_high, flag)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [`res_kft_${i+1}`, rep3Id, r.name, 'Renal', r.val, r.num, r.unit, r.ref, r.low, r.high, r.flag]
    );
  }

  // Seed Report 4: Previous CBC (for comparison demo)
  const rep4Id = 'rep_demo_cbc_prev_01';
  await query(
    `INSERT INTO medical_reports (id, user_id, title, original_filename, stored_filename, file_size, mime_type, report_date, status, raw_text)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      rep4Id,
      demoUserId,
      'Complete Blood Count (Previous)',
      'CBC_Lab_Report_May2025.pdf',
      'demo_cbc_prev.pdf',
      124000,
      'application/pdf',
      '2025-05-14',
      'completed',
      'ST. JUDE HEALTH SYSTEM - CLINICAL PATHOLOGY\nPATIENT: Precious Ifeanyi\nDATE: 2025-05-14\nTEST: Complete Blood Count (CBC)\nWhite Blood Cell (WBC): 6.5 10^9/L (Reference: 4.0 - 11.0)\nRed Blood Cell (RBC): 4.45 10^12/L (Reference: 4.2 - 5.8)\nHemoglobin (HGB): 12.6 g/dL (Reference: 12.0 - 16.0)\nHematocrit (HCT): 38.2 % (Reference: 37.0 - 47.0)\nPlatelets: 245 10^9/L (Reference: 150 - 450)'
    ]
  );

  const cbcPrevResults = [
    { name: 'White Blood Cell (WBC)', val: '6.5', num: 6.5, unit: '10^9/L', ref: '4.0 - 11.0', low: 4.0, high: 11.0, flag: 'normal' },
    { name: 'Red Blood Cell (RBC)', val: '4.45', num: 4.45, unit: '10^12/L', ref: '4.2 - 5.8', low: 4.2, high: 5.8, flag: 'normal' },
    { name: 'Hemoglobin (HGB)', val: '12.6', num: 12.6, unit: 'g/dL', ref: '12.0 - 16.0', low: 12.0, high: 16.0, flag: 'normal' },
    { name: 'Hematocrit (HCT)', val: '38.2', num: 38.2, unit: '%', ref: '37.0 - 47.0', low: 37.0, high: 47.0, flag: 'normal' },
    { name: 'Platelets', val: '245', num: 245, unit: '10^9/L', ref: '150 - 450', low: 150, high: 450, flag: 'normal' }
  ];

  for (let i = 0; i < cbcPrevResults.length; i++) {
    const r = cbcPrevResults[i];
    await query(
      `INSERT INTO extracted_test_results 
       (id, report_id, test_name, category, result_value, numeric_value, unit, reference_range, ref_range_low, ref_range_high, flag)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [`res_cbc_prev_${i+1}`, rep4Id, r.name, 'Hematology', r.val, r.num, r.unit, r.ref, r.low, r.high, r.flag]
    );
  }

  // Seed Assistant Conversation
  const conv1Id = 'conv_demo_01';
  await query(
    `INSERT INTO conversations (id, user_id, report_id, title)
     VALUES ($1, $2, $3, $4)`,
    [conv1Id, demoUserId, rep1Id, 'About low hemoglobin']
  );

  await query(
    `INSERT INTO chat_messages (id, conversation_id, sender_role, message_text, supporting_sources)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      'msg_demo_01',
      conv1Id,
      'user',
      'What does a low hemoglobin level mean?',
      JSON.stringify([])
    ]
  );

  await query(
    `INSERT INTO chat_messages (id, conversation_id, sender_role, message_text, supporting_sources)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      'msg_demo_02',
      conv1Id,
      'assistant',
      'Hemoglobin is a protein in red blood cells that helps carry oxygen throughout your body. A low hemoglobin level may indicate anemia, which can be caused by different factors such as iron deficiency, chronic illness, or blood loss. Your report shows a hemoglobin level of 11.8 g/dL, which is slightly below the reference range of 12.0 – 16.0 g/dL.\n\n→ This explanation is based on the information in your report and general medical knowledge. It is not a diagnosis. Please discuss these results with your healthcare professional.',
      JSON.stringify([
        { title: 'National Institutes of Health - Hemoglobin', url: 'https://medlineplus.gov/lab-tests/hemoglobin-test/' }
      ])
    ]
  );

  console.log('[Database] Demo data successfully seeded.');
}
