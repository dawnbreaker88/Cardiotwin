import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# ==========================================
# PHASE 4: MODEL TRAINING
# ==========================================

def train_model():
    print("Loading processed data...")
    try:
        X_train, y_train = joblib.load('backend/model/train_data.pkl')
        X_val, y_val = joblib.load('backend/model/val_data.pkl')

        # --- MANUAL OVERSAMPLING ---
        from sklearn.utils import resample
        import numpy as np
        
        print("Original class counts:", np.bincount(y_train))
        
        # Combine inputs and target for resampling
        train_data = X_train.copy()
        train_data['target'] = y_train
        
        counts = train_data['target'].value_counts()
        max_count = counts.max()
        
        dfs = []
        for cls in counts.index:
            df_class = train_data[train_data['target'] == cls]
            if len(df_class) < max_count:
                print(f"Upsampling class {cls} from {len(df_class)} to {max_count}")
                df_upsampled = resample(df_class, replace=True, n_samples=max_count, random_state=42)
                dfs.append(df_upsampled)
            else:
                dfs.append(df_class)
        
        upsampled_data = pd.concat(dfs)
        
        # Split back
        X_train = upsampled_data.drop('target', axis=1)
        y_train = upsampled_data['target'].values
        
        print("New class counts:", np.bincount(y_train))
        # ---------------------------

    except Exception as e:
        print(f"Error loading data: {e}. Make sure process_data.py ran successfully.")
        return

    print("Initializing Random Forest model...")
    # Using balanced class weights to handle imbalance between Safe/Warning/Critical
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=10,
        random_state=42,
        class_weight='balanced'
    )
    
    print("Training model...")
    rf_model.fit(X_train, y_train)
    
    print("Evaluating on Validation Set...")
    y_pred = rf_model.predict(X_val)
    
    print("\nVALIDATION METRICS:")
    print(classification_report(y_val, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_val, y_pred))
    
    # Save model
    joblib.dump(rf_model, 'backend/model/trained_model.pkl')
    print("\nModel saved to backend/model/trained_model.pkl")
    
    # Feature Importance
    print("\nExtracting Feature Importance...")
    importances = rf_model.feature_importances_
    feature_names = X_train.columns
    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': importances
    }).sort_values('importance', ascending=False)
    
    print(importance_df.head(10))
    
    # Save plot (optional, requires GUI or saved to file)
    # plt.figure(figsize=(10, 6))
    # plt.barh(importance_df['feature'][:10], importance_df['importance'][:10])
    # plt.savefig('backend/model/feature_importance.png')

if __name__ == "__main__":
    train_model()
