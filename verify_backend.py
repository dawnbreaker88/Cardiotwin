import requests
import json
import time

URL = "http://127.0.0.1:5000/predict"

# Sample 1: Safe (Matches UI Preset)
payload_safe = {
    "Age": 51,
    "Heart_Fibrosis_Index": 0.044,
    "Heart_Wall_Thickness_mm": 9.9,
    "Interval_No": 14,
    "Dose_Administered_mg_m2": 71,
    "ECG_QRS_Width_ms": 90,
    "Blood_Oxygen_SpO2": 98.0,
    "BP_Systolic": 134,
    "BP_Diastolic": 80
}

# Sample 2: Critical (Matches UI Preset)
payload_critical = {
    "Age": 62,
    "Heart_Fibrosis_Index": 0.15,
    "Heart_Wall_Thickness_mm": 9.6,
    "Interval_No": 28,
    "Dose_Administered_mg_m2": 139,
    "ECG_QRS_Width_ms": 132,
    "Blood_Oxygen_SpO2": 88.0,
    "BP_Systolic": 146,
    "BP_Diastolic": 87
}

def test_prediction(name, payload):
    print(f"\n--- Testing {name} Case ---")
    try:
        # App expects { features: {...}, age: ... }
        request_data = {
            "features": payload,
            "age": payload.get("Age", 45)
        }
        response = requests.post(URL, json=request_data, headers={'Content-Type': 'application/json'})
        if response.status_code == 200:
            result = response.json()
            # print("Response:", json.dumps(result, indent=2))
            
            # App.jsx structure: { prediction: { class, confidence, ... }, visuals: ... }
            if 'prediction' in result:
                pred = result['prediction']
                cls = pred.get('class')
                conf = pred.get('confidence')
                probs = pred.get('probabilities')
                print(f"Prediction: {cls} (Confidence: {conf})")
                print(f"Probabilities: {probs}")
                if 'debug_features' in pred:
                    print(f"Debug Features: {json.dumps(pred['debug_features'], indent=2)}")
                    print(f"Received Keys: {pred.get('received_keys')}")
                elif 'debug_features' in result: # If flattened
                     print(f"Debug Features: {json.dumps(result['debug_features'], indent=2)}") 
                     print(f"Received Keys: {result.get('received_keys')}")
            else:
                 # Fallback if structure is flat (it was flat in verify_backend.py before... wait, app.py returns flat dict from predictor FIRST, then maybe wraps it? NO, app.py calls map_risk_to_visuals and merges)
                 if 'class' in result:
                     print(f"Prediction: {result['class']} (Confidence: {result.get('confidence')})")
                 else:
                     print("Unexpected response structure.")
                     print(json.dumps(result, indent=2))
        else:
            print(f"Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection Error: {e}")
        print("Ensure backend is running on port 5000.")

if __name__ == "__main__":
    test_prediction("Safe", payload_safe)
    test_prediction("Critical", payload_critical)
