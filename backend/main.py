from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Spike_Prediction import predict

app = FastAPI(title="AtmosGuard Spike Prediction API")

# Allow frontend (any origin for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/predict/{city}")
def get_prediction(city: str):
    """
    Returns spike prediction for a given city.
    Response shape:
    {
        "prediction": 0 | 1,
        "confidence": float,
        "level": "Safe" | "Moderate" | "High Risk" | "Severe",
        "color": "green" | "yellow" | "orange" | "red",
        "message": str
    }
    """
    result = predict(city)
    return result
