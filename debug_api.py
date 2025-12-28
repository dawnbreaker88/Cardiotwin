import requests
import json

BASE_URL = "http://localhost:5000"

def test_patients():
    print("\nTesting /api/patients...")
    try:
        res = requests.get(f"{BASE_URL}/api/patients")
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text[:200]}...")
    except Exception as e:
        print(f"Error: {e}")

def test_patient_details():
    print("\nTesting /api/patient/CV-001...")
    try:
        res = requests.get(f"{BASE_URL}/api/patient/CV-001")
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text[:500]}...")
    except Exception as e:
        print(f"Error: {e}")

def test_predict():
    print("\nTesting /predict...")
    data = {
        "features": {
            "Age": 45, "Gender": 1, "Body_Fat_Percentage": 20.0, "Heart_Fibrosis_Index": 0.0,
            "Baseline_Weight_kg": 70, "Heart_Wall_Thickness_mm": 10, "Interval_No": 0,
            "Dose_Administered_mg_m2": 0, "ECG_QRS_Width_ms": 80, "PPG_Peak_Amp_V": 1.0,
            "Blood_Oxygen_SpO2": 98, "BP_Systolic": 120, "BP_Diastolic": 80, "Heart_Rate_BPM": 70
        },
        "age": 45
    }
    try:
        res = requests.post(f"{BASE_URL}/predict", json=data)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text[:500]}...")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    try:
        test_patients()
        test_patient_details()
        test_predict()
    except Exception as e:
        print(f"Global Error: {e}")
