
import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Add backend to path so we can import utils
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

# Mock google.generativeai BEFORE importing genai_client
sys.modules['google.generativeai'] = MagicMock()

from utils.genai_client import GenAIClient

class TestGenAIPrompts(unittest.TestCase):
    def setUp(self):
        self.client = GenAIClient(api_key="dummy_key")
        # Mock the model instance
        self.client.model = MagicMock()

    def test_generate_report_prompt(self):
        patient_data = {"age": 65, "lvef": 45}
        prediction = {"class": "Critical", "probabilities": {"High": 0.85}, "confidence": 0.9}
        
        self.client.generate_report(patient_data, prediction)
        
        # Get the argument passed to generate_content
        args, _ = self.client.model.generate_content.call_args
        prompt = args[0]
        
        # Assertions
        self.assertIn("Onco-Cardiology Assistant", prompt)
        self.assertIn("Chemotherapy-Induced Cardiotoxicity", prompt)
        self.assertIn("Risk Levels", prompt)
        
    def test_chat_patient_mode(self):
        message = "Is my heart okay?"
        history = []
        patient_context = "Age: 65, LVEF: 45%"
        
        # Mock start_chat and send_message
        mock_chat = MagicMock()
        self.client.model.start_chat.return_value = mock_chat
        
        self.client.chat(message, history, patient_context, mode='patient')
        
        args, _ = mock_chat.send_message.call_args
        full_prompt = args[0]
        
        # Patient Mode Assertions
        self.assertIn("MODE: PATIENT", full_prompt)
        self.assertIn("5th-grade reading level", full_prompt)
        self.assertIn("Explain terms simply", full_prompt)
        print("\n[SUCCESS] Patient mode prompt verified.")

    def test_chat_doctor_mode(self):
        message = "Analyze LVEF trends."
        history = []
        patient_context = "Age: 65, LVEF: 45%"
        
        # Mock start_chat and send_message
        mock_chat = MagicMock()
        self.client.model.start_chat.return_value = mock_chat
        
        self.client.chat(message, history, patient_context, mode='doctor')
        
        args, _ = mock_chat.send_message.call_args
        full_prompt = args[0]
        
        # Doctor Mode Assertions
        self.assertIn("MODE: DOCTOR", full_prompt)
        self.assertIn("standard medical terminology", full_prompt)
        self.assertIn("relevant guidelines (ESMO, ASCO)", full_prompt)
        print("\n[SUCCESS] Doctor mode prompt verified.")

if __name__ == '__main__':
    unittest.main()
