from app.services.pathway import analyze


def test_analyze_known_role_returns_pathway():
    result = analyze(
        student_subjects=["Programming", "Statistics", "Mathematics"],
        student_skills=["Python", "SQL"],
        target_role="Machine Learning Engineer",
    )

    assert result["target_role"] == "Machine Learning Engineer"
    assert "skill_gaps" in result
    assert "learning_path" in result
    assert 0 <= result["readiness_percent"] <= 100


def test_unknown_role_returns_error():
    result = analyze([], [], "Underwater Basket Weaver")
    assert "error" in result
