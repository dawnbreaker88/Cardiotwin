import sys
import os
import pandas as pd

# Add current dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.predictor import Predictor

def test_risk_scores():
    predictor = Predictor()
    
    # 1. Safe Patient (Young, Good LVEF, No Doxorubicin)
    safe_patient = {
        'age_years': 30,
        'sex_binary': 0,
        'resting_heart_rate_bpm': 65,
        'systolic_bp_mmHg': 110,
        'diastolic_bp_mmHg': 70,
        'heart_rate_variability_rmssd': 80,
        'qtc_interval_ms': 400,
        'baseline_lvef_percent': 65,
        'chemo_cycles_count': 0,
        'dose_per_cycle_mg_per_m2': 0,
        'cumulative_dose_mg_per_m2': 0
    }

    # 2. Critical Patient (Older, Poor LVEF, High Doxorubicin)
    # Note: These values are estimations to trigger the model's critical path
    critical_patient = {
        'age_years': 65,
        'sex_binary': 1,
        'resting_heart_rate_bpm': 95,
        'systolic_bp_mmHg': 160,
        'diastolic_bp_mmHg': 95,
        'heart_rate_variability_rmssd': 15,
        'qtc_interval_ms': 500,
        'baseline_lvef_percent': 40,
        'chemo_cycles_count': 6,
        'dose_per_cycle_mg_per_m2': 60,
        'cumulative_dose_mg_per_m2': 360
    }

    print("\n--- Testing Risk Score Logic ---")
    
    # Predict Safe
    res_safe = predictor.predict(safe_patient)
    print(f"\nSafe Patient Profile:")
    print(f"  Class: {res_safe.get('class')}")
    print(f"  Confidence: {res_safe.get('confidence'):.4f}")
    print(f"  Risk Score: {res_safe.get('risk_score'):.4f}")

    # Predict Critical
    res_critical = predictor.predict(critical_patient)
    print(f"\nCritical Patient Profile:")
    print(f"  Class: {res_critical.get('class')}")
    print(f"  Confidence: {res_critical.get('confidence'):.4f}")
    print(f"  Risk Score: {res_critical.get('risk_score'):.4f}")

if __name__ == "__main__":
    test_risk_scores()
