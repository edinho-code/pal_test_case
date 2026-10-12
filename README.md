# Tavus CRM — PAL Test Case

A Tavus conversational prototype for lead qualification, using a simple data table without an external CRM integration.

## Status

Local HTML/CSS/JavaScript prototype with lead records persisted in browser localStorage. Live Tavus integration is not implemented yet.

## Run the prototype

Open `index.html` in a browser. Add and search leads, select a contact, and save their status, summary, and next step. Use fictional data. Records stay in the current browser.

The conversation area displays a pending integration state and does not simulate a live Tavus call.

## Planned flow

Identify lead → create Tavus session on the backend → converse → confirm details → save outcome → end session → reconcile final transcript.

## Configuration

Copy `.env.example` to `.env.local` when implementing the backend. Keep credentials local and server-side. These variables describe planned configuration; the current static prototype does not read them.

- `TAVUS_API_KEY`: server-side API key.
- `TAVUS_PAL_ID`: selected or created PAL.
- `TAVUS_FACE_ID`: selected Face, unless supplied by the PAL configuration.
- `APP_BASE_URL`: application URL.
- `TAVUS_CALLBACK_URL`: public HTTPS callback endpoint, once implemented.

## Project structure

- `index.html`, `styles.css`, `app.js`: local prototype.
- `docs/mvp.md`: proposed scope and acceptance criteria.
- `.agents/skills/tavus-crm/`: Tavus product and integration reference skill.
- `AGENTS.md`: contributor and agent instructions.

## Next steps

1. Confirm the target audience and demonstration outcome.
2. Implement the backend and session lifecycle.
3. Configure the PAL and Face.
4. Connect structured outcomes and final transcripts to the data table.
5. Validate the demonstration and report measured results.

## References

[Tavus documentation](https://docs.tavus.io/api-reference/overview) · [OpenAPI contract](https://docs.tavus.io/openapi.yaml)
