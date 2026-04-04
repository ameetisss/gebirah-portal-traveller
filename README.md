# Gebirah Portal Traveller

## Getting Started

### Frontend Setup
1. Use a supported Node.js version.
```bash
nvm use
```
If `nvm` says the version is missing, install it first:
```bash
nvm install 20.19.0
nvm use 20.19.0
```
`vite@8` in this project requires Node.js `20.19+` or `22.12+`.

2. Install the dependencies:
```bash
npm install
```

If you installed dependencies with an older Node version and see a Rolldown native binding error, reinstall cleanly:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Run the website
```bash
npm run dev
```

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```
2. Create and activate a virtual environment:
```powershell
# Create venv
python -m venv venv

# Activate venv (Windows)
.\venv\Scripts\activate

# Activate venv (macOS/Linux)
# source venv/bin/activate
```
3. Install the dependencies:
```bash
pip install -r requirements.txt
```
4. Configure your environment variables:
   - Copy `backend/.env.example` to `backend/.env`.
   - Update `SUPABASE_URL`, `SUPABASE_KEY` (anon/public), and `SUPABASE_SERVICE_ROLE_KEY`.
   SUPABASE_URL="https://mmlvcxpzrngbelyqeaze.supabase.co"
SUPABASE_KEY="sb_publishable_8ODc0TkYTOAWVrhHx-vC1Q_Pervd_gY"
   - Update `SERPAPI_KEY` with your actual SerpApi key.

5. Seed the database (Optional):
   - Run the seed script to populate catalogue items and initial volunteers:
   ```bash
   python seed.py
   ```

6. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

### Supabase Integration
This portal relies on Supabase for data persistence and user management.
- **`SUPABASE_URL`**: Your Supabase project URL.
- **`SUPABASE_KEY`**: Your Supabase `anon` public key.
- **`SUPABASE_SERVICE_ROLE_KEY`**: Your Supabase `service_role` key (used for administrative tasks in `seed.py`).

The backend handles the connection via `backend/database.py` and provides proxy endpoints for the frontend.

### Available Endpoints
- `GET /`: Root check.
- `GET /api/health`: Health check.
- `GET /api/csv-head`: Retrieve the first few rows of a CSV file (default 5).
- `POST /api/fetch-flights`: Trigger flight fetching (requires valid SerpApi key).
- POST /api/flight-departure: Retrieve a flight's departure time from local CSV data.

## Volunteer Availability
The portal simulates volunteer availability based on the departure date of your trip:
- **Monday – Thursday**: Volunteers are available, and the trip will proceed to the matching flow.
- **Friday – Sunday**: No volunteers are available. A "Thank You" message will be displayed with a link to our Facebook page.

## Accessing the Dashboard

To log in and access the dashboard, you can use the following criteria:
- **Username:** Enter your email address. / Phone number
- **Password:** Enter any word that is **more than 6 letters** long.
