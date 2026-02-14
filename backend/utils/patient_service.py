import pandas as pd
import os
import json
from datetime import datetime

class PatientService:
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.history_path = os.path.join(os.path.dirname(csv_path), 'assessment_history.csv')
        self.df = None
        self.load_data()

    def load_data(self):
        try:
            if os.path.exists(self.csv_path):
                self.df = pd.read_csv(self.csv_path)
                
                # Check if this is the new demo data
                if 'risk_label' in self.df.columns:
                    print("PatientService: Detected demo data schema.")
                    
                    # Ensure Patient_ID exists and is persistent
                    if 'Patient_ID' not in self.df.columns:
                        print("PatientService: Adding Patient_ID column to demo data.")
                        self.df.insert(0, 'Patient_ID', [f'P{i+1:03d}' for i in range(len(self.df))])
                        # Save immediately to make it persistent
                        self.df.to_csv(self.csv_path, index=False)
                    
                    # 2. Map Columns to Predictor Schema
                    demo_map = {
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
                        'cumulative_dose': 'cumulative_dose_mg_per_m2'
                    }
                    self.df = self.df.rename(columns=demo_map)
                    
                    # 3. Map Risk Label to Status_Label
                    risk_map = {
                        'Low': 'Safe',
                        'Moderate': 'Warning',
                        'High': 'Critical'
                    }
                    self.df['Status_Label'] = self.df['risk_label'].map(risk_map).fillna('Safe')

                else:
                    # Legacy Schema Support
                    # Standardize columns to match what frontend expects/what we used in training
                    column_map = {
                        'Heart_Wall_Thickness (mm)': 'Heart_Wall_Thickness_mm',
                        'Dose_Administered (mg/m2)': 'Dose_Administered_mg_m2',
                        'ECG_QRS_Width (ms)': 'ECG_QRS_Width_ms',
                        'Blood_Oxygen (SpO2)': 'Blood_Oxygen_SpO2',
                        'Blood_Pressure (mmHg)': 'Blood_Pressure_mmHg'
                    }
                    self.df = self.df.rename(columns=column_map)
                    
                    # Parse Blood Pressure if exists
                    if 'Blood_Pressure_mmHg' in self.df.columns and self.df['Blood_Pressure_mmHg'].dtype == object:
                        try:
                            self.df[['BP_Systolic', 'BP_Diastolic']] = self.df['Blood_Pressure_mmHg'].str.split('/', expand=True).astype(float)
                        except Exception as e:
                            print(f"PatientService: Error parsing BP: {e}")
                
                print(f"PatientService: Loaded {len(self.df)} records.")
            else:
                print(f"PatientService: File not found at {self.csv_path}")
        except Exception as e:
            print(f"PatientService: Error loading data: {e}")

    def get_patient(self, patient_id):
        if self.df is None:
            return None
        
        patient = self.df[self.df['Patient_ID'] == patient_id]
        if not patient.empty:
            # Convert to dictionary and handle NaN
            data = patient.iloc[0].to_dict()
            return data
        return None

    def get_all_patient_ids(self):
        if self.df is None:
            return {"Safe": [], "Warning": [], "Critical": []}
        
        # Group IDs by Status_Label
        safe_mask = self.df['Status_Label'].isin(['Safe', 'Low Risk', 'Low'])
        warning_mask = self.df['Status_Label'].isin(['Warning', 'Med Risk', 'Moderate'])
        critical_mask = self.df['Status_Label'].isin(['CRITICAL_STOP', 'High Risk', 'Critical', 'High'])
        
        safe_ids = self.df[safe_mask]['Patient_ID'].unique().tolist()
        warning_ids = self.df[warning_mask]['Patient_ID'].unique().tolist()
        critical_ids = self.df[critical_mask]['Patient_ID'].unique().tolist()
        
        return {
            "Safe": safe_ids,
            "Warning": warning_ids,
            "Critical": critical_ids
        }

    def save_assessment(self, patient_data, prediction, visuals):
        """Saves an assessment to the history CSV."""
        assessment = {
            "assessment_id": f"AST-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "timestamp": datetime.now().isoformat(),
            "patient_id": patient_data.get('Patient_ID', 'UNKNOWN'),
            "risk_level": prediction.get('class', 'Safe'),
            "risk_score": visuals.get('risk_score', 0),
            "input_data": json.dumps(patient_data),
            "prediction_details": json.dumps(prediction)
        }
        
        df_new = pd.DataFrame([assessment])
        
        if not os.path.exists(self.history_path):
            df_new.to_csv(self.history_path, index=False)
        else:
            df_new.to_csv(self.history_path, mode='a', header=False, index=False)
            
        return assessment

    def get_history(self, limit=50):
        """Retrieves past assessments."""
        if not os.path.exists(self.history_path):
            return []
            
        try:
            df_history = pd.read_csv(self.history_path)
            # Convert JSON strings back to dicts if needed for frontend, 
            # but usually frontend handles the display.
            # Return most recent first
            return df_history.sort_values(by='timestamp', ascending=False).head(limit).to_dict(orient='records')
        except Exception as e:
            print(f"PatientService: Error loading history: {e}")
            return []

    def get_stats(self):
        """Returns summary statistics for the dashboard."""
        stats = {
            "total_patients": len(self.df) if self.df is not None else 0,
            "high_risk": 0,
            "avg_risk": 0,
            "recent_trend": []
        }
        
        if not os.path.exists(self.history_path):
            return stats
            
        try:
            df_h = pd.read_csv(self.history_path)
            if df_h.empty:
                return stats
                
            total = len(df_h['patient_id'].unique())
            high_risk = len(df_h[df_h['risk_level'] == 'Critical'])
            avg_risk = df_h['risk_score'].mean()
            
            # Simple trend: count per day for last 7 days
            df_h['date'] = pd.to_datetime(df_h['timestamp']).dt.strftime('%m-%d')
            trend = df_h.groupby('date').size().reset_index(name='count').tail(7).to_dict(orient='records')
            
            return {
                "total_patients": total,
                "high_risk": high_risk,
                "avg_risk": round(avg_risk * 100, 1),
                "recent_trend": trend
            }
        except Exception as e:
            print(f"PatientService: Error calculating stats: {e}")
            return stats

    def register_patient(self, patient_data):
        """Adds a new patient to the main dataset."""
        try:
            if self.df is None:
                return False

            # Check actual CSV header to be absolutely sure of column count/order
            header_df = pd.read_csv(self.csv_path, nrows=0)
            cols = header_df.columns.tolist()
            
            # Map frontend names to demo schema if needed
            is_demo = 'risk_label' in cols
            
            if is_demo:
                # Mapping from internal/frontend names back to demo CSV names
                mapping = {
                    'Patient_ID': patient_data.get('Patient_ID', f'P{len(self.df)+1:03d}'),
                    'age': patient_data.get('age_years', 45),
                    'sex': patient_data.get('sex_binary', 0),
                    'resting_hr': patient_data.get('resting_heart_rate_bpm', 70),
                    'systolic_bp': patient_data.get('systolic_bp_mmHg', 120),
                    'diastolic_bp': patient_data.get('diastolic_bp_mmHg', 80),
                    'hrv_rmssd': patient_data.get('heart_rate_variability_rmssd', 50),
                    'qtc_baseline': patient_data.get('qtc_interval_ms', 400),
                    'baseline_lvef': patient_data.get('baseline_lvef_percent', 60),
                    'num_cycles': patient_data.get('chemo_cycles_count', 0),
                    'dose_per_cycle': patient_data.get('dose_per_cycle_mg_per_m2', 0),
                    'cumulative_dose': patient_data.get('cumulative_dose_mg_per_m2', 0),
                    'risk_label': 'Low' # Default for registration
                }
                
                # Check for trailing newline in file
                needs_newline = False
                if os.path.exists(self.csv_path):
                    with open(self.csv_path, 'rb') as f:
                        f.seek(0, os.SEEK_END)
                        if f.tell() > 0:
                            f.seek(-1, os.SEEK_END)
                            if f.read(1) != b'\n':
                                needs_newline = True

                # Create a row that strictly follows the header order
                row_data = [mapping.get(col, 0) for col in cols]
                
                # Append to CSV
                with open(self.csv_path, 'a') as f:
                    if needs_newline:
                        f.write('\n')
                    f.write(','.join(map(str, row_data)) + '\n')
            else:
                # Standard mapping (assuming Patient_ID is in header)
                new_row = {col: patient_data.get(col, 0) for col in cols}
                # Overwrite standard values if they differ in the input
                # (e.g. mapping Status_Label from Safe)
                if 'Status_Label' in cols:
                    new_row['Status_Label'] = 'Safe'
                    
                df_new = pd.DataFrame([new_row])[cols] # Ensure column order matches
                df_new.to_csv(self.csv_path, mode='a', header=False, index=False)
            
            # Reload data into memory
            self.load_data()
            return True
        except Exception as e:
            print(f"PatientService: Error registering patient: {e}")
            import traceback
            traceback.print_exc()
            return False
