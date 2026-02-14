import joblib
import pandas as pd
import numpy as np
import os

model_path = r'c:\Users\Prabhath\projects backup\heart-viz-project\cardiotoxicity_model.pkl'

try:
    print(f"Loading model from {model_path}...")
    model = joblib.load(model_path)
    print(f"Model type: {type(model)}")
    
    if hasattr(model, 'n_features_in_'):
        print(f"Number of features expected: {model.n_features_in_}")
    
    if hasattr(model, 'feature_names_in_'):
        print(f"Feature names: {model.feature_names_in_}")
    else:
        print("Model does not have 'feature_names_in_' attribute.")

    if hasattr(model, 'classes_'):
        print(f"Classes: {model.classes_}")

except Exception as e:
    print(f"Error inspecting model: {e}")
