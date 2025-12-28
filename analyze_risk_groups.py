import pandas as pd

# Load data
import os
path = '../newdata.csv'
if not os.path.exists(path):
    path = r'c:\Users\Prabhath\Projects\New folder\newdata.csv'
df = pd.read_csv(path)

# Filter for Warning and Critical
warning_df = df[df['Status_Label'] == 'Warning']
critical_df = df[df['Status_Label'] == 'CRITICAL_STOP']

print("--- PATIENT IDS ---")
print(f"Warning IDs (First 5): {warning_df['Patient_ID'].unique()[:5]}")
print(f"Critical IDs (First 5): {critical_df['Patient_ID'].unique()[:5]}")

print("\n--- FEATURE AVERAGES (For Presets) ---")
feature_cols = [
    'Age', 'Body_Fat_%', 'Heart_Fibrosis_Index', 'Baseline_Weight (kg)', 
    'Heart_Wall_Thickness (mm)', 'Interval_No', 'Dose_Administered (mg/m2)', 
    'ECG_QRS_Width (ms)', 'PPG_Peak_Amp (V)', 'Blood_Oxygen (SpO2)', 
    'Heart_Rate (BPM)'
]

print("\nSafe Averages:")
print(df[df['Status_Label'] == 'Safe'][feature_cols].mean())

print("\nWarning Averages:")
print(warning_df[feature_cols].mean())

print("\nCritical Averages:")
print(critical_df[feature_cols].mean())

# Also need BP split for presets
def split_bp(df):
    if df.empty: return 120, 80
    sys = df['Blood_Pressure (mmHg)'].str.split('/').str[0].astype(float).mean()
    dia = df['Blood_Pressure (mmHg)'].str.split('/').str[1].astype(float).mean()
    return sys, dia

s_sys, s_dia = split_bp(df[df['Status_Label'] == 'Safe'])
w_sys, w_dia = split_bp(warning_df)
c_sys, c_dia = split_bp(critical_df)

print(f"\nSafe BP: {s_sys}/{s_dia}")
print(f"Warning BP: {w_sys}/{w_dia}")
print(f"Critical BP: {c_sys}/{c_dia}")
