import time
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

# Load environment variables from backend/.env or root .env
import sys
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

load_dotenv(os.path.join(backend_dir, ".env"))
load_dotenv(os.path.join(os.path.dirname(backend_dir), ".env"))
load_dotenv()

try:
    from backend.tabpfn_survival import tabpfn_survival
    from backend.gemma_survival_agent import gemma_survival
    from backend.elevenlabs_voice import elevenlabs_voice
    from backend.atlas_survival_store import atlas_survival_store
    from backend.weather_elevation import wilderness_weather
    from backend.serpapi_alerts import serpapi_survival
except ImportError:
    try:
        from tabpfn_survival import tabpfn_survival
        from gemma_survival_agent import gemma_survival
        from elevenlabs_voice import elevenlabs_voice
        from atlas_survival_store import atlas_survival_store
        from weather_elevation import wilderness_weather
        from serpapi_alerts import serpapi_survival
    except ImportError:
        from wildcraft.backend.tabpfn_survival import tabpfn_survival
        from wildcraft.backend.gemma_survival_agent import gemma_survival
        from wildcraft.backend.elevenlabs_voice import elevenlabs_voice
        from wildcraft.backend.atlas_survival_store import atlas_survival_store
        from wildcraft.backend.weather_elevation import wilderness_weather
        from wildcraft.backend.serpapi_alerts import serpapi_survival

app = FastAPI(
    title="WildCraft AI — Backcountry Survival & Physiological Risk Engine",
    description="Backend API powering WildCraft AI with open-weight intelligence and foundation tabular modeling.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models ---
class SurvivalRiskRequest(BaseModel):
    elevation_m: float = 1400.0
    ambient_temp_c: float = 8.0
    relative_humidity_pct: float = 65.0
    wind_speed_kmh: float = 18.0
    trek_duration_hours: float = 4.5
    water_consumed_liters: float = 1.2
    clothing_insulation_clo: float = 1.0

class SurvivalGuideRequest(BaseModel):
    user_prompt: str
    focus_topic: Optional[str] = None
    risk_data: Optional[dict] = None
    offline_mode: bool = False

class VoiceSynthesisRequest(BaseModel):
    text: str

class BackcountryLogRequest(BaseModel):
    hiker_name: str = "Backcountry Hiker"
    location_name: str = "Cascade Wilderness Preserve"
    risk_score: float
    notes: str
    gear_items: Optional[List[str]] = []

# --- API Endpoints ---

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": "WildCraft AI",
        "runtime": "Production Serverless Ready"
    }

@app.post("/api/predict-survival-risk")
def predict_survival_risk(req: SurvivalRiskRequest):
    """
    Predicts hypothermia/heat exhaustion risk score (0-100) and dehydration rates
    using TabPFN (Prior Labs Tabular Foundation Model).
    """
    return tabpfn_survival.predict_survival_risk(
        elevation_m=req.elevation_m,
        ambient_temp_c=req.ambient_temp_c,
        relative_humidity_pct=req.relative_humidity_pct,
        wind_speed_kmh=req.wind_speed_kmh,
        trek_duration_hours=req.trek_duration_hours,
        water_consumed_liters=req.water_consumed_liters,
        clothing_insulation_clo=req.clothing_insulation_clo
    )

@app.post("/api/survival-guide")
async def get_survival_guide(req: SurvivalGuideRequest):
    """
    Queries Gemma Open-Weight Model Agent for step-by-step bushcraft, knot tying,
    shelter blueprints, and emergency first aid. Supports 0-signal offline backcountry mode.
    """
    return await gemma_survival.generate_survival_guidance(
        user_prompt=req.user_prompt,
        topic_context=req.focus_topic,
        risk_data=req.risk_data,
        offline_mode=req.offline_mode
    )

@app.post("/api/synthesize-voice")
async def synthesize_voice(req: VoiceSynthesisRequest):
    """
    Generates realistic voice narration via ElevenLabs for hands-free audio guidance.
    """
    return await elevenlabs_voice.generate_speech(req.text)

@app.get("/api/survival-catalog")
def get_survival_catalog(q: Optional[str] = Query(None), category: Optional[str] = Query(None)):
    """
    Queries MongoDB Atlas Vector Search / Survival Manual for plants, shelters, knots, and firecraft.
    """
    return atlas_survival_store.query_survival_catalog(query=q or "", category=category)

@app.post("/api/backcountry-log")
@app.post("/api/atlas-logbook")
def save_backcountry_log(req: BackcountryLogRequest):
    """
    Saves backcountry logbook into MongoDB Atlas (long-term memory).
    """
    data = req.dict()
    data["timestamp"] = time.time()
    return atlas_survival_store.save_backcountry_log(data)

@app.get("/api/backcountry-logs")
@app.get("/api/atlas-logbook")
@app.get("/api/atlas-logbooks")
def get_backcountry_logs():
    """
    Retrieves stored backcountry logs from MongoDB Atlas.
    """
    return atlas_survival_store.get_backcountry_logs()

@app.get("/api/wilderness-weather")
async def get_wilderness_weather(lat: float = 44.4280, lon: float = -110.5885):
    """
    Fetches live Open-Meteo weather and elevation metrics for backcountry coordinates.
    """
    return await wilderness_weather.get_wilderness_conditions(lat, lon)

@app.get("/api/trail-alerts")
async def get_trail_alerts(location: str = "Sierra Backcountry Trail"):
    """
    Fetches real-time ranger advisories and weather warnings via SerpApi.
    """
    return await serpapi_survival.get_live_trail_alerts(location)

@app.get("/api/partner-status")
def get_partner_integrations():
    mongo_status = "Active (Connected to MongoDB Atlas Cloud Cluster)" if atlas_survival_store.is_connected else "Active (Offline Local Store — Set MONGODB_URI to connect Atlas Cloud)"
    return {
        "featured_partners": [
            {"name": "Google Gemma", "category": "Best Use of Gemma ($200)", "status": "Active (Open-Weight Survival Engine & 0-Signal Backcountry Mode)", "icon": "🌲"},
            {"name": "Prior Labs TabPFN", "category": "Best Use of TabPFN ($200)", "status": "Active (Tabular Foundation Model for Hypothermia/Heat Risk & Dehydration)", "icon": "📊"},
            {"name": "Render / DigitalOcean", "category": "Best Use of Render / DigitalOcean ($200)", "status": "Active (Production Runtime & GPU Droplet Ready)", "icon": "🚀"}
        ],
        "partner_solutions": [
            {"name": "ElevenLabs", "category": "Best Use of ElevenLabs ($100)", "status": "Active (Hands-free Voice Narration for Bushcraft Instructions)", "icon": "🎙️"},
            {"name": "MongoDB Atlas", "category": "Best Use of MongoDB Atlas ($100)", "status": mongo_status, "icon": "🍃"},
            {"name": "SerpApi", "category": "Best Use of SerpApi ($100)", "status": "Active (Live Web Search for Ranger Weather Alerts)", "icon": "🔍"}
        ]
    }
