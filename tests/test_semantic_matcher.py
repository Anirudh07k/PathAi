from app.services.semantic_matcher import SemanticSkillMatcher


def test_empty_text_returns_no_matches():
    # Avoid loading the transformer model for this edge case.
    matcher = SemanticSkillMatcher.__new__(SemanticSkillMatcher)
    assert matcher.match_skills("", {"Python": "Python programming"}) == []
