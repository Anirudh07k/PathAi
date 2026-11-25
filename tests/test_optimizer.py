from app.services.optimizer import plan, compare_roles, HOURS

def test_budget_and_dependencies():
    result = plan(["Pandas"], [], 30)
    assert result["planned_hours"] <= 30
    known = set()
    for item in result["scheduled"]:
        assert set(item["prerequisites"]) <= known
        known.add(item["skill"])
    assert "Pandas" not in known

def test_full_path():
    result = plan(["Pandas"], ["Python"], 100)
    assert result["full_path"] == ["NumPy", "Pandas"]
    assert result["planned_hours"] == HOURS["NumPy"] + HOURS["Pandas"]
    assert not result["deferred"]

def test_zero_budget():
    assert plan(["Python"], [], 0)["scheduled"] == []

def test_comparison():
    result = compare_roles(["Python"], 40)
    assert len(result["careers"]) == 5
    assert all(r["planned_hours"] <= 40 for r in result["careers"])
