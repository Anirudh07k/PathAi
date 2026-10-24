import json
from pathlib import Path
from collections import defaultdict

DATA = Path(__file__).parents[1] / "data" / "knowledge_base.json"
KB = json.loads(DATA.read_text(encoding="utf-8"))

SKILLS = KB["skills"]
SUBJECTS = KB["subjects"]
ROLES = KB["roles"]

ALIASES = {}
for skill in SKILLS:
    for value in [skill["name"], *skill.get("aliases", [])]:
        ALIASES[value.strip().lower()] = skill["name"]

SUBJECT_MAP = {subject["name"].strip().lower(): subject["skills"] for subject in SUBJECTS}


def normalize_exact(values):
    found, unknown = [], []
    for value in values:
        key = value.strip().lower()
        if key in ALIASES:
            found.append(ALIASES[key])
        elif key in SUBJECT_MAP:
            found.extend(SUBJECT_MAP[key])
        else:
            unknown.append(value)
    return sorted(set(found)), unknown


def graph():
    reverse = defaultdict(list)
    for skill in SKILLS:
        reverse[skill["name"]]
        for prereq in skill.get("prerequisites", []):
            reverse[skill["name"]].append(prereq)
    return reverse


def all_prerequisites(targets):
    reverse = graph()
    result = set()
    stack = list(targets)
    while stack:
        node = stack.pop()
        for parent in reverse[node]:
            if parent not in result:
                result.add(parent)
                stack.append(parent)
    return result


def ordered_path(targets, known):
    reverse = graph()
    needed = set(targets) | all_prerequisites(targets)
    remaining = needed - set(known)
    ordered = []
    while remaining:
        ready = sorted(
            skill for skill in remaining
            if all(parent in known or parent in ordered for parent in reverse[skill])
        )
        if not ready:
            # Defensive fallback for a malformed/cyclic knowledge base.
            ordered.extend(sorted(remaining))
            break
        ordered.extend(ready)
        remaining -= set(ready)
    return ordered


def role_match(role):
    key = role.strip().lower()
    for name, info in ROLES.items():
        if key == name.lower() or key in [alias.lower() for alias in info.get("aliases", [])]:
            return name
    return None


def analyze(student_subjects, student_skills, target_role):
    role = role_match(target_role)
    if not role:
        return {"error": "Target role is not in the current PathAI knowledge base."}

    subject_skills, unknown_subjects = normalize_exact(student_subjects)
    explicit_skills, unknown_skills = normalize_exact(student_skills)
    known = sorted(set(subject_skills + explicit_skills))

    required = ROLES[role]["skills"]
    needed = set(required) | all_prerequisites(required)
    gaps = sorted(needed - set(known))
    pathway = ordered_path(required, known)

    reverse = graph()
    explanations = []
    for skill in pathway:
        direct = skill in required
        explanations.append({
            "skill": skill,
            "type": "target skill" if direct else "prerequisite",
            "prerequisites": reverse[skill],
            "reason": (
                f"{skill} is directly relevant to {role}."
                if direct else
                f"{skill} is a prerequisite needed before advancing toward {role}."
            )
        })

    mastered_required = sorted(set(required) & set(known))
    readiness = round(100 * len(mastered_required) / max(1, len(required)))

    return {
        "target_role": role,
        "known_skills": known,
        "mastered_required_skills": mastered_required,
        "skill_gaps": gaps,
        "readiness_percent": readiness,
        "learning_path": explanations,
        "unrecognized_subjects": unknown_subjects,
        "unrecognized_skills": unknown_skills
    }
