import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

if not url or not key:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not found in environment variables.")

supabase: Client = create_client(url, key)

# Admin client (for schema changes and administrative tasks)
admin_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
admin_supabase: Optional[Client] = None

if admin_key:
    admin_supabase = create_client(url, admin_key)

def get_supabase() -> Client:
    return supabase

def get_admin_supabase() -> Client:
    if not admin_supabase:
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY not found in environment.")
    return admin_supabase
