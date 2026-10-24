from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class SemanticSkillMatcher:
    """Match free-text profile descriptions to a small, known skill catalogue."""

    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self._cached_skills = None
        self._cached_embeddings = None

    def match_skills(self, text, skill_database, threshold=0.45):
        if not text or not text.strip():
            return []

        # Embed both a skill's canonical name and its descriptive text.
        skill_names = list(skill_database.keys())
        descriptions = [
            f"{name}: {skill_database[name]}" for name in skill_names
        ]

        if self._cached_skills != descriptions:
            self._cached_skills = descriptions
            self._cached_embeddings = self.model.encode(
                descriptions, normalize_embeddings=True
            )

        text_embedding = self.model.encode(
            [text], normalize_embeddings=True
        )
        similarities = cosine_similarity(
            text_embedding, self._cached_embeddings
        )[0]

        matches = []
        for skill, score in zip(skill_names, similarities):
            if float(score) >= threshold:
                matches.append({
                    "skill": skill,
                    "confidence": round(float(score), 3)
                })

        matches.sort(key=lambda item: item["confidence"], reverse=True)
        return matches
