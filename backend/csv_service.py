import os
import csv
from typing import Optional, Dict, List
from database import get_supabase

def get_flight_details(flight_number: str, search_date: str) -> List[Dict[str, str]]:
    """
    Looks for matching flight numbers and search dates in Supabase,
    falling back to CSV scanning if no database results are found.
    """
    results = []
    
    # 1. Try Supabase first (Faster/Robust)
    try:
        supabase = get_supabase()
        # Clean the input for comparison just in case
        clean_flight = "".join(flight_number.split()).upper()
        
        # We search by search_date and flight_number
        # Note: In Supabase, the column might be slightly different or need exact matches
        # We'll try to find the flight. Since we use 'UB 2' pattern, let's try direct matches.
        res = supabase.table("flights").select("*").eq("search_date", search_date).execute()
        
        if res.data:
            for row in res.data:
                db_flight = "".join(row.get("flight_number", "").split()).upper()
                if db_flight == clean_flight:
                    results.append({
                        "departure_time": row.get("departure_time", "").strip(),
                        "arrival_airport": row.get("arrival_airport", "").strip(),
                        "destination_country": row.get("destination_country", "").strip()
                    })
            if results:
                return results
    except Exception as e:
        print(f"Supabase flight lookup error: {e}")

    # 2. Fallback to CSV scanning
    data_dir = "data"
    results = []
    
    # If the directory doesn't exist, we obviously have no data
    if not os.path.exists(data_dir):
        return results

    # Iterate through all CSV files in the data directory
    for filename in os.listdir(data_dir):
        if not filename.endswith(".csv"):
            continue
            
        filepath = os.path.join(data_dir, filename)
        
        try:
            with open(filepath, mode="r", encoding="utf-8") as csv_file:
                # Use DictReader to depend on column names rather than indices
                reader = csv.DictReader(csv_file)
                
                for row in reader:
                    # Depending on how it's saved, flight_number might have extra spaces.
                    # We strip to be safe and do a case-insensitive check if needed.
                    csv_flight = "".join(row.get("Flight Number", "").split()).upper()
                    target_flight = "".join(flight_number.split()).upper()
                    
                    csv_date = row.get("Search Date", "").strip()
                    target_date = search_date.strip()
                    
                    if csv_flight == target_flight and csv_date == target_date:
                        results.append({
                            "departure_time": row.get("Departure Time", "").strip(),
                            "arrival_airport": row.get("Arrival Airport", "").strip(),
                            "destination_country": row.get("Destination Country", "").strip()
                        })
                        
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            
    return results

def get_csv_head(n: int = 5) -> Optional[list]:
    """
    Returns the first n rows of the first CSV file found in the 'data' directory.
    """
    data_dir = "data"
    if not os.path.exists(data_dir):
        return None

    for filename in os.listdir(data_dir):
        if filename.endswith(".csv"):
            filepath = os.path.join(data_dir, filename)
            try:
                with open(filepath, mode="r", encoding="utf-8") as csv_file:
                    reader = csv.DictReader(csv_file)
                    rows = []
                    for i, row in enumerate(reader):
                        if i >= n:
                            break
                        rows.append(row)
                    return rows
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
    return None
