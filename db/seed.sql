-- Seed data for the Vitalis catalogue + gallery. Safe to re-run.

INSERT INTO products (slug, name, category, short_description, description, price, currency, rating, badge, certifications, specs, sort_order)
VALUES
('vitalis-pulse-pro', 'Vitalis Pulse Pro', 'monitoring',
  'Continuous SpO2 and heart-rate monitor with Bluetooth telemetry.',
  'Hospital-grade fingertip pulse oximeter with continuous logging, Bluetooth 5.2 telemetry and a 36-hour battery.',
  289.00, 'USD', 4.9, 'Best seller', '["CE","FDA listed"]', '{"battery":"36h","accuracy":"+/-2%"}', 10),
('cardioscan-ecg-12', 'CardioScan ECG-12', 'diagnostics',
  '12-lead resting ECG with automated interpretation and PDF export.',
  'Twelve-lead diagnostic ECG with automatic interpretation, HL7 export and a seven-inch capacitive display.',
  1740.00, 'USD', 4.8, 'Clinic grade', '["CE","ISO 13485"]', '{"leads":12,"display":"7in"}', 20),
('aeroflow-neb-x', 'AeroFlow Neb X', 'respiratory',
  'Silent mesh nebuliser with paediatric and adult mask kit.',
  'Vibrating-mesh nebuliser delivering 0.25 ml/min with a 28 dB noise floor and USB-C charging.',
  156.00, 'USD', 4.7, NULL, '["CE"]', '{"noise":"28dB","output":"0.25ml/min"}', 30),
('thermoscan-ir-precision', 'ThermoScan IR Precision', 'diagnostics',
  'Non-contact infrared thermometer, +/-0.2C clinical accuracy.',
  'Clinical infrared thermometer with fever alarm, 32-reading memory and one-second acquisition.',
  98.00, 'USD', 4.6, NULL, '["CE","FDA listed"]', '{"accuracy":"+/-0.2C"}', 40),
('oxyhome-5l-concentrator', 'OxyHome 5L Concentrator', 'respiratory',
  'Home oxygen concentrator, 93% +/-3 purity, 42 dB whisper mode.',
  'Five-litre continuous-flow oxygen concentrator designed for long-term home therapy.',
  1290.00, 'USD', 4.8, 'Home care', '["CE","ISO 13485"]', '{"flow":"5L/min","purity":"93%"}', 50),
('reflex-tens-therapy', 'Reflex TENS Therapy Unit', 'recovery',
  'Dual-channel TENS/EMS unit with eight clinician-set programmes.',
  'Dual-channel neuromuscular stimulation unit with lockable clinician presets.',
  134.00, 'USD', 4.5, NULL, '["CE"]', '{"channels":2,"programmes":8}', 60),
('vitalis-bp-guard', 'Vitalis BP Guard', 'monitoring',
  'Upper-arm blood pressure monitor with AFib detection.',
  'Validated upper-arm BP monitor with irregular-heartbeat detection and two-user memory.',
  119.00, 'USD', 4.7, NULL, '["CE","FDA listed"]', '{"users":2,"memory":120}', 70),
('orthoflex-recovery-brace', 'OrthoFlex Recovery Brace', 'recovery',
  'Post-operative knee brace with graduated range-of-motion lock.',
  'Post-surgical knee brace with 10-degree incremental ROM control and breathable liner.',
  210.00, 'USD', 4.6, NULL, '["CE"]', '{"rom":"0-120deg"}', 80)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO gallery_items (title, caption, category, tone, sort_order) VALUES
('ICU monitoring wall', 'Twelve-bed ICU retrofit', 'deployment', 'from-neon-cyan/30 to-neon-violet/20', 10),
('Pulse Pro line', 'Bench calibration of the Pulse Pro series', 'product', 'from-neon-violet/30 to-neon-cyan/10', 20),
('Cold-chain warehouse', 'Temperature-mapped storage, Karachi hub', 'facility', 'from-sky-400/25 to-neon-cyan/10', 30),
('Home-care kit', 'Discharge-to-home respiratory bundle', 'product', 'from-fuchsia-400/25 to-neon-violet/10', 40),
('Diagnostics lab', 'ECG intake and QA station', 'facility', 'from-emerald-300/20 to-neon-cyan/10', 50),
('Rural clinic rollout', 'Six-site vitals deployment', 'deployment', 'from-indigo-400/25 to-neon-violet/10', 60),
('Sterile packaging', 'Consumables packed to ISO 11607', 'facility', 'from-cyan-300/25 to-blue-500/10', 70),
('Recovery range', 'OrthoFlex bracing photography set', 'product', 'from-purple-400/25 to-neon-cyan/10', 80)
ON CONFLICT DO NOTHING;
