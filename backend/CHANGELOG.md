# Backend changelog

## 0.2.0 — 2026-09-20

- Add authenticated workflows for users, favorites, reviews, notifications and administrators.
- Add center management, validated image storage, SMTP credentials, reports in PDF/CSV and demo seed.
- Preserve moderation decisions after review deletion; migrate existing schema without replacing baseline.
- Revalidate center ownership under write locks and revoke sessions on blocking/reassignment.
- Expand discovery search to locality fields required by HU04.
- Add PostgreSQL HTTP workflows, security/ownership regression checks and local test instructions.
