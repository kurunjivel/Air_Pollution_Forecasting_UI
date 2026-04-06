import pandas as pd 
import numpy as np
import joblib

def get_city_data(name: str) -> pd.DataFrame:
    df = pd.read_csv("./Data/final_df.csv")
    features = [
    "O3_forecast",
    "NO2_forecast",
    "T_forecast",
    "u_forecast",
    "v_forecast",
    "O3_lag1",
    "O3_lag2",
    "NO2_lag1",
    "NO2_lag2"
    ]
    df = df.sample(1)
    df = df[features]
    return df

def load_model():
    model = joblib.load("./model/spike_model.pkl")
    return model

def classify_result(prob):
    if prob < 30:
        return {
            "level": "Safe",
            "color": "green",
            "message": "Air quality is stable. No spike expected."
        }
    elif prob < 60:
        return {
            "level": "Moderate",
            "color": "yellow",
            "message": "Slight pollution increase possible."
        }
    elif prob < 80:
        return {
            "level": "High Risk",
            "color": "orange",
            "message": "Pollution spike likely. Take precautions."
        }
    else:
        return {
            "level": "Severe",
            "color": "red",
            "message": "⚠️ Dangerous pollution spike detected!"
        }

def predict(city: str) -> dict:
    df = get_city_data(city)
    model = load_model()

    prob = model.predict_proba(df)[0][1] * 100

    classification = classify_result(prob)

    return {
        "prediction": int(prob > 30), 
        "confidence": round(prob, 2),
        "level": classification["level"],
        "color": classification["color"],
        "message": classification["message"]
    }

if __name__ == "__main__":
    print(predict("Delhi"))

    