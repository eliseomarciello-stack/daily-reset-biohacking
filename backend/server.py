from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from reset_logic import generate_reset

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Daily Reset API")
api_router = APIRouter(prefix="/api")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class ResetInput(BaseModel):
    energy_score: int = Field(..., ge=1, le=5)
    focus_score: int = Field(..., ge=1, le=5)
    stress_score: int = Field(..., ge=1, le=5)
    sleep_score: int = Field(..., ge=1, le=5)
    movement_type: str
    body_feeling: str
    nutrition_status: str
    cravings_level: str
    caffeine_use: str
    natural_light: str
    routine_done: str
    improvement_area: str
    available_time: str


class Reset(BaseModel):
    id: str
    created_at: str
    energy_score: int
    focus_score: int
    stress_score: int
    sleep_score: int
    movement_type: str
    body_feeling: str
    nutrition_status: str
    cravings_level: str
    caffeine_use: str
    natural_light: str
    routine_done: str
    improvement_area: str
    available_time: str
    generated_pattern: str
    generated_summary: str
    generated_worked: str
    generated_friction: str
    generated_adjustment: str
    generated_micro_action: str
    generated_avoidance: str


class EmailLeadInput(BaseModel):
    email: EmailStr


class EmailLead(BaseModel):
    id: str
    email: str
    created_at: str


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Daily Reset API", "status": "ok"}


@api_router.post("/resets", response_model=Reset)
async def create_reset(payload: ResetInput):
    generated = generate_reset(payload.model_dump())
    reset_doc = {
        "id": str(uuid.uuid4()),
        "created_at": _now_iso(),
        **payload.model_dump(),
        **generated,
    }
    await db.resets.insert_one({**reset_doc})
    reset_doc.pop("_id", None)
    return Reset(**reset_doc)


@api_router.get("/resets", response_model=List[Reset])
async def list_resets(limit: int = 50):
    cursor = db.resets.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [Reset(**d) for d in docs]


@api_router.get("/resets/{reset_id}", response_model=Reset)
async def get_reset(reset_id: str):
    doc = await db.resets.find_one({"id": reset_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Reset non trovato")
    return Reset(**doc)


@api_router.post("/email-leads", response_model=EmailLead)
async def create_email_lead(payload: EmailLeadInput):
    email = payload.email.lower().strip()
    existing = await db.email_leads.find_one({"email": email}, {"_id": 0})
    if existing:
        return EmailLead(**existing)
    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "created_at": _now_iso(),
    }
    await db.email_leads.insert_one({**doc})
    doc.pop("_id", None)
    return EmailLead(**doc)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
