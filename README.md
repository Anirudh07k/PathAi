# PathAI — AI-Powered Personalized Academic and Career Pathway Recommendation System

PathAI is an academic and career guidance prototype that helps students compare their current skills with a target role, identify skill gaps, and generate a prerequisite-ordered learning pathway.

## Current features

- FastAPI backend with a POST /analyze endpoint.
- Pretrained Sentence Transformers model (all-MiniLM-L6-v2) for semantic matching of free-text student descriptions to skills.
- JSON knowledge base for skills, academic subjects, career roles, aliases, and prerequisites.
- Skill-gap analysis and an indicative readiness percentage.
- Explainable learning-path entries based on structured prerequisite relationships.

## Current status

This is an in-progress prototype. The backend API is the current interface; a React/Tailwind frontend, persistent student database, resume upload flow, and LLM-generated explanations are future work. The readiness score is an indicative score based on configured role requirements, not a prediction or guarantee of employability.

## Requirements

- Python 3.10 or newer recommended
- Internet connection on first run to download the pretrained Sentence Transformers model

## Setup (Windows / VS Code)

Open a terminal in the repository root (the folder containing app, tests, and requirements.txt).

    python -m pip install -r requirements.txt
    python -m uvicorn app.main:app --reload

Open the interactive API docs at http://127.0.0.1:8000/docs.

## Example request

In Swagger, open POST /analyze, click Try it out, and submit:

    {
      "subjects": ["Programming", "Statistics", "Mathematics"],
      "skills": ["Python"],
      "profile_text": "I have written Python programs, worked with numerical arrays using NumPy, and analyzed datasets with Pandas.",
      "target_role": "Machine Learning Engineer"
    }

## Project structure

    app/
      main.py
      data/knowledge_base.json
      services/
        pathway.py
        semantic_matcher.py
    tests/
      test_pathway.py
      test_semantic_matcher.py
    requirements.txt

## Technology stack

- Python
- FastAPI and Pydantic
- Sentence Transformers (all-MiniLM-L6-v2)
- scikit-learn cosine similarity
- Python graph traversal for prerequisite reasoning
- JSON knowledge base
- pytest for tests

## Important implementation note

The semantic model proposes related skills from free text; the structured knowledge base remains the source of truth for career requirements and prerequisites. Semantic matches should be reviewed and tuned against real test examples before relying on them for consequential decisions.
