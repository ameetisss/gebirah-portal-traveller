from database import get_supabase
import uuid
import random

# Destinations based on the 'flights' table
DESTINATIONS = [
    {"code": "RGN", "name": "Yangon (Myanmar)"},
    {"code": "MNL", "name": "Manila (Philippines)"},
    {"code": "CGK", "name": "Jakarta (Indonesia)"},
    {"code": "SGN", "name": "Ho Chi Minh City (Vietnam)"},
    {"code": "HAN", "name": "Hanoi (Vietnam)"},
    {"code": "CEB", "name": "Cebu (Philippines)"},
    {"code": "DPS", "name": "Denpasar (Bali)"}
]

# Mock Requesters (Global Relief Fund)
REQUESTER_ID = "00000000-0000-0000-0000-000000000002"

def restore_items():
    supabase = get_supabase()
    
    # 1. Fetch Catalogue Items
    print("Fetching catalogue items...")
    cat_res = supabase.table("catalogue_items").select("*").execute()
    catalogue = cat_res.data
    
    if not catalogue:
        print("Error: No catalogue items found!")
        return

    # 2. Clear existing (just in case)
    # print("Clearing item_requests...")
    # supabase.table("item_requests").delete().neq("id", str(uuid.uuid4())).execute()

    print(f"Seeding item_requests for {len(DESTINATIONS)} destinations...")
    
    for dest in DESTINATIONS:
        # Pick 2 random items from catalogue for each destination
        items_to_add = random.sample(catalogue, k=2)
        
        for item in items_to_add:
            req = {
                "user_id": REQUESTER_ID,
                "description": f"{item['name'].replace('_', ' ').capitalize()} for {dest['name']}",
                "weight_kg": float(item['min_weight_kg']),
                "urgency": random.choice(["High", "Medium"]),
                "destination": dest['code'], # Match the flight arrival_airport code
                "reason": f"Urgent supply of {item['name']} needed at the local relief center in {dest['name']}.",
                "status": "Waiting"
            }
            res = supabase.table("item_requests").insert(req).execute()
            if res.data:
                print(f"  - Added: {item['name']} -> {dest['code']}")

if __name__ == "__main__":
    restore_items()
