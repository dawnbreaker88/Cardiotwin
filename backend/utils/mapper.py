import numpy as np

def map_risk_to_visuals(prediction_result, age=45):
    """
    Maps ML prediction to visual heart parameters.
    Supports old labels (Low/Medium/High) and new labels (Safe/Warning/CRITICAL_STOP).
    """
    risk_class = prediction_result.get('class', 'Safe')
    probs = prediction_result.get('probabilities', {})
    
    # Map new labels to risk levels
    risk_level_map = {
        'Safe': 'Low',
        'Warning': 'Medium',
        'CRITICAL_STOP': 'High',
        'Low': 'Low',
        'Medium': 'Medium',
        'High': 'High'
    }
    
    mapped_risk = risk_level_map.get(risk_class, 'Low')
    
    # Get probability of the "bad" outcome
    # If High/CRITICAL_STOP exists, use that.
    risk_proba = probs.get('CRITICAL_STOP', probs.get('High', 0.0))
    if mapped_risk == 'Medium':
         risk_proba = probs.get('Warning', probs.get('Medium', 0.0))
    
    # 1. HEART RATE (BPM)
    base_hr = 70
    if mapped_risk == 'Low':
        heart_rate = base_hr + np.random.uniform(-5, 5)
    elif mapped_risk == 'Medium':
        heart_rate = base_hr + 20 + np.random.uniform(-5, 10) # ~90 BPM
    else: # High
        heart_rate = base_hr + 50 + np.random.uniform(-5, 15) # ~120 BPM
        
    # Cap HR
    max_hr = (220 - age) * 0.9
    heart_rate = min(heart_rate, max_hr)
    
    # 2. COLOR MAPPING
    color_map = {
        'Low': '#4CAF50',    # Green
        'Medium': '#FFC107', # Amber
        'High': '#FF4444'    # Red
    }
    color = color_map.get(mapped_risk, '#4CAF50')
    
    # 3. ARRHYTHMIA TYPE
    if mapped_risk == 'Low':
        arrhythmia = "Normal Sinus Rhythm"
    elif mapped_risk == 'Medium':
        arrhythmia = "Sinus Tachycardia"
    else:
        arrhythmia = "Atrial Fibrillation" if age > 60 else "Ventricular Tachycardia"

    # 4. CONTRACTION INTENSITY
    intensity = 1.0 + (risk_proba * 0.5) # 1.0 to 1.5
    
    # 5. HRV (lower is worse)
    hrv = 60 - (risk_proba * 40)
    hrv = max(10, hrv)

    return {
        'heart_rate': int(heart_rate),
        'color': color,
        'arrhythmia_type': arrhythmia,
        'contraction_intensity': float(intensity),
        'hrv': int(hrv),
        'risk_score': float(risk_proba),
        'risk_level': mapped_risk, # Return standardized level for UI
        'original_label': risk_class
    }
