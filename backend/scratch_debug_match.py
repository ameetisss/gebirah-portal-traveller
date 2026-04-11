import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

LOCATION_ALIASES = {
    "Myanmar": "Yangon",
    "Yangon": "Myanmar",
    "RGN": "Yangon",
}

def test_match(weight, destination):
    print(f"Testing match for {destination} with {weight} kg...")
    
    query = supabase.table("item_requests").select("*, user_profiles(full_name)").eq("status", "Waiting").lte("weight_kg", weight)
    
    if destination:
        cleaned = destination.split('(')[0].strip()
        alias = LOCATION_ALIASES.get(cleaned)
        if alias:
            # Use Supabase's OR filter
            filter_str = f"destination.ilike.%{cleaned}%,destination.ilike.%{alias}%"
            print(f"  Using filter: {filter_str}")
            query = query.or_(filter_str)
        else:
            query = query.ilike("destination", f"%{cleaned}%")
            
    res = query.execute()
    print(f"  Results found: {len(res.data) if res.data else 0}")
    if res.data:
        for r in res.data:
            print(f"    - {r['description']} ({r['weight_kg']} kg) at {r['destination']}")

if __name__ == "__main__":
    test_match(5.0, "Myanmar (RGN)")
    test_match(5.0, "Yangon")
