import pandas as pd
import os
import json
from datetime import datetime
from .db_manager import DBManager

class PatientService:
    def __init__(self, db_path=None):
        # Default to database folder in root
        if db_path is None:
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.db_path = os.path.join(BASE_DIR, 'database', 'heart_viz.db')
        else:
            self.db_path = db_path
            
        self.db = DBManager(self.db_path)
        self.load_data()

    def load_data(self):
        """No longer strictly needed for SQL as we query on demand, 
        but we can use it to verify connection or cache if needed."""
        try:
            # Just verify we can connect/query
            self.db.execute_query("SELECT 1")
            print(f"PatientService: Connected to database at {self.db_path}")
        except Exception as e:
            print(f"PatientService: Error connecting to database: {e}")

    def get_patient(self, patient_id):
        query = "SELECT * FROM patients WHERE patient_id = ?"
        results = self.db.execute_query(query, (patient_id,))
        if results:
            # Result is already a dict thanks to sqlite3.Row
            return results[0]
        return None

    def get_all_patient_ids(self):
        query = "SELECT patient_id, status_label FROM patients"
        results = self.db.execute_query(query)
        
        data = {"Safe": [], "Warning": [], "Critical": []}
        
        if not results:
            return data
            
        for row in results:
            status = row['status_label']
            pid = row['patient_id']
            
            # Map legacy or variant labels
            if status in ['Safe', 'Low Risk', 'Low']:
                data["Safe"].append(pid)
            elif status in ['Warning', 'Med Risk', 'Moderate']:
                data["Warning"].append(pid)
            elif status in ['CRITICAL_STOP', 'High Risk', 'Critical', 'High']:
                data["Critical"].append(pid)
            else:
                data["Safe"].append(pid) # Default
        
        return data

    def save_assessment(self, patient_data, prediction, visuals):
        """Saves an assessment to the history table in SQL."""
        assessment_id = f"AST-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        timestamp = datetime.now().isoformat()
        patient_id = patient_data.get('Patient_ID', patient_data.get('patient_id', 'UNKNOWN'))
        risk_level = prediction.get('class', 'Safe')
        risk_score = visuals.get('risk_score', 0)
        
        # Convert dicts to JSON strings for storage
        input_data_json = json.dumps(patient_data)
        prediction_details_json = json.dumps(prediction)
        
        query = """
            INSERT INTO assessments (
                assessment_id, timestamp, patient_id, risk_level, 
                risk_score, input_data, prediction_details
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        params = (
            assessment_id, timestamp, patient_id, risk_level,
            risk_score, input_data_json, prediction_details_json
        )
        
        self.db.execute_query(query, params, commit=True)
        
        return {
            "assessment_id": assessment_id,
            "timestamp": timestamp,
            "patient_id": patient_id,
            "risk_level": risk_level,
            "risk_score": risk_score
        }

    def get_history(self, limit=50):
        """Retrieves past assessments from SQLite."""
        query = "SELECT * FROM assessments ORDER BY timestamp DESC LIMIT ?"
        results = self.db.execute_query(query, (limit,))
        
        if not results:
            return []
            
        # Optional: parse JSON strings back to dicts if frontend needs them
        # For now, keeping as is to match CSV behavior (where they were JSON strings in CSV)
        return results

    def get_stats(self):
        """Returns summary statistics from the database."""
        try:
            # 1. Total Patients
            total_res = self.db.execute_query("SELECT COUNT(*) as count FROM patients")
            total_patients = total_res[0]['count'] if total_res else 0
            
            # 2. High Risk count
            high_res = self.db.execute_query("SELECT COUNT(*) as count FROM assessments WHERE risk_level = 'Critical'")
            high_risk = high_res[0]['count'] if high_res else 0
            
            # 3. Avg Risk Score
            avg_res = self.db.execute_query("SELECT AVG(risk_score) as avg_score FROM assessments")
            avg_risk = avg_res[0]['avg_score'] if avg_res and avg_res[0]['avg_score'] is not None else 0
            
            # 4. Recent Trend (last 7 days of activity)
            trend_query = """
                SELECT strftime('%m-%d', timestamp) as date, COUNT(*) as count 
                FROM assessments 
                GROUP BY date 
                ORDER BY date DESC 
                LIMIT 7
            """
            trend_res = self.db.execute_query(trend_query)
            trend = sorted(trend_res, key=lambda x: x['date']) if trend_res else []
            
            return {
                "total_patients": total_patients,
                "high_risk": high_risk,
                "avg_risk": round(avg_risk * 100, 1),
                "recent_trend": trend
            }
        except Exception as e:
            print(f"PatientService: Error calculating stats: {e}")
            return {
                "total_patients": 0,
                "high_risk": 0,
                "avg_risk": 0,
                "recent_trend": []
            }

    def register_patient(self, patient_data):
        """Adds a new patient to the SQLite database."""
        try:
            # Mapping from frontend names to DB names
            mapping = {
                'patient_id': patient_data.get('Patient_ID', f"P{datetime.now().strftime('%H%M%S')}"),
                'age_years': patient_data.get('age_years', patient_data.get('age', 45)),
                'sex_binary': patient_data.get('sex_binary', patient_data.get('sex', 0)),
                'resting_heart_rate_bpm': patient_data.get('resting_heart_rate_bpm', patient_data.get('resting_hr', 70)),
                'systolic_bp_mmHg': patient_data.get('systolic_bp_mmHg', patient_data.get('systolic_bp', 120)),
                'diastolic_bp_mmHg': patient_data.get('diastolic_bp_mmHg', patient_data.get('diastolic_bp', 80)),
                'heart_rate_variability_rmssd': patient_data.get('heart_rate_variability_rmssd', patient_data.get('hrv_rmssd', 50)),
                'qtc_interval_ms': patient_data.get('qtc_interval_ms', patient_data.get('qtc_baseline', 400)),
                'baseline_lvef_percent': patient_data.get('baseline_lvef_percent', patient_data.get('baseline_lvef', 60)),
                'chemo_cycles_count': patient_data.get('chemo_cycles_count', patient_data.get('num_cycles', 0)),
                'dose_per_cycle_mg_per_m2': patient_data.get('dose_per_cycle_mg_per_m2', patient_data.get('dose_per_cycle', 0)),
                'cumulative_dose_mg_per_m2': patient_data.get('cumulative_dose_mg_per_m2', patient_data.get('cumulative_dose', 0)),
                'status_label': 'Safe'
            }
            
            cols = list(mapping.keys())
            placeholders = ', '.join(['?'] * len(cols))
            query = f"INSERT INTO patients ({', '.join(cols)}) VALUES ({placeholders})"
            params = tuple(mapping.values())
            
            self.db.execute_query(query, params, commit=True)
            return True
        except Exception as e:
            print(f"PatientService: Error registering patient: {e}")
            import traceback
            traceback.print_exc()
            return False
