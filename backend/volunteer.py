import json
import os
from datetime import datetime
from typing import List, Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "volunteer.json")

DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def load_volunteers() -> List[dict]:
    """Load and return all volunteer records from the JSON file."""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_all_volunteers() -> List[dict]:
    """Return the full list of volunteer shift entries."""
    return load_volunteers()


def get_volunteers_by_day(day: str) -> List[dict]:
    """Return volunteer shifts filtered by a specific day (case-insensitive)."""
    volunteers = load_volunteers()
    return [v for v in volunteers if v["day"].lower() == day.lower()]


def get_volunteers_by_name(name: str) -> List[dict]:
    """Return all shifts for a specific volunteer (case-insensitive)."""
    volunteers = load_volunteers()
    return [v for v in volunteers if v["volunteer_name"].lower() == name.lower()]


def get_schedule_grouped_by_day() -> dict:
    """Return the full schedule grouped by day in weekly order."""
    volunteers = load_volunteers()
    grouped: dict = {day: [] for day in DAYS_ORDER}
    for entry in volunteers:
        day = entry["day"]
        if day in grouped:
            grouped[day].append(entry)
    for day in grouped:
        grouped[day].sort(key=lambda x: x["start_time"])
    return grouped


def get_volunteer_at_datetime(dt_str: str) -> Optional[str]:
    """
    Given an ISO 8601 datetime string (e.g. '2026-03-24T14:30:00'),
    return the name of the volunteer whose shift covers that moment,
    or None if no volunteer is on duty.

    Matching logic:
      - The weekday derived from the date must match the shift's 'day' field.
      - The time must satisfy: start_time <= query_time < end_time.
    """
    dt = datetime.fromisoformat(dt_str)
    query_day = dt.strftime("%A")          # e.g. "Monday"
    query_time = dt.time()                  # e.g. 14:30:00

    volunteers = load_volunteers()
    for entry in volunteers:
        if entry["day"] != query_day:
            continue
        shift_start = datetime.strptime(entry["start_time"], "%H:%M").time()
        shift_end   = datetime.strptime(entry["end_time"],   "%H:%M").time()
        if shift_start <= query_time < shift_end:
            return entry["volunteer_name"]

    return None
