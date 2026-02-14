import requests
import json

def test_predict():
    url = 'http://localhost:5000/predict'
    payload = {
        "features": {
            "age_years": 50,
            "resting_heart_rate_bpm": 70
        }
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_predict()
