# PathAI — AI-Powered Personalized Academic and Career Pathway Recommendation System

<p align="left">
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Project-In%20Progress-E0A12F?style=flat-square" alt="Project in progress" />
</p>

PathAI is a student project prototype that helps learners connect their current academic background and skills to a target career. It compares a student profile with role requirements, identifies skill gaps, and proposes an ordered learning pathway.

## 🚀 Project status

### 🟢 Implemented so far
- FastAPI backend with `GET /`, `GET /health`, and `POST /analyze` endpoints.
- Semantic skill matching for free-text profile descriptions using the pretrained Sentence Transformers model `all-MiniLM-L6-v2`.
- Cosine-similarity scoring through scikit-learn.
- JSON knowledge base covering academic subjects, skills, aliases, career roles, and prerequisites.
- Skill-gap analysis, prerequisite-aware learning path ordering, and an indicative readiness percentage.
- React + Vite frontend with responsive CSS styling.
- Student profile form for selecting subjects, existing skills, optional profile text, and a target role.
- Results view for the pathway, skill gaps, readiness indicator, and skills detected from profile text.
- Vite development proxy configured to forward `/api/*` requests to the FastAPI backend.

### 🟡 Still to do
- Run and verify the full frontend-to-backend workflow on the development machine.
- Expand automated tests and validate API response edge cases.
- Improve and evaluate semantic-matching thresholds with representative examples.
- Optionally add persistent profiles, richer learning resources, and deployment configuration.

This is an in-progress prototype. The readiness percentage is an indicative match against the project's configured role requirements; it is not a prediction or guarantee of employability.

## 🧰 Technology stack

### 🐍 Backend
- Python
- FastAPI and Pydantic
- Sentence Transformers — `all-MiniLM-L6-v2`
- scikit-learn cosine similarity
- JSON-based skill and career knowledge base
- pytest

### 🎨 Frontend
- React
- Vite
- Lucide React icons
- Custom responsive CSS
- npm

## 📁 Project structure

```text
PathAi/
├── app/
│   ├── main.py
│   ├── data/
│   │   └── knowledge_base.json
│   └── services/
│       ├── pathway.py
│       └── semantic_matcher.py
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── README.md
├── tests/
│   ├── test_pathway.py
│   └── test_semantic_matcher.py
├── requirements.txt
├── .gitignore
└── README.md
```

## ✅ Prerequisites

- Python 3.10+ recommended for the backend.
- Node.js and npm compatible with the installed Vite version.
- Internet access on the first backend run so the pretrained sentence-transformer model can be downloaded.

## ⚙️ Run the project locally (Windows / VS Code)

Run the backend and frontend in **two separate terminals**.

### 1. Install backend dependencies

From the repository root (the directory containing `app`, `frontend`, and `requirements.txt`):

```powershell
python -m pip install -r requirements.txt
```

### 2. Start the FastAPI backend

In the first terminal, still at the repository root:

```powershell
python -m uvicorn app.main:app --reload
```

Wait for Uvicorn to report that the application has started. Useful URLs:

- API health check: http://127.0.0.1:8000/health
- Interactive API documentation: http://127.0.0.1:8000/docs
- Root endpoint: http://127.0.0.1:8000/

Keep this terminal open while using the frontend.

### 3. Install and start the frontend

Open a second terminal from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, commonly http://localhost:5173.

The Vite configuration proxies frontend requests from `/api` to `http://127.0.0.1:8000`. Keep the backend running for profile analysis to work. If the frontend reports a network/API error, first confirm that the backend's `/health` URL responds successfully.

### 4. Create a production frontend build

From the `frontend` directory:

```powershell
npm run build
npm run preview
```

## 🔌 API example

The frontend sends a request to `POST /analyze`. You can also try the endpoint directly in Swagger at http://127.0.0.1:8000/docs.

Example request body:

```json
{
  "subjects": ["Programming", "Statistics", "Mathematics"],
  "skills": ["Python", "Git"],
  "profile_text": "I have written Python programs and enjoy analyzing data. I want to learn how machine learning models work.",
  "target_role": "Machine Learning Engineer"
}
```

The API response includes the target role, skills detected from free text, semantic matches, and a `pathway_analysis` containing the pathway analysis results.

Available target roles are defined in `app/data/knowledge_base.json`; the frontend currently presents these options:
- Machine Learning Engineer
- Data Scientist
- Computer Vision Engineer
- NLP Engineer
- Backend Developer

## 🧪 Run backend tests

From the repository root:

```powershell
python -m pytest
```

## 📝 Notes and limitations

- The semantic model suggests skills from free-text descriptions. The structured knowledge base remains the source of truth for configured career requirements and prerequisites.
- Semantic matches and the threshold should be tested and tuned against representative student profiles.
- Readiness results depend on the roles and skills configured in the knowledge base and should be treated as guidance only.
- Do not commit `node_modules`, Python virtual environments, model caches, or secrets. The frontend dependency manifests (`package.json` and `package-lock.json`) should be committed so dependencies can be installed with `npm install`.
