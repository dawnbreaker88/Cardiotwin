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

        prompt = f"""
        You are an advanced AI cardiologist assistant named CardioTwin. 
        Generate a comprehensive health report for a patient with the following data:
        
        Patient Vitals:
        {patient_data}
        
        AI Risk Prediction:
        - Risk Level: {prediction.get('class')}
        - Risk Score: {prediction.get('probabilities', {}).get('High', 0) * 100:.1f}%
        - Confidence: {prediction.get('confidence', 0) * 100:.1f}%
        
        Please structure the report in the following Markdown format:
        # CardioTwin Health Report
        
        ## Executive Summary
        (2-3 sentences summarizing the patient's status)
        
        ## Risk Assessment
        (Explain what the risk score means and why it was given)
        
        ## Key Factors
        (Analyze the specific vitals like BP, Cholesterol etc. and if they are out of range)
        
        ## Recommendations
        (Actionable lifestyle and medical advice)
        
        ## Disclaimer
        (Standard medical disclaimer that this is AI generated and not a doctor's diagnosis)
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating report: {str(e)}"

    def chat(self, message, history, patient_context):
        if not self.model:
            return "Error: API Key not configured."

        # Construct chat with context
        # Gemini Pro supports chat history
        chat = self.model.start_chat(history=history)
        
        system_context = f"""
        System: You are CardioTwin, a helpful cardiac health assistant.
        Patient Context: {patient_context}
        Always answer based on the patient's specific data. Be professional, empathetic, and clear.
        """
        
        try:
            # We can't easily inject system context in the middle of history with SDK, 
            # so we prepend it to the message or assume history handles it.
            # Simplified approach: Send message with context prepended if new session, 
            # but for now let's just send the message.
            # Actually, to make it context aware, we should include the context in the message or prompt.
            
            full_prompt = f"{system_context}\nUser: {message}"
            response = chat.send_message(full_prompt)
            return response.text
        except Exception as e:
            return f"Error in chat: {str(e)}"

# Singleton instance (optional, but good for sharing configuration)
genai_client = GenAIClient()
