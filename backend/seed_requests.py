from database import get_supabase
import uuid

# Define distinct requester profiles for testing
REGIONAL_REQUESTERS = [
    {"id": "00000000-0000-0000-0000-000000000101", "name": "Gaza Relief Team", "email": "gaza@relief.org", "dest": "Gaza"},
    {"id": "00000000-0000-0000-0000-000000000102", "name": "Rafah Border Coordination", "email": "rafah@relief.org", "dest": "Rafah"},
    {"id": "00000000-0000-0000-0000-000000000103", "name": "Yangon Supply Center", "email": "yangon@relief.org", "dest": "Yangon"},
    {"id": "00000000-0000-0000-0000-000000000104", "name": "Lebanon Medical Corps", "email": "beirut@relief.org", "dest": "Beirut"},
    {"id": "00000000-0000-0000-0000-000000000105", "name": "Cairo Logistics Hub", "email": "cairo@relief.org", "dest": "Cairo"},
    {"id": "00000000-0000-0000-0000-000000000106", "name": "Manila Charity Foundation", "email": "manila@charity.org", "dest": "Manila"},
    {"id": "00000000-0000-0000-0000-000000000107", "name": "Jakarta Community Aid", "email": "jakarta@aid.org", "dest": "Jakarta"},
    {"id": "00000000-0000-0000-0000-000000000108", "name": "Phnom Penh Outreach", "email": "phnompenh@outreach.org", "dest": "Phnom Penh"},
    {"id": "00000000-0000-0000-0000-000000000109", "name": "Saigon Hope Project", "email": "saigon@hope.org", "dest": "Saigon"}
]

SEED_REQUESTS = [
    # Existing
    {"description": "Infant formula (Stage 1)", "weight_kg": 2.5, "urgency": "High", "destination": "Gaza (Palestine)", "reason": "Shortage of basic supplies", "requester_id": "00000000-0000-0000-0000-000000000101"},
    {"description": "Portable water filters", "weight_kg": 1.2, "urgency": "High", "destination": "Rafah (Palestine)", "reason": "Contaminated water sources", "requester_id": "00000000-0000-0000-0000-000000000102"},
    {"description": "Warm blankets (Pack of 5)", "weight_kg": 4.0, "urgency": "Medium", "destination": "Yangon (Myanmar)", "reason": "Preparing for cold season", "requester_id": "00000000-0000-0000-0000-000000000103"},
    {"description": "Essential pain relief", "weight_kg": 0.3, "urgency": "High", "destination": "Beirut (Lebanon)", "reason": "Pharmacy stockouts", "requester_id": "00000000-0000-0000-0000-000000000104"},
    {"description": "Wheelchair for elderly patient", "weight_kg": 12.0, "urgency": "High", "destination": "Cairo (Egypt)", "reason": "Border hospital patient", "requester_id": "00000000-0000-0000-0000-000000000105"},
    
    # New - Myanmar (Alias Testing)
    {"description": "First Aid Kits (Pack of 10)", "weight_kg": 3.5, "urgency": "High", "destination": "Yangon (Myanmar)", "reason": "Emergency response kits", "requester_id": "00000000-0000-0000-0000-000000000103"},
    {"description": "Rehydration Salts (Sachets)", "weight_kg": 0.8, "urgency": "High", "destination": "Yangon (Myanmar)", "reason": "Outbreak prevention", "requester_id": "00000000-0000-0000-0000-000000000103"},
    {"description": "Antibiotics (Amoxicillin)", "weight_kg": 0.4, "urgency": "High", "destination": "Yangon (Myanmar)", "reason": "Critical clinic supplies", "requester_id": "00000000-0000-0000-0000-000000000103"},

    # New - Philippines
    {"description": "Children's Vitamins", "weight_kg": 0.5, "urgency": "Medium", "destination": "Manila (Philippines)", "reason": "Nutritional support program", "requester_id": "00000000-0000-0000-0000-000000000106"},
    {"description": "Hygiene Packs for Evacuees", "weight_kg": 2.2, "urgency": "High", "destination": "Manila (Philippines)", "reason": "Recent typhoon relocation", "requester_id": "00000000-0000-0000-0000-000000000106"},
    {"description": "Portable Solar Lamps", "weight_kg": 1.8, "urgency": "Medium", "destination": "Manila (Philippines)", "reason": "Off-grid community center", "requester_id": "00000000-0000-0000-0000-000000000106"},

    # New - Indonesia
    {"description": "Blood Pressure Monitors", "weight_kg": 1.5, "urgency": "High", "destination": "Jakarta (Indonesia)", "reason": "Mobile health clinic", "requester_id": "00000000-0000-0000-0000-000000000107"},
    {"description": "Dialysis Tubing Packs", "weight_kg": 2.5, "urgency": "High", "destination": "Jakarta (Indonesia)", "reason": "Hospital supply shortage", "requester_id": "00000000-0000-0000-0000-000000000107"},
    {"description": "Surgical Masks (Box of 500)", "weight_kg": 1.2, "urgency": "Medium", "destination": "Jakarta (Indonesia)", "reason": "Infection control", "requester_id": "00000000-0000-0000-0000-000000000107"},

    # New - Cambodia (Alias Testing)
    {"description": "Educational Braille Books", "weight_kg": 4.5, "urgency": "Medium", "destination": "Phnom Penh (Cambodia)", "reason": "School for the blind", "requester_id": "00000000-0000-0000-0000-000000000108"},
    {"description": "Stethoscopes (3 units)", "weight_kg": 1.0, "urgency": "High", "destination": "Phnom Penh (Cambodia)", "reason": "Medical student training", "requester_id": "00000000-0000-0000-0000-000000000108"},

    # New - Vietnam
    {"description": "Wheelchair Cushions", "weight_kg": 2.8, "urgency": "Medium", "destination": "Saigon (Vietnam)", "reason": "Rehabilitation center", "requester_id": "00000000-0000-0000-0000-000000000109"},
    {"description": "Nebulizers (Respiratory Care)", "weight_kg": 3.2, "urgency": "High", "destination": "Saigon (Vietnam)", "reason": "Air quality health response", "requester_id": "00000000-0000-0000-0000-000000000109"}
]

def seed_requesters_and_data():
    supabase = get_supabase()
    
    print("Creating Regional Requester Profiles...")
    for user in REGIONAL_REQUESTERS:
        try:
            supabase.table("user_profiles").upsert({
                "id": user["id"],
                "full_name": user["name"],
                "email": user["email"],
                "role": "requester"
            }).execute()
            print(f"  - Profile upserted: {user['name']} ({user['id']})")
        except Exception as e:
            print(f" Error creating profile {user['name']}: {e}")
    
    # We don't clear existing requests, we just add new ones for rich demo data
    
    print("\nInserting Item Requests...")
    for req_data in SEED_REQUESTS:
        try:
            req = {
                "user_id": req_data["requester_id"],
                "description": req_data["description"],
                "weight_kg": req_data["weight_kg"],
                "urgency": req_data["urgency"],
                "destination": req_data["destination"],
                "reason": req_data["reason"],
                "status": "Waiting"
            }
            # Avoid duplicate inserts of the same description for the same destination in the same seeded run
            res = supabase.table("item_requests").insert(req).execute()
            if res.data:
                print(f"  - Added: {req['description']} bound for {req['destination']}")
        except Exception as e:
            print(f" Error inserting request {req_data['description']}: {e}")

if __name__ == "__main__":
    seed_requesters_and_data()

