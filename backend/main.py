from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import uuid
import random
from pydantic import BaseModel
from typing import Dict, List, Optional
from flights import fetch_regional_flights
from csv_service import get_flight_details, get_csv_head
from volunteer import get_all_volunteers, get_volunteers_by_day, get_schedule_grouped_by_day, get_volunteer_at_datetime
from database import get_supabase
from models import Trip, LoginRequest, TripCreateRequest

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Gebirah Portal Backend")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    # Add production frontend URLs here when deployed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock user ID for the traveller (in a real app, this comes from Auth)
MOCK_TRAVELLER_ID = "00000000-0000-0000-0000-000000000001"

class FlightSearchRequest(BaseModel):
    departure_airport: str = "SIN"
    destinations: Dict[str, List[str]]
    start_date: str
    end_date: str

class FlightDepartureRequest(BaseModel):
    flight_number: str
    date: str

# (TripCreateRequest moved to models.py)

@app.get("/")
def read_root():
    return {"message": "Hello from Gebirah API!", "database": "Supabase Connected"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/csv-head")
async def get_head(n: int = 20):
    """Retrieve the top N rows from the flight CSV files."""
    try:
        rows = get_csv_head(n)
        if rows is not None:
            return {"status": "success", "data": rows}
        else:
            return {"status": "not_found", "message": "No CSV files found in the data directory."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login")
async def login(request: LoginRequest):
    """Simple login/register: returns traveller_id for a given email or phone."""
    try:
        if not request.email and not request.phone:
            raise HTTPException(status_code=400, detail="Email or Phone is required")
            
        supabase = get_supabase()
        
        # Check if user exists
        query = supabase.table("user_profiles").select("id, full_name, email, role")
        if request.email:
            query = query.eq("email", request.email)
        else:
            query = query.eq("phone", request.phone)
            
        res = query.execute()
        
        if res.data:
            return {"status": "success", "data": res.data[0]}
        else:
            # Create new user
            new_user = {
                "role": "traveller",
                "email": request.email,
                "phone": request.phone,
                "full_name": request.email.split("@")[0] if request.email else "Traveller"
            }
            res_insert = supabase.table("user_profiles").insert(new_user).execute()
            if res_insert.data:
                return {"status": "success", "data": res_insert.data[0]}
            else:
                raise HTTPException(status_code=500, detail="Failed to create user profile")
                
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# Trip endpoints
# ---------------------------------------------------------------------------

@app.post("/api/trips")
async def create_trip(request: TripCreateRequest):
    """Register a new trip in Supabase."""
    try:
        supabase = get_supabase()
        
        # Insert into trips table with JSON state
        res = supabase.table("trips").insert({
            "traveller_id": request.traveller_id or MOCK_TRAVELLER_ID,
            "flight_number": request.flight,
            "destination": request.destination,
            "departure_date": request.date,
            "declared_capacity_kg": request.weight,
            "allocated_capacity_kg": request.allocated_capacity_kg or 0.0,
            "status": request.status or "awaiting",
            "match_data": request.match_data,
            "handover_data": request.handover_data,
            "arrival_data": request.arrival_data,
            "candidate_matches": request.candidate_matches
        }).execute()
        
        if res.data:
            return {"status": "success", "data": res.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create trip in database")
            
    except Exception as e:
        print(f"Error creating trip: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips/history")
async def get_trip_history(traveller_id: Optional[str] = None):
    """Fetch all completed trips for the traveller from Supabase."""
    try:
        target_id = traveller_id or MOCK_TRAVELLER_ID
        supabase = get_supabase()
        res = supabase.table("trips").select("*").eq("traveller_id", target_id).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/trips/{trip_id}/complete")
async def complete_trip(trip_id: str):
    """Mark a trip as completed in Supabase."""
    try:
        supabase = get_supabase()
        res = supabase.table("trips").update({"status": "completed"}).eq("trips_id", trip_id).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MatchSelection(BaseModel):
    matches: List[dict]
    total_weight: float

@app.put("/api/trips/{trip_id}/confirm-matches")
async def confirm_matches(trip_id: str, selection: MatchSelection):
    """Save the final selected matches and progress to handover stage."""
    try:
        supabase = get_supabase()
        
        # Get trip details to update handover/arrival summaries
        trip_res = supabase.table("trips").select("*").eq("trips_id", trip_id).execute()
        if not trip_res.data:
            raise HTTPException(status_code=404, detail="Trip not found")
            
        trip = trip_res.data[0]
        handover = trip.get("handover_data") or {}
        arrival = trip.get("arrival_data") or {}
        
        # Update items in summaries
        handover["items"] = selection.matches
        handover["totalWeight"] = selection.total_weight
        arrival["items"] = selection.matches
        arrival["totalWeight"] = selection.total_weight
        
        res = supabase.table("trips").update({
            "match_data": selection.matches,
            "allocated_capacity_kg": selection.total_weight,
            "handover_data": handover,
            "arrival_data": arrival,
            "status": "handover"
        }).eq("trips_id", trip_id).execute()
        
        return {"status": "success", "data": res.data[0] if res.data else None}
    except Exception as e:
        print(f"Error confirming matches: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# Match endpoints
# ---------------------------------------------------------------------------

@app.get("/api/matches/generate")
async def generate_match(weight: float):
    """Generate up to 3 matches from catalogue_items based on capacity."""
    try:
        supabase = get_supabase()
        # Find items that fit the weight
        res = supabase.table("catalogue_items").select("*").lte("min_weight_kg", weight).execute()
        items = res.data
        
        if not items:
             # Fallback if DB is empty or no fits
             items = [
                 {"name": "Clothing", "min_weight_kg": 1.5, "requester_name": "Islamic Relief"},
                 {"name": "First Aid Kit", "min_weight_kg": 0.5, "requester_name": "Global Relief Fund"},
                 {"name": "Educational Books", "min_weight_kg": 2.0, "requester_name": "Save the Children"}
             ]
        else:
            import random
            # Randomize and pick up to 3
            random.shuffle(items)
            items = items[:3]
             
        data_list = []
        for item in items:
            data_list.append({
                "name": item["name"],
                "weight": item["min_weight_kg"],
                "requester": item.get("requester_name") or "Global Relief Fund",
                "description": f"Shipment of {item['name'].lower()}"
            })
            
        return {"status": "success", "data": data_list}
    except Exception as e:
        print(f"Match generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# Flight endpoints
# ---------------------------------------------------------------------------

@app.post("/api/flight-departure")
async def get_flight_departure(request: FlightDepartureRequest):
    try:
        details_list = get_flight_details(request.flight_number, request.date)
        if details_list:
            return {"status": "success", "flights": details_list}
        return {"status": "not_found", "message": "Flight details not found."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fetch-flights")
async def trigger_flight_fetch(request: FlightSearchRequest):
    api_key = os.getenv("SERPAPI_KEY")
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

@app.get("/api/volunteers/schedule")
async def volunteer_schedule():
    try:
        data = get_schedule_grouped_by_day()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/volunteers/lookup")
async def lookup_volunteer(datetime: str):
    try:
        v_data = get_volunteer_at_datetime(datetime)
        if v_data:
            name = v_data["name"]
            initials = "".join([n[0] for n in name.split()[:2]]).upper()
            return {
                "status": "available", 
                "data": {
                    "volunteer": name,
                    "volunteerInitials": initials,
                    "volunteerPhone": v_data["phone"],
                    "location": "T3 Departure Hall, Level 2",
                    "landmark": "Near check-in row G, next to information counter"
                }
            }
        return {"status": "unavailable", "data": None}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid datetime format: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/overseas-volunteer")
async def get_overseas_volunteer(destination: str):
    """Scan database for real overseas volunteers."""
    try:
        supabase = get_supabase()
        # Find volunteers of type 'overseas'
        # In a real app, you'd match by 'destination' coverage in a coverage table, 
        # but for now we look for any 'overseas' volunteer.
        res = supabase.table("volunteers").select("user_profiles(full_name, phone)").eq("type", "overseas").execute()
        
        if res.data:
            choice = random.choice(res.data)
            profile = choice["user_profiles"]
            name = profile["full_name"]
            initials = "".join([n[0] for n in name.split()[:2]]).upper()
            return {
                "status": "success", 
                "data": {
                    "volunteer": name,
                    "volunteerInitials": initials,
                    "volunteerPhone": profile.get("phone", "+962 79 123 4567"),
                    "location": "Main Arrivals Hall",
                    "landmark": "Holding a Gebirah sign"
                }
            }
            
        # Fallback if DB empty
        return {
            "status": "success", 
            "data": {
                "volunteer": "Ahmad R.",
                "volunteerInitials": "AR",
                "volunteerPhone": "+962 79 123 4567",
                "location": "Main Arrivals Hall",
                "landmark": "Holding a Gebirah sign"
            }
        }
    except Exception as e:
        print(f"Overseas volunteer lookup error: {e}")
        return {"status": "not_found", "data": None}
