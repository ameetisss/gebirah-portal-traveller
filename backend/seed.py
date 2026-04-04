import json
import os
import uuid
from database import get_supabase

def seed_data():
    supabase = get_supabase()
    
    # 1. Seed Catalogue Items (from item.json)
    items_path = os.path.join(os.path.dirname(__file__), "data", "item.json")
    if os.path.exists(items_path):
        print("Seeding catalogue items...")
        with open(items_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            items = data.get("items", [])
            for item in items:
                # Upsert by name
                supabase.table("catalogue_items").upsert({
                    "name": item["name"],
                    "min_weight_kg": item["min_weight_kg"],
                    "max_weight_kg": item["max_weight_kg"]
                }, on_conflict="name").execute()
                print(f"  - Seeded item: {item['name']}")

    # 2. Seed Volunteers and Schedules (from volunteer.json)
    volunteers_path = os.path.join(os.path.dirname(__file__), "data", "volunteer.json")
    if os.path.exists(volunteers_path):
        print("\nSeeding volunteers and schedules...")
        with open(volunteers_path, "r", encoding="utf-8") as f:
            raw_volunteers = json.load(f)
            
            # Group by volunteer name to create unique volunteer records
            unique_names = list(set([v["volunteer_name"] for v in raw_volunteers]))
            name_to_profile_id = {}
            
            # Clear old "anonymous" volunteers before re-seeding
            supabase.table("volunteers").delete().neq("user_id", "00000000-0000-0000-0000-000000000001").execute()
            supabase.table("user_profiles").delete().eq("role", "volunteer").execute()

            for name in unique_names:
                # 1. Create a core profile record
                res_profile = supabase.table("user_profiles").insert({
                    "full_name": name,
                    "role": "volunteer"
                }).execute()
                
                if res_profile.data:
                    p_id = res_profile.data[0]["id"]
                    name_to_profile_id[name] = p_id
                    
                    # 2. Create the volunteer record linked to this profile
                    res_v = supabase.table("volunteers").insert({
                        "profile_id": p_id,
                        "type": "sg",
                        "is_available": True
                    }).execute()
                    
                    if res_v.data:
                        v_id = res_v.data[0]["user_id"]
                        print(f"  - Created profile and volunteer for: {name}")

            # Insert schedules
            for entry in raw_volunteers:
                p_id = name_to_profile_id.get(entry["volunteer_name"])
                if p_id:
                    # Look up the volunteer ID for this profile
                    v_res = supabase.table("volunteers").select("user_id").eq("profile_id", p_id).execute()
                    if v_res.data:
                        v_id = v_res.data[0]["user_id"]
                        supabase.table("volunteer_schedules").insert({
                            "volunteer_id": v_id,
                            "day_of_week": entry["day"],
                            "start_time": entry["start_time"],
                            "end_time": entry["end_time"]
                        }).execute()
            
            print(f"\n  - Successfully seeded {len(raw_volunteers)} schedule blocks.")

if __name__ == "__main__":
    seed_data()
