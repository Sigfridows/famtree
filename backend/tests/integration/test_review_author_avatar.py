"""Review authors use the current persisted photo, not a publication snapshot."""

import io

import pytest
from PIL import Image

from tests.integration.test_workflows import PREFIX, Workflow, login, register
from tests.integration.test_workflows import workflow as workflow

pytestmark = pytest.mark.integration


async def test_uploaded_replaced_and_removed_photo_follows_existing_reviews(
    workflow: Workflow,
) -> None:
    content = io.BytesIO()
    Image.new("RGB", (32, 32), "green").save(content, format="PNG")
    async with workflow.client() as author, workflow.client() as guest:
        await register(author, "avatarwriter")
        await login(author, "avatarwriter")
        center = workflow.ids[0]

        async def upload() -> str:
            response = await author.post(
                PREFIX + "/users/me/picture",
                files={"file": ("profile.png", content.getvalue(), "image/png")},
            )
            assert response.status_code == 200, response.text
            return str(response.json()["profilePicture"])

        first = await upload()
        response = await author.post(
            PREFIX + "/reviews",
            json={"asylumId": center, "rating": 5, "comment": "Excelente atención del centro"},
        )
        assert response.status_code == 201, response.text
        review_id = response.json()["reviewId"]
        assert response.json()["author"]["picture"] == first

        async def assert_current(expected: str | None) -> None:
            for client in (author, guest):
                response = await client.get(PREFIX + f"/asylums/{center}/reviews")
                assert response.status_code == 200, response.text
                review = next(row for row in response.json() if row["reviewId"] == review_id)
                assert review["author"]["picture"] == expected
                response = await client.get(PREFIX + f"/asylums/{center}/reputation")
                assert response.status_code == 200, response.text
                review = next(
                    row for row in response.json()["items"] if row["reviewId"] == review_id
                )
                assert review["author"]["picture"] == expected
            assert (await author.get(PREFIX + "/auth/session")).json()["profilePicture"] == expected

        await assert_current(first)
        replacement = await upload()
        assert replacement != first
        await assert_current(replacement)
        assert (await guest.get(replacement)).status_code == 200
        response = await author.delete(PREFIX + "/users/me/picture")
        assert response.status_code == 200, response.text
        await assert_current(None)
