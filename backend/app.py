from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys

# Add current directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.predictor import Predictor
from utils.mapper import map_risk_to_visuals
from utils.genai_client import genai_client
from utils.patient_service import PatientService

app = Flask(__name__)
CORS(app)

# Initialize Services
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Data is two levels up from backend/app.py? No, app.py is in backend. newdata.csv is in root.
# Root is one level up from backend.
CSV_PATH = os.path.join(BASE_DIR, '../nii.csv') 
# Fallback for differing CWD
if not os.path.exists(CSV_PATH):
    CSV_PATH = os.path.join(BASE_DIR, '../../nii.csv')

predictor = Predictor()
patient_service = PatientService(CSV_PATH)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "cardiotwin-backend"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # data should have 'features' key and 'age' key
        features = data.get('features', {})
        age = data.get('age', features.get('Age', 45))
        
        # 1. Get Prediction
        prediction = predictor.predict(features)
        if "error" in prediction:
            return jsonify({"error": prediction["error"]}), 500
            
        # 2. Map to Visuals
        visuals = map_risk_to_visuals(prediction, age)
        
        response = {
            "prediction": prediction,
            "visuals": visuals
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/patients', methods=['GET'])
def get_patients():
    try:
        # returns {"Safe": [], "Warning": [], "Critical": []}
        data = patient_service.get_all_patient_ids() 
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/patient/<patient_id>', methods=['GET'])
def get_patient_details(patient_id):
    try:
        data = patient_service.get_patient(patient_id)
        if not data:
            return jsonify({"error": "Patient not found"}), 404
            
        # Get prediction for this patient data
        prediction = predictor.predict(data)
        
        # Map visuals
        age = data.get('Age', 45)
        visuals = map_risk_to_visuals(prediction, age)
        
        return jsonify({
            "patient_data": data,
            "prediction": prediction,
            "visuals": visuals
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/config', methods=['POST'])
def configure_api():
    try:
        data = request.json
        api_key = data.get('api_key')
        if not api_key:
            return jsonify({"error": "API Key required"}), 400
            
        genai_client.configure_key(api_key)
        return jsonify({"status": "configured"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-report', methods=['POST'])
def generate_report():
    try:
        data = request.json
        patient_data = data.get('patient_data')
        prediction = data.get('prediction')
        
        if not patient_data or not prediction:
            return jsonify({"error": "Missing data"}), 400
            
        report = genai_client.generate_report(patient_data, prediction)
        return jsonify({"report": report})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        history = data.get('history', [])
        patient_context = data.get('patient_context')
        
        response = genai_client.chat(message, history, patient_context)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
