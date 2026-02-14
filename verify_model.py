import joblib
import pandas as pd
import numpy as np
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

def verify():
    model_path = r'c:\Users\Prabhath\projects backup\heart-viz-project\cardiotoxicity_model.pkl'
    try:
        print(f"Loading model from {model_path}...")
        model = joblib.load(model_path)
        print("Model loaded successfully.")
        
        # Define features based on plan.md
        feature_names = [
            'age_years', 'sex_binary', 'resting_heart_rate_bpm', 
            'systolic_bp_mmHg', 'diastolic_bp_mmHg', 'heart_rate_variability_rmssd', 
            'qtc_interval_ms', 'baseline_lvef_percent', 'chemo_cycles_count', 
            'dose_per_cycle_mg_per_m2', 'cumulative_dose_mg_per_m2'
        ]
        
        # Create dummy data
        dummy_data = pd.DataFrame([np.zeros(len(feature_names))], columns=feature_names)
        
        # Fill with some reasonable values
        dummy_data['age_years'] = 50
        dummy_data['systolic_bp_mmHg'] = 120
        dummy_data['diastolic_bp_mmHg'] = 80
        dummy_data['resting_heart_rate_bpm'] = 70
        dummy_data['baseline_lvef_percent'] = 60
        
        print("Predicting with dummy data:")
        print(dummy_data)
        
        prediction = model.predict(dummy_data)
        print(f"Prediction: {prediction}")
        
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(dummy_data)
            print(f"Probabilities: {proba}")
            
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify()
