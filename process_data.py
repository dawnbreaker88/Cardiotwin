import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
import os

# ==========================================
# PHASE 1: DATA LOADING & CLEANING
# ==========================================

def load_and_clean_data(filepath):
    print(f"Loading data from {filepath}...")
    # Load with header as the first row
    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        raise

    # Standardize column names
    # Mapping based on nii.csv headers:
    # Patient_ID,Scenario_Type,Age,Heart_Fibrosis_Index,Heart_Wall_Thickness (mm),Interval_No,Dose_Administered (mg/m2),ECG_QRS_Width (ms),Blood_Oxygen (SpO2),Blood_Pressure (mmHg),Status_Label
    column_map = {
        'Heart_Wall_Thickness (mm)': 'Heart_Wall_Thickness_mm',
        'Dose_Administered (mg/m2)': 'Dose_Administered_mg_m2',
        'ECG_QRS_Width (ms)': 'ECG_QRS_Width_ms',
        'Blood_Oxygen (SpO2)': 'Blood_Oxygen_SpO2',
        'Blood_Pressure (mmHg)': 'Blood_Pressure_mmHg'
    }
    df = df.rename(columns=column_map)
    
    # Parse Blood Pressure
    print("Parsing Blood Pressure...")
    try:
        if 'Blood_Pressure_mmHg' in df.columns:
            # Check if it's string format "120/80"
            if df['Blood_Pressure_mmHg'].dtype == object:
                df[['BP_Systolic', 'BP_Diastolic']] = df['Blood_Pressure_mmHg'].str.split('/', expand=True).astype(float)
                df = df.drop('Blood_Pressure_mmHg', axis=1) # Drop original after extraction
            else:
                print("Warning: Blood_Pressure_mmHg is not string type, skipping parse.")
    except Exception as e:
        print(f"Error parsing blood pressure: {e}")
    
    # Verify target distribution
    if 'Status_Label' in df.columns:
        print("\nTarget Distribution (Status_Label):")
        print(df['Status_Label'].value_counts(normalize=True))
    else:
        raise ValueError("Status_Label column missing from dataset!")
        
    return df

# ==========================================
# PHASE 2: FEATURE ENGINEERING
# ==========================================

def preprocess_features(df):
    print("\nPreprocessing features...")
    
    # 1. Drop Non-Feature Columns
    # Patient_ID and Scenario_Type are metadata, not for training
    drop_cols = ['Patient_ID', 'Scenario_Type', 'Status_Label']
    
    # Check what actually exists
    existing_drop_cols = [c for c in drop_cols if c in df.columns]
    X = df.drop(existing_drop_cols, axis=1)
    y = df['Status_Label']
    
    # 2. Encode Categoricals
    # With nii.csv, we might NOT have Gender anymore.
    # Check if Gender exists (it was in old schema, maybe not in new)
    if 'Gender' in X.columns:
        le_gender = LabelEncoder()
        X['Gender'] = le_gender.fit_transform(X['Gender'])
        print(f"Encoded Gender: {dict(zip(le_gender.classes_, le_gender.transform(le_gender.classes_)))}")
        joblib.dump(le_gender, 'backend/model/gender_encoder.pkl')
    else:
        print("Note: 'Gender' column not found, skipping encoding.")
        # If gender_encoder.pkl exists from old runs, we might want to delete it or just ignore it
        if os.path.exists('backend/model/gender_encoder.pkl'):
            os.remove('backend/model/gender_encoder.pkl')

    # Encode Target
    le_target = LabelEncoder()
    y_encoded = le_target.fit_transform(y)
    print(f"Encoded Target: {dict(zip(le_target.classes_, le_target.transform(le_target.classes_)))}")
    joblib.dump(le_target, 'backend/model/target_encoder.pkl')
    
    # 3. Handle Missing Values & Scaling
    numeric_cols = X.select_dtypes(include=[np.number]).columns
    
    print(f"Numeric columns for scaling: {list(numeric_cols)}")
    
    # Impute
    if len(numeric_cols) > 0:
        imputer = SimpleImputer(strategy='median')
        X[numeric_cols] = imputer.fit_transform(X[numeric_cols])
        
        # Scale
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        X_processed = pd.DataFrame(X_scaled, columns=numeric_cols)
        
        # Save scaler
        joblib.dump(scaler, 'backend/model/scaler.pkl')
        print("Scaler saved.")
    else:
        # Fallback if no numeric columns found (unlikely)
        X_processed = X.copy()
        
    # Save feature names for inference reference
    joblib.dump(list(X.columns), 'backend/model/feature_names.pkl')
    
    return X_processed, y_encoded

# ==========================================
# PHASE 3: DATA SPLITTING
# ==========================================

def split_data(X, y):
    print("\nSplitting data...")
    
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )

    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    
    print(f"Train shape: {X_train.shape}")
    print(f"Val shape:   {X_val.shape}")
    print(f"Test shape:  {X_test.shape}")
    
    return X_train, X_val, X_test, y_train, y_val, y_test

if __name__ == "__main__":
    import os
    os.makedirs('backend/model', exist_ok=True)
    
    # Pointing to nii.csv as requested
    DATA_PATH = '../nii.csv' 
    if not os.path.exists(DATA_PATH):
        # Fallback to absolute path or check current dir if moved
        # Trying absolute or root relative
        DATA_PATH = r'c:\Users\Prabhath\Projects\New folder\nii.csv'
        
    if not os.path.exists(DATA_PATH):
        print(f"Error: Could not find dataset at {DATA_PATH}")
        exit(1)

    df = load_and_clean_data(DATA_PATH)
    X, y = preprocess_features(df)
    X_train, X_val, X_test, y_train, y_val, y_test = split_data(X, y)
    
    print("\nSaving processed datasets...")
    joblib.dump((X_train, y_train), 'backend/model/train_data.pkl')
    joblib.dump((X_val, y_val), 'backend/model/val_data.pkl')
    joblib.dump((X_test, y_test), 'backend/model/test_data.pkl')
    print("Processed data saved.")

