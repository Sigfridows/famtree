"""Prevent default application-role privileges from weakening the moderation audit."""

from alembic import op

revision = "20260920_0007"
down_revision = "20260920_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'famtree_app') THEN
        REVOKE UPDATE, DELETE ON famtree.moderation_decisions FROM famtree_app;
        GRANT SELECT, INSERT ON famtree.moderation_decisions TO famtree_app;
    END IF; END $$""")


def downgrade() -> None:
    # Deliberately retain the safer permissions during downgrade.
    pass
