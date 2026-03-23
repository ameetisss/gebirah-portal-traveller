# Gebirah Portal Traveller

## Getting Started

### Frontend Setup
1. Install the dependencies:
```bash
npm install
```
2. Run the website
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
4. Configure your API key:
   - Open `backend/.env`
   - Replace `YOUR_SERPAPI_KEY_HERE` with your actual SerpApi key.

5. Run the development server:
```bash
uvicorn main:app --reload
```

### Available Endpoints
- `GET /`: Root check.
- `GET /api/health`: Health check.
- `GET /api/csv-head`: Retrieve the first few rows of a CSV file (default 5).
- `POST /api/fetch-flights`: Trigger flight fetching (requires valid SerpApi key).
- `POST /api/flight-departure`: Retrieve a flight's departure time from local CSV data.

## Accessing the Dashboard

To log in and access the dashboard, you can use the following criteria:
- **Username:** Enter your email address. / Phone number
- **Password:** Enter any word that is **more than 6 letters** long.
