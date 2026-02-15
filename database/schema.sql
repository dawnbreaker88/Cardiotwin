-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    age_years INTEGER,
    sex_binary INTEGER,
    resting_heart_rate_bpm INTEGER,
    systolic_bp_mmHg INTEGER,
    diastolic_bp_mmHg INTEGER,
    heart_rate_variability_rmssd INTEGER,
    qtc_interval_ms INTEGER,
    baseline_lvef_percent INTEGER,
    chemo_cycles_count INTEGER,
    dose_per_cycle_mg_per_m2 INTEGER,
    cumulative_dose_mg_per_m2 INTEGER,
    status_label TEXT DEFAULT 'Safe'
);

-- Assessments (History) Table
CREATE TABLE IF NOT EXISTS assessments (
    assessment_id TEXT PRIMARY KEY,
    timestamp TEXT,
    patient_id TEXT,
    risk_level TEXT,
    risk_score REAL,
    input_data TEXT, -- JSON string
    prediction_details TEXT, -- JSON string
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);
