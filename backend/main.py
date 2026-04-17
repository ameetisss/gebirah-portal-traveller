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
from models import Trip, LoginRequest, TripCreateRequest, ItemRequest, ItemRequestCreate, TripPatchRequest, ItemRequestPatchRequest, ActivityLogCreate

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Gebirah Portal Backend")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
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
MOCK_REQUESTER_ID = "00000000-0000-0000-0000-000000000002"

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
        
        # --- DEMO OVERRIDE: Persistent Volunteer Profile ---
        CANONICAL_ZAYAR_ID = "e3fc5e69-db54-4cdf-b2b1-377358040670"
        
        if request.role == "volunteer":
            # If logging in as 'volunteer' (no email/phone provided in a way that matches)
            # or if using a generic identifier, always return the Zayar Lin account.
            is_generic = False
            if not request.email and not request.phone:
                is_generic = True
            elif request.email == "volunteer@example.com" or request.phone == "volunteer":
                is_generic = True
            elif not res.data:
                # If no user found, instead of creating a NEW anonymous user, 
                # let's assume this is the demo user.
                is_generic = True
                
            if is_generic:
                res_canonical = supabase.table("user_profiles").select("*").eq("id", CANONICAL_ZAYAR_ID).execute()
                if res_canonical.data:
                    return {"status": "success", "data": res_canonical.data[0]}
        # ---------------------------------------------------

        if res.data:
            user_data = res.data[0]
            # Always trust the role the user selected on the login page
            user_data["role"] = request.role or user_data.get("role", "traveller")
            return {"status": "success", "data": user_data}
        else:
            # Create new user
            new_user = {
                "role": request.role or "traveller",
                "email": request.email,
                "phone": request.phone,
                "full_name": request.email.split("@")[0] if request.email else (request.role or "User")
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
    """Fetch trips from Supabase. If traveller_id is omitted, fetch all."""
    try:
        supabase = get_supabase()
        query = supabase.table("trips").select("*, user_profiles(full_name)")
        if traveller_id:
            query = query.eq("traveller_id", traveller_id)
        
        res = query.execute()
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

@app.put("/api/trips/{trip_id}/status")
async def update_trip_status(trip_id: str, payload: dict):
    """Generic status update for a trip."""
    try:
        new_status = payload.get("status")
        if not new_status:
            raise HTTPException(status_code=400, detail="Status is required")
            
        supabase = get_supabase()
        res = supabase.table("trips").update({"status": new_status}).eq("trips_id", trip_id).execute()
        
        if res.data:
            return {"status": "success", "data": res.data[0]}
        else:
            raise HTTPException(status_code=404, detail="Trip not found")
    except Exception as e:
        print(f"Error updating status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/trips/{trip_id}")
async def patch_trip(trip_id: str, request: TripPatchRequest):
    """Patch a single trip (e.g. upload proofs)"""
    try:
        data = request.model_dump(exclude_unset=True)
        if not data:
            return {"status": "success", "message": "No changes provided"}
            
        supabase = get_supabase()
        res = supabase.table("trips").update(data).eq("trips_id", trip_id).execute()
        
        if res.data:
            return {"status": "success", "data": res.data[0]}
        else:
            raise HTTPException(status_code=404, detail="Trip not found")
    except Exception as e:
        print(f"Error patching trip: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class MatchSelection(BaseModel):
    matches: List[dict]
    total_weight: float

@app.put("/api/trips/{trip_id}/confirm-matches")
async def confirm_matches(trip_id: str, selection: MatchSelection):
    """Save the final selected matches and update item_requests statuses."""
    try:
        supabase = get_supabase()
        
        # 1. Update trip details
        trip_res = supabase.table("trips").select("*").eq("trips_id", trip_id).execute()
        trip = trip_res.data[0]
        handover = trip.get("handover_data") or {}
        arrival = trip.get("arrival_data") or {}
        
        handover["items"] = selection.matches
        handover["totalWeight"] = selection.total_weight
        arrival["items"] = selection.matches
        arrival["totalWeight"] = selection.total_weight
        
        # 1.5. Ensure a volunteer is assigned to the handover
        if not handover.get("volunteer"):
            v_res = supabase.table("user_profiles").select("id, full_name, phone").eq("role", "volunteer").neq("phone", None).execute()
            if v_res.data:
                volunteer = random.choice(v_res.data)
                handover.update({
                    "volunteer_id": volunteer["id"],
                    "volunteer": volunteer["full_name"],
                    "volunteerPhone": volunteer["phone"],
                    "volunteerInitials": "".join([n[0] for n in volunteer["full_name"].split()[:2]]).upper(),
                    "location": f"Terminal {random.randint(1, 4)} Departure Hall",
                    "landmark": f"Near Check-in Row {random.choice('ABCDEFG')}"
                })
        
        res = supabase.table("trips").update({
            "match_data": selection.matches,
            "allocated_capacity_kg": selection.total_weight,
            "handover_data": handover,
            "arrival_data": arrival,
            "status": "handover"
        }).eq("trips_id", trip_id).execute()
        
        # 2. Update status of corresponding item_requests to 'Matched'
        for match in selection.matches:
            match_id = match.get("id")
            # Only update if it's a real request ID (UUID format, not fallback-...)
            if match_id and not str(match_id).startswith("fallback-") and not str(match_id).startswith("mock-"):
                supabase.table("item_requests").update({
                    "status": "Matched",
                    "arrival_info": f"Matched with Flight {trip.get('flight_number')} to {trip.get('destination')}"
                }).eq("id", match_id).execute()

        return {"status": "success", "data": res.data[0] if res.data else None}
    except Exception as e:
        print(f"Error confirming matches: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# Match endpoints
# ---------------------------------------------------------------------------

# Hierarchical location clusters (Destination -> [Search Terms])
# This ensures that a search for a code (RGN) matches both the city (Yangon) and country (Myanmar)
LOCATION_CLUSTERS = {
    # Myanmar
    "RGN": ["Myanmar", "Yangon", "RGN"],
    "Yangon": ["Myanmar", "Yangon", "RGN"],
    "Myanmar": ["Myanmar", "Yangon", "RGN"],
    
    # Cambodia
    "PNH": ["Cambodia", "Phnom Penh", "PNH"],
    "Phnom Penh": ["Cambodia", "Phnom Penh", "PNH"],
    "Cambodia": ["Cambodia", "Phnom Penh", "PNH"],
    
    # Vietnam
    "SGN": ["Vietnam", "Saigon", "Ho Chi Minh City", "SGN"],
    "Saigon": ["Vietnam", "Saigon", "Ho Chi Minh City", "SGN"],
    "HAN": ["Vietnam", "Hanoi", "HAN"],
    "Hanoi": ["Vietnam", "Hanoi", "HAN"],
    "Vietnam": ["Vietnam", "Saigon", "Hanoi", "SGN", "HAN"], 
    
    # Philippines
    "MNL": ["Philippines", "Manila", "MNL"],
    "Manila": ["Philippines", "Manila", "MNL"],
    "CEB": ["Philippines", "Cebu", "CEB"],
    "Cebu": ["Philippines", "Cebu", "CEB"],
    "Philippines": ["Philippines", "Manila", "Cebu", "MNL", "CEB"],
    
    # Indonesia
    "CGK": ["Indonesia", "Jakarta", "CGK"],
    "Jakarta": ["Indonesia", "Jakarta", "CGK"],
    "DPS": ["Indonesia", "Bali", "DPS"],
    "Bali": ["Indonesia", "Bali", "DPS"],
    "Indonesia": ["Indonesia", "Jakarta", "Bali", "CGK", "DPS"]
}

def get_search_terms(destination: str) -> list[str]:
    """Resolve a destination string to a list of matching search terms."""
    if not destination:
        return []
    cleaned = destination.split('(')[0].strip()
    return LOCATION_CLUSTERS.get(cleaned, [cleaned])


@app.get("/api/matches/generate")
async def generate_match(weight: float, destination: Optional[str] = None):
    """Generate up to 3 matches prioritizing real item_requests."""
    try:
        supabase = get_supabase()
        
        # 1. Try to find real user requests that are 'Waiting' and fit the weight
        query = supabase.table("item_requests").select("*, user_profiles(full_name)").eq("status", "Waiting").lte("weight_kg", weight)
        
        if destination:
            terms = get_search_terms(destination)
            print(f"Generating matches for terms: {terms}")
            
            # Use Supabase's OR filter to check for any term in the cluster
            if len(terms) > 1:
                or_filter = ",".join([f"destination.ilike.%{t}%" for t in terms])
                query = query.or_(or_filter)
            else:
                query = query.ilike("destination", f"%{terms[0]}%")

            
        res = query.execute()
        requests = res.data or []
        
        data_list = []
        
        # 2. Map real requests to the UI format
        for req in requests[:3]:
            data_list.append({
                "id": req["id"], # Store the actual request ID
                "name": req["description"],
                "weight": float(req["weight_kg"]),
                "requester": req.get("user_profiles", {}).get("full_name") or "Relief Coordinator",
                "description": f"Urgency: {req['urgency']} · {req['destination']}"
            })
            
        # 3. No fallbacks - return empty if no real items found
        return {"status": "success", "data": data_list}
    except Exception as e:
        print(f"Match generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# Request endpoints (for Requesters)
# ---------------------------------------------------------------------------

@app.post("/api/item-requests")
async def create_item_request(request: ItemRequestCreate):
    """Save a new item request in Supabase."""
    try:
        supabase = get_supabase()
        res = supabase.table("item_requests").insert({
            "user_id": request.user_id or MOCK_REQUESTER_ID,
            "description": request.description,
            "weight_kg": request.weight,
            "urgency": request.urgency,
            "destination": request.destination,
            "reason": request.reason,
            "status": "Waiting"
        }).execute()
        
        if res.data:
            return {"status": "success", "data": res.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create request in database")
    except Exception as e:
        print(f"Error creating item request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/item-requests/{request_id}")
async def patch_item_request(request_id: str, request: ItemRequestPatchRequest):
    """Patch a single item request (e.g. status, delivery_proof)"""
    try:
        data = request.model_dump(exclude_unset=True)
        if not data:
            return {"status": "success", "message": "No changes"}
            
        db_data = {}
        if "status" in data: db_data["status"] = data["status"]
        if "arrival_info" in data: db_data["arrival_info"] = data["arrival_info"]
        if "delivery_proof" in data: db_data["delivery_proof"] = data["delivery_proof"]
        
        if "routeLabel" in data and "arrival_info" not in db_data:
            db_data["arrival_info"] = data["routeLabel"]
            
        if not db_data:
            return {"status": "success", "message": "No database fields updated"}
            
        supabase = get_supabase()
        res = supabase.table("item_requests").update(db_data).eq("id", request_id).execute()
        
        if res.data:
            return {"status": "success", "data": res.data[0]}
        else:
            raise HTTPException(status_code=404, detail="ItemRequest not found")
    except Exception as e:
        print(f"Error patching item request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/item-requests/{request_id}/requeue")
async def requeue_request(request_id: str, reason: str = "Exception"):
    """Reset a request to 'Waiting' status and log the exception."""
    try:
        supabase = get_supabase()
        res = supabase.table("item_requests").update({
            "status": "Waiting",
            "arrival_info": None
        }).eq("id", request_id).execute()
        
        return {"status": "success", "data": res.data[0] if res.data else None}
    except Exception as e:
        print(f"Error re-queuing request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/item-requests")
async def get_item_requests(user_id: Optional[str] = None):
    """Fetch active (non-delivered) requests. If user_id is omitted, fetch all."""
    try:
        supabase = get_supabase()
        query = supabase.table("item_requests").select("*").neq("status", "Delivered")
        if user_id:
            query = query.eq("user_id", user_id)
        
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/item-requests/history")
async def get_item_request_history(user_id: Optional[str] = None):
    """Fetch historical (delivered) requests. If user_id is omitted, fetch all."""
    try:
        supabase = get_supabase()
        query = supabase.table("item_requests").select("*").eq("status", "Delivered")
        if user_id:
            query = query.eq("user_id", user_id)
            
        res = query.execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
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
                    "location": f"Changi T{random.randint(1, 4)} Departure Hall",
                    "landmark": f"Near Check-in Row {random.choice('ABCDEFG')}, Level 2"
                }
            }
        return {"status": "unavailable", "data": None}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid datetime format: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/volunteers/assignments")
async def get_volunteer_assignments(user_id: Optional[str] = None):
    """Fetch trips where the user is an assigned volunteer (handover or arrival)."""
    try:
        # --- DEMO OVERRIDE: ALWAYS USE ZAYAR LIN'S ID ---
        target_id = "e3fc5e69-db54-4cdf-b2b1-377358040670"
        # ------------------------------------------------

        supabase = get_supabase()
        
        # We need to query both handover_data and arrival_data for our ID
        # PostgREST JSON path filtering: table.column->>path = value
        h_res = supabase.table("trips").select("*").eq("handover_data->>volunteer_id", target_id).execute()
        a_res = supabase.table("trips").select("*").eq("arrival_data->>volunteer_id", target_id).execute()
        
        print(f"Volunteer Assignments Debug: target_id={target_id}, handover={len(h_res.data)}, arrival={len(a_res.data)}")
        
        combined = h_res.data + a_res.data
        
        # Deduplicate if assigned to both (rare but possible)
        seen_ids = set()
        unique_trips = []
        for t in combined:
            if t["trips_id"] not in seen_ids:
                unique_trips.append(t)
                seen_ids.add(t["trips_id"])
                
        return {"status": "success", "data": unique_trips}
    except Exception as e:
        print(f"Error fetching assignments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/volunteers/assignments/{trip_id}/status")
async def update_assignment_status(trip_id: str, payload: dict):
    """Update the status within handover_data or arrival_data for a volunteer."""
    try:
        new_stage = payload.get("stage")
        volunteer_id = payload.get("volunteer_id")
        if not new_stage or not volunteer_id:
            raise HTTPException(status_code=400, detail="stage and volunteer_id are required")
            
        supabase = get_supabase()
        trip_res = supabase.table("trips").select("*").eq("trips_id", trip_id).execute()
        if not trip_res.data:
            raise HTTPException(status_code=404, detail="Trip not found")
            
        trip = trip_res.data[0]
        handover = trip.get("handover_data") or {}
        arrival = trip.get("arrival_data") or {}
        
        updated = False
        if handover.get("volunteer_id") == volunteer_id:
            handover["stage"] = new_stage
            updated = True
        if arrival.get("volunteer_id") == volunteer_id:
            arrival["stage"] = new_stage
            updated = True
            
        if not updated:
            raise HTTPException(status_code=403, detail="Volunteer not assigned to this trip")
            
        res = supabase.table("trips").update({
            "handover_data": handover,
            "arrival_data": arrival
        }).eq("trips_id", trip_id).execute()
        
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        print(f"Error updating assignment status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/volunteers/own-availability")
async def get_own_availability(user_id: str):
    """Fetch availability for the logged-in volunteer."""
    try:
        supabase = get_supabase()
        # Find the volunteer entry for this user_id
        v_res = supabase.table("volunteers").select("user_id").eq("profile_id", user_id).execute()
        if not v_res.data:
            return {"status": "success", "data": []}
            
        vol_id = v_res.data[0]["user_id"]
        res = supabase.table("volunteer_schedules").select("*").eq("volunteer_id", vol_id).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/overseas-volunteer")
async def get_overseas_volunteer(destination: str):
    """Scan database for overseas volunteers matching the destination."""
    try:
        supabase = get_supabase()
        
        # Resolve destination to search terms
        terms = get_search_terms(destination)
        print(f"Searching overseas volunteer for terms: {terms}")

        # Try to find volunteers matching any term in the cluster
        res = supabase.table("volunteers").select("user_profiles(full_name, phone)").eq("type", "overseas").in_("location", terms).execute()

        
        # If no specific match, try any overseas volunteer
        if not res.data:
            res = supabase.table("volunteers").select("user_profiles(full_name, phone)").eq("type", "overseas").execute()
            
        if res.data:
            choice = random.choice(res.data)
            profile = choice["user_profiles"]
            name = profile["full_name"]
            initials = "".join([n[0] for n in name.split()[:2]]).upper()
            return {
                "status": "success", 
                "data": {
                    "volunteer_id": profile.get("id"),
                    "volunteer": name,
                    "volunteerInitials": initials,
                    "volunteerPhone": profile.get("phone", "+962 79 123 4567"),
                    "location": "Main Arrivals Hall",
                    "landmark": "Holding a Gebirah sign"
                }
            }
            
        # Hardcoded fallback if DB is empty
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

# ---------------------------------------------------------------------------
# Activity Log endpoints
# ---------------------------------------------------------------------------

@app.get("/api/activity-logs")
async def get_activity_logs():
    """Fetch all coordinator activity logs from Supabase."""
    try:
        supabase = get_supabase()
        res = supabase.table("activity_log").select("*").order("created_at", desc=True).limit(50).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/activity-logs")
async def create_activity_log(log: ActivityLogCreate):
    """Create a new activity log entry."""
    try:
        supabase = get_supabase()
        res = supabase.table("activity_log").insert(log.model_dump()).execute()
        if res.data:
            return {"status": "success", "data": res.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create activity log")
    except Exception as e:
        print(f"Error creating activity log: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# Handover Brief endpoint
# ---------------------------------------------------------------------------

@app.put("/api/trips/{trip_id}/dispatch-brief")
async def dispatch_brief(trip_id: str):
    """Mark the handover brief as dispatched in the trip's record."""
    try:
        supabase = get_supabase()
        # Fetch current trip to get current handover_data
        trip_res = supabase.table("trips").select("handover_data").eq("trips_id", trip_id).execute()
        if not trip_res.data:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        handover = trip_res.data[0].get("handover_data") or {}
        handover["brief_dispatched"] = True
        handover["brief_dispatched_at"] = str(datetime.now())
        
        res = supabase.table("trips").update({"handover_data": handover}).eq("trips_id", trip_id).execute()
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        print(f"Error dispatching brief: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/coordinators/volunteers")
async def get_all_volunteer_profiles():
    """Fetch all volunteers with their reliability scores and status."""
    try:
        supabase = get_supabase()
        res = supabase.table("user_profiles").select("*, volunteers(*)").eq("role", "volunteer").execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/coordinators/analytics/fulfillment")
async def get_fulfillment_rate():
    """Calculate fulfillment rate for the last 30 days based on real data."""
    try:
        supabase = get_supabase()
        
        # 1. Fetch all requests
        req_res = supabase.table("item_requests").select("id, status, created_at").execute()
        all_reqs = req_res.data or []
        
        total_count = len(all_reqs)
        fulfilled_count = len([r for r in all_reqs if r.get("status") == "Delivered"])
        
        rate = (fulfilled_count / total_count * 100) if total_count > 0 else 0
        
        # 2. Daily trend (last 7 days)
        from datetime import datetime, timedelta
        today = datetime.now().date()
        days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
        
        daily_trend = []
        for day in days:
            day_str = day.strftime("%Y-%m-%d")
            # In a real app we'd query this efficiently, but for the demo we'll filter the list
            count = len([r for r in all_reqs if r.get("created_at") and r["created_at"].startswith(day_str)])
            daily_trend.append({"date": day_str, "count": count})
            
        return {
            "status": "success",
            "data": {
                "fulfillment_rate": round(rate, 1),
                "total_requests": total_count,
                "fulfilled_requests": fulfilled_count,
                "daily_trend": daily_trend
            }
        }
    except Exception as e:
        print(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
