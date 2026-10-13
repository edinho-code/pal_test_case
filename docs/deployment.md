# GitHub and Vercel deployment

## Architecture

- `/`: standalone PAL launcher; no dashboard scripts or saved browser state.
- `/dashboard.html`: strategy dashboard and illustrative metrics.
- `/api/tavus/config`: reports configuration availability without credentials.
- `/api/tavus/conversations`: validates the selected demo account and participant name, constructs its NBA context, and calls Tavus server-side.
- Tavus hosts the video room and PAL runtime.

`npm run build` creates an allowlisted `public/` directory. `.env`, source prompts, deployment metadata, and `data/account-context.json` are excluded from public hosting. Vercel bundles JSON context with the backend function only. Dashboard interaction logs remain browser-local; they are not shared analytics.

## Connect the repository

1. Push the project to `edinho-code/pal_test_case` on GitHub.
2. In Vercel, add a project and import that repository.
3. Use framework preset **Other** and the repository root. `vercel.json` defines the build command (`npm run build`) and output directory (`public`). Use Node.js 24.x.
4. Add server environment variables: `TAVUS_API_KEY`, `TAVUS_PAL_ID`, optional `TAVUS_FACE_ID`, and `TAVUS_TEST_MODE`.
5. Set Preview to `TAVUS_TEST_MODE=true` and Production to `TAVUS_TEST_MODE=false`. Do not add a browser/public prefix to credential names.
6. Deploy. Environment changes require a new deployment.
7. The connected GitHub production branch publishes updates automatically through Vercel's Git integration.

## Presentation validation

- Open the production URL on the device and browser used for the presentation.
- Choose a scenario and participant name, create one session, and open or copy the returned room URL.
- Grant camera/microphone permissions and confirm the case-specific opening.
- End the conversation before another test; Tavus plan concurrency limits still apply.
- Keep a short recording of the validated scenario as a presentation backup.

Local tests and API test mode do not verify speech quality. The independent AI disclosure is currently “I'm Tavus AI.” followed by the per-case greeting. Verify this in a fresh live session.
