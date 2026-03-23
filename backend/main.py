from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from typing import Dict, List, Optional
from flights import fetch_regional_flights
from csv_service import get_flight_details, get_csv_head

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
