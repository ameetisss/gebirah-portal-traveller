from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class LoginRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None

class VolunteerSchedule(BaseModel):
    id: Optional[str] = None
    volunteer_id: str
    day_of_week: str
    start_time: str
    end_time: str

    model_config = ConfigDict(from_attributes=True)

class CatalogueItem(BaseModel):
    id: Optional[str] = None
    name: str
    min_weight_kg: float
    max_weight_kg: float

    model_config = ConfigDict(from_attributes=True)

class Volunteer(BaseModel):
    user_id: str
    type: str # 'sg' or 'overseas'
    is_available: bool = True
    availability_start: Optional[datetime] = None
    availability_end: Optional[datetime] = None
    is_booked: bool = False
    total_assignments: int = 0
    reliability_score: float = 0.0

    model_config = ConfigDict(from_attributes=True)

class Trip(BaseModel):
    trips_id: Optional[str] = None
    traveller_id: str
    flight_number: str
    destination: str
    departure_date: str
    declared_capacity_kg: float
    allocated_capacity_kg: Optional[float] = 0.0
    status: str = "upcoming"
    match_data: Optional[List[dict]] = None
    handover_data: Optional[dict] = None
    arrival_data: Optional[dict] = None
    candidate_matches: Optional[List[dict]] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TripCreateRequest(BaseModel):
    traveller_id: Optional[str] = None
    destination: str
    flight: str
    date: str
    weight: float
    departure_time: Optional[str] = None
    status: Optional[str] = "awaiting"
    match_data: Optional[List[dict]] = None
    handover_data: Optional[dict] = None
    arrival_data: Optional[dict] = None
    candidate_matches: Optional[List[dict]] = None
    allocated_capacity_kg: Optional[float] = 0.0

class Flight(BaseModel):
    id: Optional[str] = None
    search_date: str
    destination_country: str
    arrival_airport: str
    airline: str
    flight_number: str
    departure_time: str
    arrival_time: str
    price_sgd: float

    model_config = ConfigDict(from_attributes=True)
