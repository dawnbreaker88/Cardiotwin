import joblib
import pandas as pd
import numpy as np
import os

class Predictor:
    def __init__(self):
        # Model path relative to backend/utils/predictor.py
        # backend/utils/../model/cardiotoxicity_model.pkl -> backend/model/...
        # But the model is in ROOT according to plan.md override (or user provided path)
        # User provided: @[../../projects backup/heart-viz-project/cardiotoxicity_model.pkl]
        # which is root.
        
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.model_path = os.path.join(self.base_dir, 'cardiotoxicity_model.pkl')
        
        self.model = None
        self.load_model()
        
        # Define expected features based on plan.md
        self.feature_names = [
            'age_years', 'sex_binary', 'resting_heart_rate_bpm', 
            'systolic_bp_mmHg', 'diastolic_bp_mmHg', 'heart_rate_variability_rmssd', 
            'qtc_interval_ms', 'baseline_lvef_percent', 'chemo_cycles_count', 
            'dose_per_cycle_mg_per_m2', 'cumulative_dose_mg_per_m2'
        ]

    def load_model(self):
        print(f"Loading model from {self.model_path}...")
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print("Model loaded successfully.")
            else:
                print(f"Error: Model file not found at {self.model_path}")
                self.model = None
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None

    def predict(self, features):
        if not self.model:
            return {"error": "Model not loaded"}

        try:
            # Prepare input vector
            data = {}
            for col in self.feature_names:
                # Get from features, default to 0 if missing
                val = features.get(col, 0)
                # Ensure numeric
                try:
                    val = float(val)
                except:
                    val = 0
                data[col] = val
                
            # Create DataFrame
            df = pd.DataFrame([data], columns=self.feature_names)
            
            # Predict
            # LightGBM predict returns array
            prediction = self.model.predict(df)[0]
            
            # Get output probability if available, else just rely on class
            confidence = 0.95 # Default high confidence if not available
            risk_score = 0.0  # Default low risk

            if hasattr(self.model, "predict_proba"):
                probas = self.model.predict_proba(df)[0]
                confidence = np.max(probas)
                
                # Calculate Risk Score (Severity)
                # 0=Safe, 1=Warning, 2=Critical
                # Risk Score = P(Warning)*0.5 + P(Critical)*1.0
                # This ensures:
                # - 100% Safe -> Risk Score 0.0
                # - 100% Warning -> Risk Score 0.5
                # - 100% Critical -> Risk Score 1.0
                if len(probas) >= 3:
                    p_warning = probas[1]
                    p_critical = probas[2]
                    risk_score = (p_warning * 0.5) + (p_critical * 1.0)
                elif len(probas) == 2: # Binary case fallback (Safe vs Critical?)
                    # Assuming 0=Safe, 1=Critical if binary
                    risk_score = probas[1] 
            
            # Map Class to Label
            # 0=Low Risk (Safe), 1=Moderate Risk (Warning), 2=High Risk (Critical)
            risk_map = {0: "Safe", 1: "Warning", 2: "Critical"}
            
            risk_label = "Unknown"
            if isinstance(prediction, (int, np.integer, float, np.floating)):
                risk_label = risk_map.get(int(prediction), "Unknown")
            else:
                risk_label = str(prediction)
                
            return {
                "class": risk_label,
                "confidence": float(confidence),
                "risk_score": float(risk_score)
            }

        except Exception as e:
            print(f"Prediction error: {e}")
            # traceback
            import traceback
            traceback.print_exc()
            return {"error": str(e)}
