from fastapi import FastAPI, HTTPException, UploadFile, File
from functools import lru_cache
import re
from pydantic import BaseModel, Field

from app.services.pathway import analyze
from app.services.semantic_matcher import SemanticSkillMatcher

app = FastAPI(
    title="PathAI",
    description="AI-powered academic and career pathway assistant",
    version="0.3.0",
)

# The model is loaded once when the application module starts.
@lru_cache(maxsize=1)
def get_matcher():
    return SemanticSkillMatcher()


class StudentProfile(BaseModel):
    subjects: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    profile_text: str = ""
    target_role: str


SKILL_DATABASE = {
    "Python": "Python programming, writing scripts and software",
    "Programming Fundamentals": "programming logic, variables, loops and coding basics",
    "Data Structures": "data structures, algorithms, lists, trees and hash maps",
    "Git": "Git version control, commits, branches and source control",
    "SQL": "SQL queries and relational database management",
    "NumPy": "numerical computing, arrays and vectorized operations in Python",
    "Pandas": "data manipulation, tabular datasets and data analysis in Python",
    "Statistics": "statistical analysis, distributions and descriptive statistics",
    "Probability": "probability theory and probabilistic reasoning",
    "Mathematics": "mathematical foundations, algebra and calculus",
    "Machine Learning": "machine learning algorithms, predictive models and model evaluation",
    "Deep Learning": "deep neural networks and deep learning methods",
    "Computer Vision": "image processing and computer vision systems",
    "Natural Language Processing": "text analysis and natural language processing",
    "Data Visualization": "charts, plots and visual presentation of data",
    "Docker": "Docker containers and application containerization",
    "APIs": "API development, REST endpoints and API integration",
}


@app.get("/")
def root():
    return {
        "message": "PathAI AI engine is running",
        "version": "0.3.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
def analyze_student(profile: StudentProfile):
    detected_skills = list(profile.skills)
    semantic_results = []

    if profile.profile_text.strip():
        semantic_results = get_matcher().match_skills(
            profile.profile_text,
            SKILL_DATABASE,
            threshold=0.45,
        )
        for result in semantic_results:
            if result["skill"] not in detected_skills:
                detected_skills.append(result["skill"])

    pathway_result = analyze(
        student_subjects=profile.subjects,
        student_skills=detected_skills,
        target_role=profile.target_role,
    )

    return {
        "target_role": profile.target_role,
        "input_skills": profile.skills,
        "ai_detected_skills": detected_skills,
        "semantic_matches": semantic_results,
        "pathway_analysis": pathway_result,
    }


from app.services.optimizer import plan, compare_roles
from app.services.pathway import ALIASES, normalize_exact, ROLES


def extract_skills(text):
    evidence = {}
    for line in re.split(r"[\n;]+", text):
        line = line.strip()
        if not line:
            continue
        for alias, skill in ALIASES.items():
            if re.search(r"(?<!\w)" + re.escape(alias) + r"(?!\w)", line, re.I):
                evidence.setdefault(skill, {"skill": skill, "method": "alias", "evidence": line[:300]})
    # Semantic suggestions are candidates, not verified requirements.
    for chunk in [text[i:i+600] for i in range(0, len(text), 600)]:
        if chunk.strip():
            for match in get_matcher().match_skills(chunk, SKILL_DATABASE, threshold=0.55):
                evidence.setdefault(match["skill"], {**match, "method": "semantic", "evidence": chunk[:300]})
    return sorted(evidence.values(), key=lambda item: item["skill"])


@app.post("/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    import pymupdf
    raw = await file.read(10 * 1024 * 1024 + 1)
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(413, "PDF must be at most 10 MB")
    try:
        with pymupdf.open(stream=raw, filetype="pdf") as doc:
            if len(doc) > 100:
                raise HTTPException(400, "PDF must have at most 100 pages")
            text = "\n".join(page.get_text() for page in doc)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "Cannot read PDF")
    if not text.strip():
        raise HTTPException(400, "No extractable text; scanned PDFs are not supported")
    return {"text": text[:30000], "truncated": len(text) > 30000}


class Documents(BaseModel):
    syllabus: str = Field(max_length=30000)
    job_description: str = Field(max_length=30000)


@app.post("/extract-skills")
def extract_documents(data: Documents):
    return {"curriculum": extract_skills(data.syllabus),
            "job": extract_skills(data.job_description)}


class PlanningRequest(BaseModel):
    curriculum_skills: list[str] = Field(default_factory=list)
    required_skills: list[str] = Field(min_length=1)
    known_skills: list[str] = Field(default_factory=list)
    days: int = Field(ge=1, le=365)
    hours_per_day: float = Field(gt=0, le=24)


@app.post("/plan")
def generate_plan(data: PlanningRequest):
    curriculum, a = normalize_exact(data.curriculum_skills)
    required, b = normalize_exact(data.required_skills)
    known, c = normalize_exact(data.known_skills)
    if a or b or c or not required:
        raise HTTPException(400, "Confirm recognized skills before planning")
    budget = data.days * data.hours_per_day
    return {"curriculum_gaps": sorted(set(required) - set(curriculum)),
            "personal_gaps": sorted(set(required) - set(known)),
            "plan": plan(required, known, budget),
            **compare_roles(known, budget)}
