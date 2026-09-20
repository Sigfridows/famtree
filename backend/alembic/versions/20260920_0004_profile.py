"""Allow center administrators to maintain their own profile (HU14/HU15)."""

from alembic import op

revision = "20260920_0004"
down_revision = "20260919_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("ck_usuarios_perfil_por_rol", "usuarios", schema="famtree")
    op.create_check_constraint(
        "ck_usuarios_perfil_por_rol",
        "usuarios",
        "rol IN ('USUARIO_REGISTRADO', 'ADMIN_ASILO') OR "
        "(foto_perfil IS NULL AND descripcion IS NULL)",
        schema="famtree",
    )


def downgrade() -> None:
    op.drop_constraint("ck_usuarios_perfil_por_rol", "usuarios", schema="famtree")
    op.create_check_constraint(
        "ck_usuarios_perfil_por_rol",
        "usuarios",
        "rol = 'USUARIO_REGISTRADO' OR (foto_perfil IS NULL AND descripcion IS NULL)",
        schema="famtree",
    )
