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
CSV_PATH = os.path.join(BASE_DIR, '../sample_patient_data_20_labeled.csv') 
# Fallback for differing CWD
if not os.path.exists(CSV_PATH):
    CSV_PATH = os.path.join(BASE_DIR, '../../sample_patient_data_20_labeled.csv')

predictor = Predictor()
patient_service = PatientService(CSV_PATH)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "cardiotwin-backend"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # data should have 'features' key
        features = data.get('features', {})
        # Fallback if features are sent directly
        if not features and 'age_years' in data:
            features = data
            
        age = features.get('age_years', 45)
        
        # 1. Get Prediction
        prediction = predictor.predict(features)
        if "error" in prediction:
            return jsonify({"error": prediction["error"]}), 500
            
        # 2. Map visuals
        visuals = map_risk_to_visuals(prediction, age, features)
        
        # 3. Save to History
        patient_service.save_assessment(features, prediction, visuals)
        
        response = {
            "prediction": prediction,
            "visuals": visuals
        }
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        print(f"Error processing request: {e}")
        traceback.print_exc()
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
        age = data.get('age_years', data.get('Age', 45))
        visuals = map_risk_to_visuals(prediction, age, data)
        
        # 3. Save to History (New: Ensure every analysis, including from DB, is logged)
        patient_service.save_assessment(data, prediction, visuals)
        
        return jsonify({
            "patient_data": data,
            "prediction": prediction,
            "visuals": visuals
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        limit = request.args.get('limit', default=50, type=int)
        history = patient_service.get_history(limit)
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        stats = patient_service.get_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/register-patient', methods=['POST'])
def register_patient():
    try:
        data = request.json
        success = patient_service.register_patient(data)
        if success:
            return jsonify({"status": "success", "message": "Patient registered successfully"})
        else:
            return jsonify({"status": "error", "message": "Failed to register patient"}), 500
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
        mode = data.get('mode', 'patient') # Default to patient
        
        response = genai_client.chat(message, history, patient_context, mode)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
