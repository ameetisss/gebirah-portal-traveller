from database import get_supabase
import uuid

# Define distinct requester profiles for testing
REGIONAL_REQUESTERS = [
    {"id": "00000000-0000-0000-0000-000000000101", "name": "Gaza Relief Team", "email": "gaza@relief.org", "dest": "Gaza"},
    {"id": "00000000-0000-0000-0000-000000000102", "name": "Rafah Border Coordination", "email": "rafah@relief.org", "dest": "Rafah"},
    {"id": "00000000-0000-0000-0000-000000000103", "name": "Amman Supply Center", "email": "amman@relief.org", "dest": "Amman"},
    {"id": "00000000-0000-0000-0000-000000000104", "name": "Lebanon Medical Corps", "email": "beirut@relief.org", "dest": "Beirut"},
    {"id": "00000000-0000-0000-0000-000000000105", "name": "Cairo Logistics Hub", "email": "cairo@relief.org", "dest": "Cairo"}
]

SEED_REQUESTS = [
    {
        "description": "Infant formula (Stage 1)",
        "weight_kg": 2.5,
        "urgency": "High",
        "destination": "Gaza",
        "reason": "Shortage of basic supplies in local clinics",
        "requester_id": "00000000-0000-0000-0000-000000000101"
    },
    {
        "description": "Portable water filters",
        "weight_kg": 1.2,
        "urgency": "High",
        "destination": "Rafah",
        "reason": "Contaminated water sources in camp areas",
        "requester_id": "00000000-0000-0000-0000-000000000102"
    },
    {
        "description": "Warm blankets (Pack of 5)",
        "weight_kg": 4.0,
        "urgency": "Medium",
        "destination": "Amman",
        "reason": "Preparing for cold season in refugee centers",
        "requester_id": "00000000-0000-0000-0000-000000000103"
    },
    {
        "description": "Essential pain relief",
        "weight_kg": 0.3,
        "urgency": "High",
        "destination": "Beirut",
        "reason": "Local pharmacies facing stockouts",
        "requester_id": "00000000-0000-0000-0000-000000000104"
    },
    {
        "description": "Wheelchair for elderly patient",
        "weight_kg": 12.0,
        "urgency": "High",
        "destination": "Cairo",
        "reason": "Patient at border hospital",
        "requester_id": "00000000-0000-0000-0000-000000000105"
    }
]

def seed_requesters_and_data():
    supabase = get_supabase()
    
    print("Creating Regional Requester Profiles...")
    for user in REGIONAL_REQUESTERS:
        supabase.table("user_profiles").upsert({
            "id": user["id"],
            "full_name": user["name"],
            "email": user["email"],
            "role": "requester"
        }).execute()
        print(f"  - Profile created: {user['name']} ({user['id']})")
    
    # Optional: Clear existing requests for a fresh start in the demo
    # supabase.table("item_requests").delete().neq("id", uuid.uuid4()).execute()
    
    print("\nInserting Item Requests...")
    for req_data in SEED_REQUESTS:
        req = {
            "user_id": req_data["requester_id"],
            "description": req_data["description"],
            "weight_kg": req_data["weight_kg"],
            "urgency": req_data["urgency"],
            "destination": req_data["destination"],
            "reason": req_data["reason"],
            "status": "Waiting"
        }
        res = supabase.table("item_requests").insert(req).execute()
        if res.data:
            print(f"  - Added: {req['description']} bound for {req['destination']}")

if __name__ == "__main__":
    seed_requesters_and_data()
