"""Public reviews read contracts. Review writes and moderation remain pending."""

from app.modules.reviews.queries import public_ratings

__all__ = ["public_ratings"]
