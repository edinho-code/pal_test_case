# Tavus CRM

Use `.agents/skills/tavus-crm/SKILL.md` for Tavus tasks. Read `docs/mvp.md` before implementing the MVP.

All code, identifiers, comments, UI copy, headings, README content, technical documentation, and commit messages must be in English. Conversation with the user may remain in Portuguese. This project language requirement takes precedence over language defaults in reference skills.

Keep credentials server-side and out of Git. Update `.env.example` with names and placeholders when adding configuration.

Consult current official documentation before implementing Tavus payloads. Distinguish mocks, implemented integrations, and verified live calls. Do not claim an integration works without evidence.

The user selected a prototype without external CRM integration. Use a simple table for demonstration data. The initial implementation uses dependency-free HTML/CSS/JavaScript and fictional browser-local records.
