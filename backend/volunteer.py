from datetime import datetime
import random
from typing import List, Optional
from database import get_supabase

def get_supabase():
    from database import supabase
    return supabase

def get_all_volunteers() -> List[dict]:
    """Return all volunteer schedules from Supabase."""
    res = get_supabase().table("volunteer_schedules").select(
        "id, day_of_week, start_time, end_time, volunteers(user_id, reliability_score)"
    ).execute()
    return res.data

def get_volunteers_by_day(day: str) -> List[dict]:
    """Return volunteer shifts filtered by a specific day (case-insensitive)."""
    res = get_supabase().table("volunteer_schedules").select(
        "*"
    ).ilike("day_of_week", day).execute()
    return res.data

def get_volunteer_at_datetime(dt_str: str) -> Optional[str]:
    """
    Query Supabase for a volunteer whose schedule covers the given ISO datetime string.
    """
    dt = datetime.fromisoformat(dt_str)
    query_day = dt.strftime("%A")          # e.g. "Monday"
    query_time = dt.strftime("%H:%M:%S")    # e.g. 14:30:00

    # Query schedules that match the day of week
    res = get_supabase().table("volunteer_schedules").select(
        "id, start_time, end_time, volunteers(user_id)"
    ).eq("day_of_week", query_day).execute()

    matches = []
    for entry in res.data:
        # PostgreSQL TIME types are compared
        if entry["start_time"] <= query_time < entry["end_time"]:
            matches.append(entry["volunteers"]["user_id"])

    if not matches:
        return None

    # Pick a random volunteer from available ones
    selected_user_id = random.choice(matches)
    
    # Lookup profile
    v_profile = get_supabase().table("user_profiles").select("full_name, phone").eq("id", selected_user_id).execute()
    
    if v_profile.data:
        return {
            "name": v_profile.data[0]["full_name"],
            "phone": v_profile.data[0].get("phone", "+65 9123 4567")
        }

    return {
        "name": f"Volunteer ({selected_user_id[:8]})",
        "phone": "+65 9123 4567"
    }

def get_schedule_grouped_by_day() -> dict:
    """Return the full schedule grouped by day in weekly order from Supabase."""
    DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    res = get_supabase().table("volunteer_schedules").select("*").execute()
    
    grouped = {day: [] for day in DAYS_ORDER}
    for entry in res.data:
        day = entry["day_of_week"]
        if day in grouped:
            grouped[day].append(entry)
    
    for day in grouped:
        grouped[day].sort(key=lambda x: x["start_time"])
    return grouped
