import joblib
import pandas as pd
try:
    names = joblib.load('backend/model/feature_names.pkl')
    print("Feature Names in PKL:", names)
    print("Reprs:", [repr(x) for x in names])
except Exception as e:
    print(e)
