import os
import csv
from typing import Optional, Dict, List

def get_flight_details(flight_number: str, search_date: str) -> List[Dict[str, str]]:
    """
    Scans the 'data' directory for CSV files and looks for matching 
    flight numbers and search dates. Returns a list of flight details.
    """
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
