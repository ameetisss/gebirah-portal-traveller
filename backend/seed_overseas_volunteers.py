import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

OVERSEAS_VOLUNTEERS = [
    {
        "name": "Zayar Lin",
        "phone": "+95 9 1234 5678",
        "location": "Yangon",
        "country": "Myanmar"
    },
    {
        "name": "Sokha Mao",
        "phone": "+855 23 123 456",
        "location": "Phnom Penh",
        "country": "Cambodia"
    },
    {
        "name": "Maria Santos",
        "phone": "+63 917 123 4567",
        "location": "Manila",
        "country": "Philippines"
    },
    {
        "name": "Hieu Nguyen",
        "phone": "+84 24 1234 5678",
        "location": "Saigon",
        "country": "Vietnam"
    }
]

def seed():
    print("Seeding international volunteers...")
    
    for v in OVERSEAS_VOLUNTEERS:
        # 1. Create User Profile
        profile_res = supabase.table("user_profiles").insert({
            "full_name": v["name"],
            "role": "volunteer",
            "phone": v["phone"]
        }).execute()
        
        if profile_res.data:
            profile_id = profile_res.data[0]["id"]
            print(f"Created profile for {v['name']} (ID: {profile_id})")
            
            # 2. Create Volunteer Entry
            vol_res = supabase.table("volunteers").insert({
                "profile_id": profile_id,
                "type": "overseas",
                "location": v["location"],
                "is_available": True
            }).execute()
            
            if vol_res.data:
                print(f"  -> Added as overseas volunteer for {v['location']}")
                
        else:
            print(f"Failed to create profile for {v['name']}")

if __name__ == "__main__":
    seed()
