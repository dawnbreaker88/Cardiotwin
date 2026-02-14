import joblib
import os
import sys

# Add current dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def verify():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_dir, 'cardiotoxicity_model.pkl')
    
    print(f"Loading model from {model_path}")
    if not os.path.exists(model_path):
        print("Model file not found!")
        return

    model = joblib.load(model_path)
    print(f"Model type: {type(model)}")
    
    if hasattr(model, 'classes_'):
        print(f"Classes: {model.classes_}")
    else:
        print("Model does not have classes_ attribute.")

if __name__ == "__main__":
    verify()
