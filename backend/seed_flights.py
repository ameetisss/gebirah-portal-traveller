import csv
import os
from database import get_admin_supabase

def seed_flights():
    supabase = get_admin_supabase()
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    
    # 1. Find all CSV files
    csv_files = [f for f in os.listdir(data_dir) if f.endswith(".csv")]
    if not csv_files:
        print("No CSV files found in data directory.")
        return

    all_flights = []
    
    for filename in csv_files:
        filepath = os.path.join(data_dir, filename)
        print(f"Reading {filename}...")
        
        with open(filepath, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # Clean up data
                    flight_number = row.get("Flight Number", "").strip()
                    if not flight_number:
                        continue
                        
                    flight_entry = {
                        "search_date": row.get("Search Date"),
                        "destination_country": row.get("Destination Country"),
                        "arrival_airport": row.get("Arrival Airport"),
                        "airline": row.get("Airline"),
                        "flight_number": flight_number,
                        "departure_time": row.get("Departure Time"),
                        "arrival_time": row.get("Arrival Time"),
                        "price_sgd": float(row.get("Price (SGD)", 0).replace(",", "")) if row.get("Price (SGD)") else 0
                    }
                    all_flights.append(flight_entry)
                except Exception as e:
                    print(f"Skipping row due to error: {e}")

    if not all_flights:
        print("No valid flight data found.")
        return

    print(f"Inserting {len(all_flights)} flights into Supabase...")
    
    # Batch insert in chunks to avoid large request errors
    chunk_size = 100
    for i in range(0, len(all_flights), chunk_size):
        chunk = all_flights[i : i + chunk_size]
        try:
            res = supabase.table("flights").upsert(chunk, on_conflict="flight_number, departure_time").execute()
            print(f"  - Inserted chunk {i//chunk_size + 1}")
        except Exception as e:
            print(f"Error inserting chunk: {e}")
            print("Trying regular insert (no upsert)...")
            try:
                 supabase.table("flights").insert(chunk).execute()
                 print(f"  - Inserted chunk {i//chunk_size + 1} (fallback)")
            except Exception as e2:
                 print(f"Final error for chunk: {e2}")

if __name__ == "__main__":
    seed_flights()
