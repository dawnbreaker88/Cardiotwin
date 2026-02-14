import pandas as pd
import os

CSV_PATH = 'sample_patient_data_20_labeled.csv'

def fix_csv():
    if not os.path.exists(CSV_PATH):
        print(f"File not found: {CSV_PATH}")
        return

    # Read the CSV
    try:
        # Check for empty lines and read
        df = pd.read_csv(CSV_PATH)
        print(f"Original shape: {df.shape}")
        
        # Remove any rows that are completely empty
        df = df.dropna(how='all')
        
        # Add Patient_ID if missing
        if 'Patient_ID' not in df.columns:
            print("Adding Patient_ID column...")
            df.insert(0, 'Patient_ID', [f'P{i+1:03d}' for i in range(len(df))])
        
        # Save back to CSV without index
        df.to_csv(CSV_PATH, index=False)
        print(f"Fixed CSV saved. New shape: {df.shape}")
        print("First 5 rows:")
        print(df.head())
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_csv()
