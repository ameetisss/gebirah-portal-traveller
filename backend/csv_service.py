import os
import csv
from typing import Optional

def get_departure_time(flight_number: str, search_date: str) -> Optional[str]:
    """
    Scans the 'data' directory for CSV files and looks for a matching 
    flight number and search date. Returns the departure time if found.
    """
    data_dir = "data"
    
    # If the directory doesn't exist, we obviously have no data
    if not os.path.exists(data_dir):
        return None

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
                    csv_flight = row.get("Flight Number", "").strip().upper()
                    target_flight = flight_number.strip().upper()
                    
                    csv_date = row.get("Search Date", "").strip()
                    target_date = search_date.strip()
                    
                    if csv_flight == target_flight and csv_date == target_date:
                        return row.get("Departure Time", "").strip()
                        
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            
    # If no match is found across all files
    return None

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
