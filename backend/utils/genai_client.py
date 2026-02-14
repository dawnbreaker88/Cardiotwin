import os
import google.generativeai as genai

import json

class GenAIClient:
    def __init__(self, api_key=None):
        self.config_path = os.path.join(os.path.dirname(__file__), 'config.json')
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        
        # Try loading from config.json if not found
        if not self.api_key:
            try:
                if os.path.exists(self.config_path):
                    with open(self.config_path, 'r') as f:
                        config = json.load(f)
                        self.api_key = config.get('api_key')
            except Exception as e:
                print(f"Error loading config: {e}")

        if not self.api_key:
            print("Warning: GEMINI_API_KEY not found.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-3-flash-preview')

    def configure_key(self, api_key):
        self.api_key = api_key
        # Save to config.json
        try:
            with open(self.config_path, 'w') as f:
                json.dump({'api_key': api_key}, f)
        except Exception as e:
            print(f"Error saving config: {e}")
            
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-3-flash-preview')

    def generate_report(self, patient_data, prediction):
        if not self.model:
            return "Error: API Key not configured."

        # Prepare specific data for prompt
        risk_class = prediction.get('class', 'Safe')
        # Use risk_score (0.0 to 1.0) and confidence (0.0 to 1.0)
        risk_score = prediction.get('risk_score', 0.0)
        confidence = prediction.get('confidence', 0.0)

        prompt = f"""
        You are an advanced AI Onco-Cardiology Assistant named CardioTwin. 
        Your goal is to analyze Chemotherapy-Induced Cardiotoxicity (CIC) risk for a patient.
        
        ### Patient Clinical Data:
        {json.dumps(patient_data, indent=2)}
        
        ### Model Risk Prediction:
        - **Clinical Classification**: {risk_class}
        - **Calculated Risk Probability (Severity)**: {risk_score * 100:.1f}% 
        - **Model Confidence**: {confidence * 100:.1f}%

        ### Project Context & Definitions:
        1. **Classification Strategy**:
           - **Safe**: Low risk. Patient shows stable cardiac function and manageable chemotherapy exposure.
           - **Warning**: Moderate risk. Convergence of multiple mild risk factors or a single significant driver (e.g., borderline LVEF or elevated cumulative dose).
           - **Critical**: High risk. Potentially life-threatening cardiotoxicity signal detected (e.g., severely reduced LVEF, high cumulative anthracycline dose, or prolonged QTc).
        
        2. **Clinical Reference Values**:
           - **LVEF (%)**: Normal >55%. Borderline 50-55%. Reduced <50%.
           - **QTc Interval (ms)**: Normal <440ms (M), <460ms (F). Prolonged >470ms (M), >480ms (F).
           - **Anthracycline Dosing**: Risk increases significantly above 400-450 mg/m² cumulative doxorubicin equivalent.

        ### Report Requirements:
        Generate a comprehensive, professional clinical assessment. Use clear headings and structured analysis.
        
        # CardioTwin Onco-Cardiac Assessment Report
        
        ## 1. Executive Summary
        Provide a 2-3 sentence overview of the patient's current risk status.
        
        ## 2. Risk Stratification Analysis
        Explain the "{risk_class}" classification. Correlate the {risk_score * 100:.1f}% risk score with the clinical data. 
        Address the model's confidence ({confidence * 100:.1f}%).
        
        ## 3. Key Clinical Findings
        Analyze specific vitals, cardiac metrics, and chemotherapy regimen details. Highlight any values outside normal clinical ranges.
        
        ## 4. Management Recommendations
        Provide actionable, evidence-based recommendations for monitoring frequencies (Echo/ECG), potential specialist referrals, and lifestyle or pharmacological considerations.
        
        ## 5. Disclaimer
        This is an AI-generated clinical decision support tool. It is NOT a substitute for professional medical judgment. Consult a qualified cardio-oncologist.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating report: {str(e)}"

    def chat(self, message, history, patient_context, mode='patient'):
        if not self.model:
            return "Error: API Key not configured."

        # Construct chat with context
        # Gemini Pro supports chat history
        chat = self.model.start_chat(history=history)
        
        system_base = f"""
        System: You are CardioTwin, a specialized AI assistant for Onco-Cardiology.
        
        ### Current Patient Context:
        {patient_context}
        """

        if mode == 'doctor':
             system_instruction = f"""
             {system_base}
             ### MODE: DOCTOR (CLINICAL & TECHNICAL)
             - **Audience**: Oncologists and Cardiologists.
             - **Tone**: Professional, precise, clinical, objective.
             - **message length**: 100 words.
             - **message style**: it should be technical and professional and also dont guve all info at once with all insghits guve them if he/she asks
             - **Instructions**:
                1. Use standard medical terminology (e.g., "Left Ventricular Ejection Fraction", "QTc prolongation", "Anthracycline-induced toxicity").
                2. Cite specific values from the Patient Context to justify your analysis.
                3. Reference relevant guidelines (ESMO, ASCO) where applicable generally (do not invent specific citations).
                4. Be concise and data-driven.
             """
        else: # Patient Mode
             system_instruction = f"""
             {system_base}
             ### MODE: PATIENT (SUPPORTIVE & CLEAR)
             - **Audience**: Cancer patients undergoing chemotherapy.
             - **Tone**: Empathetic, reassuring, clear, non-alarmist, simple (5th-grade reading level).
             - **Purpose**: Provide clear, supportive, and actionable information to patients.
             - **message length**: 100 words.
             - **message style**: it should be like conversationally and casually. 
             - **Instructions**:
                1. Avoid complex medical jargon. Explain terms simply (e.g., instead of "LVEF", say "pumping ability of your heart").
                2. Focus on "what this means for me" and actionable lifestyle advice.
                3. If the risk is High/Critical, urge them to see their doctor calmly but seriously. "It looks like your heart needs a check-up."
                4. Be encouraging. Mental health is important.
                5. Do not use any medical jargon.

             """
        
        try:
            # Injecting system instruction as the first part of the message to context-set for this turn
            full_prompt = f"{system_instruction}\n\nUser Question: {message}"
            response = chat.send_message(full_prompt)
            return response.text
        except Exception as e:
            return f"Error in chat: {str(e)}"

# Singleton instance (optional, but good for sharing configuration)
genai_client = GenAIClient()
