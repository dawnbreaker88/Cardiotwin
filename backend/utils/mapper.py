import numpy as np

def map_risk_to_visuals(prediction_result, age=45, features=None):
    """
    Maps ML prediction to visual heart parameters.
    Uses actual patient features if available, otherwise estimates.
    """
    if features is None:
        features = {}

    risk_class = prediction_result.get('class', 'Safe')
    confidence = prediction_result.get('confidence', 0.0)
    
    # Map classes to levels
    # 0/Safe -> Low
    # 1/Warning -> Medium
    # 2/Critical -> High
    risk_level_map = {
        'Safe': 'Low',
        'Warning': 'Medium',
        'Critical': 'High',
        'Low Start': 'Low', # Legacy
        'Low': 'Low',
        'High': 'High'
    }
    
    mapped_risk = risk_level_map.get(risk_class, 'Low')
    
    # 1. HEART RATE (BPM)
    # Use actual resting HR if available, else estimate
    if 'resting_heart_rate_bpm' in features and features['resting_heart_rate_bpm'] > 0:
        heart_rate = features['resting_heart_rate_bpm']
        # Add some random variation for "live" feel if desired, or keep static
        # Let's keep it static + small jitter
        heart_rate = float(heart_rate) + np.random.uniform(-2, 2)
    else:
        # Fallback estimation
        base_hr = 70
        if mapped_risk == 'Medium': base_hr = 85
        if mapped_risk == 'High': base_hr = 100
        heart_rate = base_hr + np.random.uniform(-5, 5)
    
    # 2. COLOR MAPPING
    color_map = {
        'Low': '#4CAF50',    # Green
        'Medium': '#FFC107', # Amber
        'High': '#FF4444'    # Red
    }
    color = color_map.get(mapped_risk, '#4CAF50')
    
    # 3. ARRHYTHMIA TYPE
    # Can infer from QTc if available?
    qtc = features.get('qtc_interval_ms', 400)
    if mapped_risk == 'High' or qtc > 500:
        arrhythmia = "Prolonged QTc / Arrhythmia"
    elif mapped_risk == 'Medium':
        arrhythmia = "Sinus Tachycardia"
    else:
        arrhythmia = "Normal Sinus Rhythm"

    # 4. CONTRACTION INTENSITY (LVEF based?)
    lvef = features.get('baseline_lvef_percent', 60)
    # Lower LVEF = Weaker contraction?
    # Normal LVEF is 55-70%. <50 is reduced.
    # Visually: 1.0 is normal. 
    # If LVEF is low, maybe intensity should be lower (weaker beat)?
    # Or if High Risk, maybe "stressed" beat (faster/hard)?
    # Let's map LVEF to intensity: 
    # 60% -> 1.0
    # 40% -> 0.7
    intensity = max(0.5, float(lvef) / 60.0) 
    
    # 5. HRV (RMSSD)
    if 'heart_rate_variability_rmssd' in features and features['heart_rate_variability_rmssd'] > 0:
        hrv = features['heart_rate_variability_rmssd']
    else:
        hrv = 60 - (confidence * 40) if mapped_risk != 'Low' else 60

    return {
        'heart_rate': int(heart_rate),
        'color': color,
        'arrhythmia_type': arrhythmia,
        'contraction_intensity': float(intensity),
        'hrv': int(hrv),
        'risk_score': float(confidence),
        'risk_level': mapped_risk,
        'qtc': float(qtc),
        'lvef': float(lvef)
    }
