# PathAI Frontend

React + Vite frontend for the PathAI FastAPI project.

## Requirements

- Node.js 20.19+ or 22.12+ (recommended)
- Python backend dependencies installed in the project root

## Run locally

Open **two VS Code terminals**.

### Terminal 1 — backend

From the repository root (the folder containing `app`):

```powershell
python -m uvicorn app.main:app --reload
```

Wait until Uvicorn reports that the application has started. The API should respond at http://127.0.0.1:8000/health.

### Terminal 2 — frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, commonly http://localhost:5173.

The Vite development server proxies `/api/analyze` and `/api/health` to the FastAPI backend at port 8000. This avoids configuring browser CORS for local development.

## Production build

```powershell
npm run build
npm run preview
```

## API contract

The frontend sends `POST /analyze` with:

```json
{
  "subjects": ["Programming", "Mathematics"],
  "skills": ["Python", "Git"],
  "profile_text": "I enjoy building projects and learning about data.",
  "target_role": "Machine Learning Engineer"
}
```

The expected response includes `target_role`, `ai_detected_skills`, `semantic_matches`, and `pathway_analysis`.
