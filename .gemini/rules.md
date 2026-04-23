# Project Rules — ZeroOne Portfolio Manager

## Post-Change Documentation Check
After completing ANY code change to this project (scripts, workflows, templates, or plugins), **always review and update** the following documentation files if the change affects behavior, features, or data structures:

1. **`README.md`** — User-facing instructions (how to add/update/delete projects, form fields, FAQ).
2. **`TECHNICAL.md`** — Developer-facing docs (architecture table, meta fields, image handling, frontmatter schema, troubleshooting).

Do NOT commit code changes without verifying these docs are still accurate. If a doc update is needed, include it in the same commit or as an immediate follow-up.

## Commit Discipline
- Do **not** commit unless the user explicitly asks to commit or push.
- When committing, use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`.

## WordPress Plugin Context
- The site runs on WordPress (Astra Theme) with no FTP access. Plugin files (`wp-portfolio-cpt.php`, `single-portfolio.php`, `archive-portfolio.php`) must be manually uploaded via WP File Manager in the dashboard.
- All portfolio data flows: GitHub Issue → AI Agent (`process-portfolio.js`) → Markdown → PR → Merge → Sync (`sync-wordpress.js`) → WordPress REST API.

## Safe Update / Preservation Logic
- The AI agent preserves existing markdown body content on re-sync unless the user adds `[REGEN]` to the issue title.
- Never overwrite manually edited markdown content without explicit user consent.
