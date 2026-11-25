"""Exact budget-constrained planner for the small PathAI skill graph."""
from itertools import combinations
from app.services.pathway import SKILLS, ROLES, normalize_exact

# Illustrative study-hour estimates, not empirically validated.
HOURS = dict(zip(
    [s["name"] for s in SKILLS],
    [20, 12, 30, 8, 20, 10, 15, 20, 15, 25, 60, 60, 40, 40, 15, 12, 20]
))
PARENTS = {s["name"]: set(s.get("prerequisites", [])) for s in SKILLS}


def order_skills(selected, known):
    remaining = set(selected) - set(known)
    done = set(known)
    ordered = []
    while remaining:
        ready = sorted(s for s in remaining if PARENTS[s] <= done)
        if not ready:
            raise ValueError("Missing prerequisites or cyclic skill graph")
        for skill in ready:
            ordered.append(skill)
            done.add(skill)
            remaining.remove(skill)
    return ordered


def plan(required, known, budget):
    if budget < 0:
        raise ValueError("Budget must be nonnegative")
    required, known = set(required), set(known)
    if (required | known) - PARENTS.keys():
        raise ValueError("Unknown skill")
    needed = set(required)
    stack = list(required - known)
    while stack:
        for parent in PARENTS[stack.pop()]:
            if parent not in needed:
                needed.add(parent)
                if parent not in known:
                    stack.append(parent)
    missing = sorted(needed - known)
    full_order = order_skills(missing, known)
    # Exhaustive search is practical for the current 17-skill knowledge base.
    # Maximize completed target skills, then useful prerequisite progress,
    # then minimize study hours. All selected skills must be feasible.
    best = set()
    best_score = (0, 0, 0)
    for size in range(1, len(missing) + 1):
        for subset in combinations(missing, size):
            selected = set(subset)
            cost = sum(HOURS[s] for s in selected)
            if cost > budget:
                continue
            if any(not PARENTS[s] <= (known | selected) for s in selected):
                continue
            score = (len(required & selected), len(selected), -cost)
            if score > best_score:
                best, best_score = selected, score
    ordered = order_skills(best, known)
    return {
        "budget_hours": budget,
        "estimated_full_hours": sum(HOURS[s] for s in full_order),
        "planned_hours": sum(HOURS[s] for s in ordered),
        "full_path": full_order,
        "scheduled": [{"skill": s, "hours": HOURS[s],
                       "prerequisites": sorted(PARENTS[s])} for s in ordered],
        "deferred": [s for s in full_order if s not in best],
        "target_skills_covered": sorted(required & (known | best)),
        "target_skills_total": len(required),
        "estimates_note": "Illustrative study hours; completion is not proof of mastery."
    }


def compare_roles(skills, budget):
    known, unknown = normalize_exact(skills)
    results = [{"role": role, **plan(info["skills"], known, budget)}
               for role, info in ROLES.items()]
    results.sort(key=lambda r: (r["estimated_full_hours"], r["role"]))
    return {"careers": results, "unrecognized_skills": unknown}
