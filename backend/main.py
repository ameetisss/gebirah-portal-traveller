from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from typing import Dict, List, Optional
from flights import fetch_regional_flights

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Boilerplate FastAPI Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FlightSearchRequest(BaseModel):
    departure_airport: str = "SIN"
    destinations: Dict[str, List[str]]
    start_date: str
    end_date: str

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!", "environment": os.getenv("ENVIRONMENT", "development")}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/fetch-flights")
async def trigger_flight_fetch(request: FlightSearchRequest):
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key or api_key == "YOUR_SERPAPI_KEY_HERE":
        raise HTTPException(status_code=500, detail="SerpApi key not configured in .env")
    
    try:
        results = fetch_regional_flights(
            api_key=api_key,
            departure_airport=request.departure_airport,
            destinations=request.destinations,
            start_date_str=request.start_date,
            end_date_str=request.end_date
        )
        return {"status": "success", "count": len(results), "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
