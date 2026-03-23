import requests
import time
import csv
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables if this is run as a standalone script
load_dotenv()

def fetch_regional_flights(api_key, departure_airport, destinations, start_date_str, end_date_str):
    """
    Fetches regional flight data using SerpApi.
    """
    url = "https://serpapi.com/search"
    
    # Safety limit
    MAX_SEARCHES = 250
    api_call_count = 0

    # Parse string dates into date objects
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    delta = timedelta(days=1) 
    
    target_dates = []
    current_date = start_date
    while current_date <= end_date:
        target_dates.append(current_date.strftime("%Y-%m-%d"))
        current_date += delta

    total_planned_calls = len(target_dates) * sum(len(airports) for airports in destinations.values())
    
    print(f"Total dates to search: {len(target_dates)}")
    print(f"Total airports to search: {sum(len(airports) for airports in destinations.values())}")
    print(f"Total API calls this script will make: {total_planned_calls}")
    print(f"Hard limit set to: {MAX_SEARCHES}\n")
    
    time.sleep(1)

    # List to store all extracted flight records
    flight_data_results = []

    for country, airports in destinations.items():
        for arrival_airport in airports:
            print(f"\n✈️ Searching flights to {arrival_airport} ({country})...")

            for flight_date in target_dates:
                # The Safety Breaker
                if api_call_count >= MAX_SEARCHES:
                    print(f"\n🛑 HALTED: Maximum API limit of {MAX_SEARCHES} reached.")
                    return flight_data_results

                params = {
                    "engine": "google_flights",
                    "departure_id": departure_airport,
                    "arrival_id": arrival_airport,
                    "outbound_date": flight_date,
                    "type": "2",        
                    "currency": "SGD",  
                    "hl": "en",
                    "api_key": api_key
                }

                try:
                    response = requests.get(url, params=params)
                    api_call_count += 1
                    
                    data = response.json()
                    
                    if "error" in data:
                        print(f"[{api_call_count}/{MAX_SEARCHES}] Error: {data['error']}")
                        continue

                    best_flights = data.get("best_flights", [])
                    
                    if not best_flights:
                        print(f"[{api_call_count}/{MAX_SEARCHES}] {flight_date} | No flights found.")
                        time.sleep(0.5)
                        continue

                    # Extracting the best itinerary
                    top_itinerary = best_flights[0]
                    price = top_itinerary.get("price")
                    
                    flights = top_itinerary.get("flights", [])
                    if not flights:
                        continue
                        
                    first_flight = flights[0]
                    last_flight = flights[-1]
                    
                    airline = first_flight.get("airline")
                    flight_number = first_flight.get("flight_number")
                    dep_time = first_flight.get("departure_airport", {}).get("time")
                    arr_time = last_flight.get("arrival_airport", {}).get("time")
                    
                    print(f"[{api_call_count}/{MAX_SEARCHES}] {flight_date} | {airline} {flight_number} | {dep_time} -> {arr_time} | SGD {price}")

                    # Append the extracted row to our results list
                    flight_data_results.append([
                        flight_date,
                        country,
                        arrival_airport,
                        airline,
                        flight_number,
                        dep_time,
                        arr_time,
                        price
                    ])
                except Exception as e:
                    print(f"Request error: {str(e)}")

                time.sleep(0.5)

    print("\n✅ Data extraction complete.")
    return flight_data_results

if __name__ == "__main__":
    # 1. Define configuration for standalone execution
    api_key = os.getenv("SERPAPI_KEY", "YOUR_SERPAPI_KEY")
    departure_airport = "SIN"
    start_date_str = "2026-05-01"
    end_date_str = "2026-05-31"

    my_destinations = {
        "Myanmar": ["RGN"],           
        "Cambodia": ["PNH"],          
        "Indonesia": ["CGK", "DPS"],  
        "Philippines": ["MNL", "CEB"],
        "Vietnam": ["SGN", "HAN"]     
    }

    # 2. Call the function
    fetched_flights = fetch_regional_flights(
        api_key=api_key,
        departure_airport=departure_airport,
        destinations=my_destinations,
        start_date_str=start_date_str,
        end_date_str=end_date_str
    )

    # 3. Handle CSV saving if data was returned
    if fetched_flights:
        filename = f"data/flights_{departure_airport}_{start_date_str}_to_{end_date_str}.csv"
        
        with open(filename, mode="w", newline="", encoding="utf-8") as csv_file:
            writer = csv.writer(csv_file)
            
            # Write the header row
            writer.writerow([
                "Search Date", 
                "Destination Country", 
                "Arrival Airport", 
                "Airline", 
                "Flight Number", 
                "Departure Time", 
                "Arrival Time", 
                "Price (SGD)"
            ])
            
            # Write all the accumulated data rows at once
            writer.writerows(fetched_flights)
            
        print(f"✅ Successfully saved {len(fetched_flights)} flights to '{filename}'.")
    else:
        print("⚠️ No flight data was returned to save.")
