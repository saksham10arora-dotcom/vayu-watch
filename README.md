# Vayu Watch — Delhi Air Quality & Public Health

Built at the Elastic × Google Cloud Hacknight (Delhi). Live AQI from 24 real
DPCC/CPCB ground stations across Delhi, with Gemini-generated personalized
health advisories and every reading indexed into Elasticsearch as it's collected.

Built on top of an earlier hackathon project ([OrbitAir](https://github.com/saksham10arora-dotcom/orbit-ops))
that this team shipped months ago — global city AQI search, weather, RF forecasting.

## What's new for this hacknight

- **Delhi Locality Watch** — real-time AQI across 24 government monitoring
  stations (Anand Vihar, RK Puram, ITO, Rohini, etc.), ranked worst to best
- **Google Gemini health advisories** — click a station, pick a health profile
  (healthy / asthma / child / elderly / pregnant), get a concrete, actionable
  advisory generated live from that station's real pollutant breakdown
- **Elasticsearch** — every locality reading gets indexed as the app runs,
  building a real history of Delhi's air quality over the course of the event

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite, shadcn/ui + Tailwind |
| Backend | FastAPI (Python), Vercel serverless functions |
| Delhi AQI | [WAQI](https://aqicn.org/) — aggregates real DPCC/CPCB ground stations |
| Health Advisory | Google Gemini (`gemini-2.5-flash`) |
| Locality History | Elasticsearch |
| Global AQI (legacy) | Open-Meteo Air Quality + Forecast API |

## API Endpoints

```
GET  /api/localities            — live AQI for all 24 Delhi stations, ranked
GET  /api/history?uid=<uid>     — trend for a station (Elastic-backed, falls back to WAQI forecast)
POST /api/advisory {uid, profile} — pollutant snapshot + Gemini health advisory
GET  /api/city?name=<city>      — legacy global city search (Open-Meteo)
GET  /api/ml?name=<city>        — legacy RF forecast (Open-Meteo)
```

## Running locally

```bash
npm install
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt

# set GEMINI_API_KEY, WAQI_TOKEN (and optionally ELASTIC_URL / ELASTIC_API_KEY)
# in ~/.config/keys.env or export directly, then:
bash dev.sh
```

Visit `http://localhost:8080/delhi`.

## Environment variables

| Var | Required | Purpose |
|---|---|---|
| `WAQI_TOKEN` | Yes | Free token from [aqicn.org/data-platform/token](https://aqicn.org/data-platform/token/) |
| `GEMINI_API_KEY` | Yes | Google AI Studio key |
| `ELASTIC_URL` | Optional | Elastic Cloud endpoint — enables locality history indexing |
| `ELASTIC_API_KEY` | Optional | Elastic Cloud API key |

Without Elastic configured, `/api/history` falls back to WAQI's forecast data.
