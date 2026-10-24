from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.services.pathway import analyze
from app.services.semantic_matcher import SemanticSkillMatcher

app = FastAPI(
    title="PathAI",
    description="AI-powered academic and career pathway assistant",
    version="0.3.0",
)

# The model is loaded once when the application module starts.
semantic_matcher = SemanticSkillMatcher()


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
        semantic_results = semantic_matcher.match_skills(
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
