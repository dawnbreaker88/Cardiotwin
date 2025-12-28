import pandas as pd
import os

class PatientService:
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.df = None
        self.load_data()

    def load_data(self):
        try:
            if os.path.exists(self.csv_path):
                self.df = pd.read_csv(self.csv_path)
                # Standardize columns to match what frontend expects/what we used in training
                # Uses same mapping as process_data.py for consistency
                column_map = {
                    'Heart_Wall_Thickness (mm)': 'Heart_Wall_Thickness_mm',
                    'Dose_Administered (mg/m2)': 'Dose_Administered_mg_m2',
                    'ECG_QRS_Width (ms)': 'ECG_QRS_Width_ms',
                    'Blood_Oxygen (SpO2)': 'Blood_Oxygen_SpO2',
                    'Blood_Pressure (mmHg)': 'Blood_Pressure_mmHg'
                }
                self.df = self.df.rename(columns=column_map)
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
        # Status labels in CSV: Safe, Warning, CRITICAL_STOP
        safe_ids = self.df[self.df['Status_Label'] == 'Safe']['Patient_ID'].unique().tolist()
        warning_ids = self.df[self.df['Status_Label'] == 'Warning']['Patient_ID'].unique().tolist()
        # Map CRITICAL_STOP to Critical for frontend consistency if preferred, or keep as is.
        # Let's keep keys simple for Frontend: 'Safe', 'Warning', 'Critical'
        critical_ids = self.df[self.df['Status_Label'] == 'CRITICAL_STOP']['Patient_ID'].unique().tolist()
        
        return {
            "Safe": safe_ids,
            "Warning": warning_ids,
            "Critical": critical_ids
        }
