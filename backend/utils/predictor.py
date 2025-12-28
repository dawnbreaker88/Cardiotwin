import joblib
import pandas as pd
import numpy as np
import os

class Predictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.target_encoder = None
        self.feature_names = None
        self.load_artifacts()

    def load_artifacts(self):
        try:
            # Adjust paths as needed based on where app.py runs
            base_path = os.path.dirname(os.path.abspath(__file__))
            model_dir = os.path.join(base_path, '../model')
            
            self.model = joblib.load(os.path.join(model_dir, 'trained_model.pkl'))
            self.scaler = joblib.load(os.path.join(model_dir, 'scaler.pkl'))
            # self.gender_encoder = joblib.load(os.path.join(model_dir, 'gender_encoder.pkl')) # REMOVED for nii.csv
            self.target_encoder = joblib.load(os.path.join(model_dir, 'target_encoder.pkl'))
            self.feature_names = joblib.load(os.path.join(model_dir, 'feature_names.pkl'))
            
            print("Predictor: Model and artifacts loaded successfully.")
            print(f"Predictor: Expected features: {self.feature_names}")
            
        except Exception as e:
            print(f"Predictor: Error loading artifacts: {e}")

    def preprocess_input(self, features_dict):
        """
        Mimics process_data.py preprocessing for a single sample.
        """
        # Create DataFrame from input
        df = pd.DataFrame([features_dict])
        
        # 1. Parse Blood Pressure if present as string "120/80"
        if 'Blood_Pressure_mmHg' in df.columns and isinstance(df.iloc[0]['Blood_Pressure_mmHg'], str):
            try:
                bp = df.iloc[0]['Blood_Pressure_mmHg'].split('/')
                df['BP_Systolic'] = float(bp[0])
                df['BP_Diastolic'] = float(bp[1])
                df = df.drop('Blood_Pressure_mmHg', axis=1)
            except:
                pass
        
        # Ensure 'BP_Systolic' and 'BP_Diastolic' exist if they were not parsed
        if 'BP_Systolic' not in df.columns:
             df['BP_Systolic'] = float(features_dict.get('BP_Systolic', 120))
        if 'BP_Diastolic' not in df.columns:
             df['BP_Diastolic'] = float(features_dict.get('BP_Diastolic', 80))
             
        # 2. Gender Encoding - REMOVED for nii.csv dataset
        
        # 3. Align Columns with Feature Names (fills missing with 0, orders correctly)
        final_df = pd.DataFrame()
        for col in self.feature_names:
            if col in df.columns:
                final_df[col] = df[col]
            else:
                # Default for missing columns
                final_df[col] = 0 
                
        # Ensure numeric types
        final_df = final_df.apply(pd.to_numeric, errors='coerce').fillna(0)
        
        return final_df

    def predict(self, features_dict):
        """
        Args:
            features_dict (dict): Input features from frontend
        Returns:
            dict: {class, probabilities, confidence}
        """
        if not self.model:
            return {"error": "Model not loaded"}
            
        try:
            # Preprocess
            X_df = self.preprocess_input(features_dict)
            
            # Scale
            X_scaled = self.scaler.transform(X_df)
            
            # Predict Probabilities
            proba = self.model.predict_proba(X_scaled)[0]
            
            # --- AGGRESSIVE THRESHOLDING FOR SENSITIVITY ---
            classes = self.target_encoder.classes_ 
            class_to_idx = {cls: idx for idx, cls in enumerate(classes)}
            
            idx_critical = class_to_idx.get('CRITICAL_STOP')
            idx_warning = class_to_idx.get('Warning')
            
            # Defaults
            prediction_idx = np.argmax(proba)
            
            # Thresholds: If Critical > 30%, flag it. If Warning > 40%, flag it.
            if idx_critical is not None and proba[idx_critical] > 0.30:
                prediction_idx = idx_critical
                print(f"Predictor: Triggered Sensitive Critical Threshold (Prob: {proba[idx_critical]:.2f})")
            elif idx_warning is not None and proba[idx_warning] > 0.40:
                prediction_idx = idx_warning
                print(f"Predictor: Triggered Sensitive Warning Threshold (Prob: {proba[idx_warning]:.2f})")
                
            prediction_label = self.target_encoder.inverse_transform([prediction_idx])[0]
            
            # Formulate response
            classes = self.target_encoder.classes_
            prob_dict = {str(classes[i]): float(proba[i]) for i in range(len(classes))}
            
            return {
                'class': prediction_label,
                'probabilities': prob_dict,
                'confidence': float(max(proba))
            }
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"error": str(e)}

# Global instance
predictor = Predictor()
