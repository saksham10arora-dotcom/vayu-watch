from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WAQI_TOKEN = os.environ.get("WAQI_TOKEN", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.5-flash"

PROFILES = {
    "healthy": "a healthy adult",
    "asthma": "an adult with asthma or a respiratory condition",
    "child": "a young child",
    "elderly": "an elderly person",
    "pregnant": "a pregnant woman",
}


def aqi_label(aqi):
    if aqi is None:
        return "Unknown"
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Moderate"
    if aqi <= 150:
        return "Unhealthy for Sensitive"
    if aqi <= 200:
        return "Unhealthy"
    if aqi <= 300:
        return "Very Unhealthy"
    return "Hazardous"


class AdvisoryRequest(BaseModel):
    uid: int
    profile: str = "healthy"


@app.post("/api/advisory")
async def get_advisory(req: AdvisoryRequest):
    if not WAQI_TOKEN:
        raise HTTPException(status_code=503, detail="Station backend not configured")
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Advisory backend not configured")

    async with httpx.AsyncClient(timeout=15) as client:
        station_r = await client.get(f"https://api.waqi.info/feed/@{req.uid}/", params={"token": WAQI_TOKEN})
        station_data = station_r.json()
        if station_data.get("status") != "ok":
            raise HTTPException(status_code=502, detail="Failed to fetch station data")

        d = station_data["data"]
        iaqi = d.get("iaqi", {})
        snapshot = {
            "locality": d["city"]["name"].split(",")[0],
            "aqi": d.get("aqi"),
            "label": aqi_label(d.get("aqi")),
            "dominant_pollutant": d.get("dominentpol"),
            "pm2_5": iaqi.get("pm25", {}).get("v"),
            "pm10": iaqi.get("pm10", {}).get("v"),
            "no2": iaqi.get("no2", {}).get("v"),
            "o3": iaqi.get("o3", {}).get("v"),
            "so2": iaqi.get("so2", {}).get("v"),
            "co": iaqi.get("co", {}).get("v"),
        }

        profile_desc = PROFILES.get(req.profile, PROFILES["healthy"])
        prompt = (
            f"You are a public health assistant for Delhi, India. "
            f"Current air quality at {snapshot['locality']}: AQI {snapshot['aqi']} ({snapshot['label']}), "
            f"dominant pollutant {snapshot['dominant_pollutant']}. "
            f"PM2.5 {snapshot['pm2_5']}, PM10 {snapshot['pm10']}, NO2 {snapshot['no2']}, "
            f"O3 {snapshot['o3']}, SO2 {snapshot['so2']}, CO {snapshot['co']} (all ug/m3).\n\n"
            f"Give a short, direct health advisory (max 4 sentences, no markdown headers) "
            f"for {profile_desc} in this location right now. "
            f"Cover: is it safe to go outside, exercise, and any protective steps (mask, timing, medication). "
            f"Be concrete and actionable, not generic."
        )

        try:
            gemini_r = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
                params={"key": GEMINI_API_KEY},
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
            gemini_r.raise_for_status()
            gdata = gemini_r.json()
            text = gdata["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Advisory generation failed: {e}")

        return {"snapshot": snapshot, "profile": req.profile, "advisory": text.strip()}
