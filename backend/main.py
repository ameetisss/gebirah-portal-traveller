from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from typing import Dict, List, Optional
from flights import fetch_regional_flights
from csv_service import get_flight_details, get_csv_head
from volunteer import get_all_volunteers, get_volunteers_by_day, get_volunteers_by_name, get_schedule_grouped_by_day, get_volunteer_at_datetime

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

class FlightDepartureRequest(BaseModel):
    flight_number: str
    date: str

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!", "environment": os.getenv("ENVIRONMENT", "development")}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/flight-departure")
async def get_flight_departure(request: FlightDepartureRequest):
    try:
        details_list = get_flight_details(request.flight_number, request.date)
        if details_list:
            return {
                "status": "success", 
                "flights": details_list
            }
        else:
            return {"status": "not_found", "message": "Flight details not found for the given parameters."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/csv-head")
async def get_head(n: int = 5):
    try:
        rows = get_csv_head(n)
        if rows is not None:
            return {"status": "success", "data": rows}
        else:
            return {"status": "not_found", "message": "No CSV files found in the data directory."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

# ---------------------------------------------------------------------------
# Volunteer endpoints
# ---------------------------------------------------------------------------

@app.get("/api/volunteers")
async def list_volunteers(name: Optional[str] = None):
    """Return all volunteer shifts, or filter by volunteer name via ?name=<name>."""
    try:
        data = get_volunteers_by_name(name) if name else get_all_volunteers()
        return {"status": "success", "count": len(data), "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/volunteers/schedule")
async def volunteer_schedule():
    """Return the full volunteer schedule grouped by day in weekly order."""
    try:
        data = get_schedule_grouped_by_day()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/volunteers/day/{day}")
async def volunteers_by_day(day: str):
    """Return all volunteer shifts for a specific day (e.g. Monday)."""
    try:
        data = get_volunteers_by_day(day)
        if not data:
            raise HTTPException(status_code=404, detail=f"No volunteers found for day: {day}")
        return {"status": "success", "count": len(data), "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/volunteers/lookup")
async def lookup_volunteer(datetime: str):
    """
    Return the volunteer on duty at a given datetime.
    Accepts an ISO 8601 datetime string via query param, e.g.:
      /api/volunteers/lookup?datetime=2026-03-24T14:30:00
    """
    try:
        name = get_volunteer_at_datetime(datetime)
        if name:
            return {"status": "available", "volunteer_name": name}
        return {"status": "unavailable", "volunteer_name": None}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid datetime format: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
