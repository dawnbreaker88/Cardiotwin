import pandas as pd
import os
import json
import sqlite3
import sys

# Add backend to path so we can import utils
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(BASE_DIR, 'backend'))
from utils.db_manager import DBManager

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(os.path.dirname(__file__), 'heart_viz.db')
PATIENT_CSV = os.path.join(BASE_DIR, 'sample_patient_data_20_labeled.csv')
HISTORY_CSV = os.path.join(BASE_DIR, 'assessment_history.csv')

def migrate(db=None, db_path=DB_PATH):
    if db is None:
        db = DBManager(db_path)
    
    # 1. Migrate Patients
    if os.path.exists(PATIENT_CSV):
        print(f"Migrating patients from {PATIENT_CSV}...")
        df_p = pd.read_csv(PATIENT_CSV)
        
        # Standardize columns (same logic as PatientService)
        if 'risk_label' in df_p.columns:
            if 'Patient_ID' not in df_p.columns:
                df_p.insert(0, 'Patient_ID', [f'P{i+1:03d}' for i in range(len(df_p))])
            
            demo_map = {
                'Patient_ID': 'patient_id',
                'age': 'age_years',
                'sex': 'sex_binary', 
                'resting_hr': 'resting_heart_rate_bpm',
                'systolic_bp': 'systolic_bp_mmHg',
                'diastolic_bp': 'diastolic_bp_mmHg',
                'hrv_rmssd': 'heart_rate_variability_rmssd',
                'qtc_baseline': 'qtc_interval_ms',
                'baseline_lvef': 'baseline_lvef_percent',
                'num_cycles': 'chemo_cycles_count',
                'dose_per_cycle': 'dose_per_cycle_mg_per_m2',
                'cumulative_dose': 'cumulative_dose_mg_per_m2',
                'risk_label': 'status_label'
            }
            df_p = df_p.rename(columns=demo_map)
            
            # Map Risk Label to Status_Label
            risk_map = {
                'Low': 'Safe',
                'Moderate': 'Warning',
                'High': 'Critical'
            }
            df_p['status_label'] = df_p['status_label'].map(risk_map).fillna('Safe')
        
        # Ensure we only have columns that exist in the DB
        db_cols = [
            'patient_id', 'age_years', 'sex_binary', 'resting_heart_rate_bpm',
            'systolic_bp_mmHg', 'diastolic_bp_mmHg', 'heart_rate_variability_rmssd',
            'qtc_interval_ms', 'baseline_lvef_percent', 'chemo_cycles_count',
            'dose_per_cycle_mg_per_m2', 'cumulative_dose_mg_per_m2', 'status_label'
        ]
        
        # Filter and fillna
        df_p = df_p[[c for c in db_cols if c in df_p.columns]]
        for col in db_cols:
            if col not in df_p.columns:
                df_p[col] = None 

        patients_data = [tuple(x) for x in df_p[db_cols].values]
        
        placeholders = ', '.join(['?'] * len(db_cols))
        query = f"INSERT OR REPLACE INTO patients ({', '.join(db_cols)}) VALUES ({placeholders})"
        db.execute_many(query, patients_data)
        print(f"Successfully migrated {len(patients_data)} patients.")

    # 2. Migrate History
    if os.path.exists(HISTORY_CSV):
        print(f"Migrating history from {HISTORY_CSV}...")
        df_h = pd.read_csv(HISTORY_CSV)
        
        df_h = df_h.rename(columns={'patient_id': 'patient_id'}) # Ensure lowercase if needed
        
        db_cols_h = [
            'assessment_id', 'timestamp', 'patient_id', 'risk_level',
            'risk_score', 'input_data', 'prediction_details'
        ]
        
        # Filter and fillna
        df_h = df_h[[c for c in db_cols_h if c in df_h.columns]]
        for col in db_cols_h:
            if col not in df_h.columns:
                df_h[col] = None
                
        history_data = [tuple(x) for x in df_h[db_cols_h].values]
        
        placeholders_h = ', '.join(['?'] * len(db_cols_h))
        query_h = f"INSERT OR REPLACE INTO assessments ({', '.join(db_cols_h)}) VALUES ({placeholders_h})"
        db.execute_many(query_h, history_data)
        print(f"Successfully migrated {len(history_data)} history records.")

if __name__ == "__main__":
    migrate()
