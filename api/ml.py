from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio
from datetime import datetime, timezone
import numpy as np
from sklearn.ensemble import RandomForestRegressor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def geocode(city: str):
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": city, "format": "json", "limit": 1},
            headers={"User-Agent": "OrbitAir/1.0 (portfolio project)"},
        )
        data = r.json()
        if not data:
            return None
        return {
            "lat": float(data[0]["lat"]),
            "lon": float(data[0]["lon"]),
            "display_name": data[0]["display_name"].split(",")[0],
        }


async def fetch_air_quality(lat: float, lon: float):
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://air-quality-api.open-meteo.com/v1/air-quality",
            params={
                "latitude": lat,
                "longitude": lon,
                "hourly": "pm2_5,nitrogen_dioxide,ozone,us_aqi",
                "past_days": 7,
                "forecast_days": 1,
                "timezone": "auto",
            },
        )
        return r.json()


def aqi_label(aqi: float) -> str:
    if aqi <= 50:   return "Good"
    if aqi <= 100:  return "Moderate"
    if aqi <= 150:  return "Unhealthy for Sensitive"
    if aqi <= 200:  return "Unhealthy"
    if aqi <= 300:  return "Very Unhealthy"
    return "Hazardous"


def aqi_color(aqi: float) -> str:
    if aqi <= 50:   return "#22c55e"
    if aqi <= 100:  return "#f59e0b"
    if aqi <= 150:  return "#f97316"
    if aqi <= 200:  return "#ef4444"
    return "#a855f7"


@app.get("/api/ml")
async def predict_aqi(name: str = Query(...)):
    geo = await geocode(name)
    if not geo:
        raise HTTPException(status_code=404, detail=f"City '{name}' not found")

    raw = await fetch_air_quality(geo["lat"], geo["lon"])
    hourly = raw.get("hourly", {})
    times  = hourly.get("time", [])
    aqi_h  = hourly.get("us_aqi", [])
    pm25_h = hourly.get("pm2_5", [])
    no2_h  = hourly.get("nitrogen_dioxide", [])
    o3_h   = hourly.get("ozone", [])

    now = datetime.now(timezone.utc)
    X_train, y_train = [], []
    X_future, future_meta = [], []

    for i, t in enumerate(times):
        try:
            dt = datetime.fromisoformat(t.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
        except Exception:
            continue

        pm25 = pm25_h[i] if i < len(pm25_h) and pm25_h[i] is not None else 0.0
        no2  = no2_h[i]  if i < len(no2_h)  and no2_h[i]  is not None else 0.0
        o3   = o3_h[i]   if i < len(o3_h)   and o3_h[i]   is not None else 0.0
        aqi  = aqi_h[i]  if i < len(aqi_h)  else None

        hour_sin = np.sin(2 * np.pi * dt.hour / 24)
        hour_cos = np.cos(2 * np.pi * dt.hour / 24)
        features = [hour_sin, hour_cos, dt.weekday(), pm25, no2, o3]

        if dt < now:
            if aqi is not None:
                X_train.append(features)
                y_train.append(float(aqi))
        elif len(X_future) < 6:
            X_future.append(features)
            future_meta.append({
                "hour": dt.strftime("%H:%M"),
                "pm2_5": round(pm25, 1),
                "no2": round(no2, 1),
                "o3": round(o3, 1),
            })

    if len(X_train) < 24:
        raise HTTPException(status_code=422, detail="Not enough historical data (need 24h+)")

    model = RandomForestRegressor(n_estimators=80, max_depth=7, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    train_r2 = model.score(X_train, y_train)

    predictions = []
    for i, feats in enumerate(X_future):
        tree_preds = np.array([t.predict([feats])[0] for t in model.estimators_])
        mean = float(np.mean(tree_preds))
        std  = float(np.std(tree_preds))
        predicted = max(0.0, mean)
        predictions.append({
            **future_meta[i],
            "predicted_aqi": round(predicted),
            "lower": round(max(0.0, mean - 1.28 * std)),
            "upper": round(mean + 1.28 * std),
            "label": aqi_label(predicted),
            "color": aqi_color(predicted),
        })

    feature_names = ["hour_sin", "hour_cos", "day_of_week", "pm2_5", "no2", "o3"]
    importances = [
        {"feature": n, "importance": round(float(v), 3)}
        for n, v in sorted(
            zip(feature_names, model.feature_importances_),
            key=lambda x: -x[1],
        )
    ]

    return {
        "city": geo["display_name"],
        "model": "Random Forest",
        "training_samples": len(X_train),
        "r2_score": round(train_r2, 3),
        "feature_importances": importances,
        "predictions": predictions,
    }
