# Tavus Lifecycle NBA Beta

A small Growth case prototype showing how lifecycle signals could identify an onboarding bottleneck, recommend one next best action, and offer user-controlled help through a Tavus PAL.

## Run the prototype locally

From this folder, run the Node server:

```sh
npm start
```

Open [http://localhost:3000](http://localhost:3000). The homepage launches PAL conversations without reading browser-saved dashboard state. Open `/dashboard.html` for fictional accounts, NBA rules, and analytics examples; dashboard interactions and stated feedback are saved only in the current browser. Use **Reset demo** to restore the original cohort and clear its interaction log. The Python static server can still display the simulated prototype, but it cannot call the Tavus backend.

Run `npm test` to verify selected-account conversation-context construction and synthetic-context isolation.

## Connect a Tavus PAL

1. This project has a configured Tavus onboarding PAL: **Tavus Onboarding Specialist** (`p447fc20f4a7`), using the Brooke Phoenix 4.5 Face (`rc8992fe8e8e`), one conversation Objective, and four Guardrails. Prompt v1.5.1 asks for stated satisfaction before ending and applies conditional, hypothetical offer guidance. The Tavus IDs and prompt are recorded in `data/growth-pal-deployment.json` and `prompts/growth-pal-system-prompt.md`.
2. Copy `.env.example` to `.env`, then add `TAVUS_API_KEY` and `TAVUS_PAL_ID`. A `TAVUS_FACE_ID` override is only needed if changing the PAL's default Face. Keep `.env` private; it is ignored by Git.
3. Keep `TAVUS_TEST_MODE=true` and run `npm start`. Open [http://localhost:3000](http://localhost:3000), choose a fictional account, and click **Create no-cost Tavus API test**. Tavus creates an ended test conversation; the PAL does not join.
4. To start a real conversation, stop the server, set `TAVUS_TEST_MODE=false` in `.env`, and run `npm start` again. Choose an account and click **Start live PAL conversation**. Use the returned join link to enter the session. A live conversation may use plan minutes or credits.

The API key stays on the backend, locally or in a Vercel Function. The browser receives only a configuration status and the created conversation ID, URL, and status. Do not paste credentials into chat, browser JavaScript, screenshots, or Git. The current PAL is prompt-configured, not fine-tuned; the updated warm, trigger-first flow and its end-of-call branches still need a live dialogue evaluation against the fixtures in `docs/growth-pal-evaluation.md`.

## Try the beta flow

1. Select **Mosaic Studio** for a first-conversation intervention, **Harbor Support** for early free-trial credit exhaustion, **Lighthouse Support** for a post-value refill promotion experiment, or **Vantage Sales** for the AI SDR performance review.
2. Review the visible outreach trigger, matched rule, and bottleneck hypothesis.
3. Select **Simulate PAL invitation**, then **Accept & start demo session**.
4. Record whether the issue was addressed. Before the simulated call can close, the PAL asks whether its help was useful and records the participant's stated answer. The next-step copy varies by feedback; any offer remains a scenario only.
5. Inspect the API, hosted deployment, and MCP accounts to compare different lifecycle actions.
6. Review the illustrative cohort dashboard and the separate local interaction log. Export the local demo outcomes to CSV if useful.

The PAL invitation, scripted transcript, milestone, account data, cohort summaries, and dashboard metrics are synthetic. The optional Tavus API button creates a real Tavus conversation using the selected account's matched NBA rule and account-specific business context; in test mode the PAL does not join, and in live mode the user opens Tavus's join URL. The business context is server-side guidance only and is not shown in the dashboard or used to rank NBA rules. The local interaction log does not receive Tavus end/abandon callbacks. This first integration does not send notifications, integrate a CRM, or collect real customer telemetry. Synthetic metrics must not be presented as measured Tavus results.

## What is implemented

- Nine fictional accounts spanning API, hosted deployment, MCP, use-case discovery, plan-aware credit exhaustion, and AI SDR performance scenarios.
- A synthetic PAL A/B dashboard with first-value rate, invitation acceptance, average conversation minutes, abandonment, and an AI SDR quality signal.
- Proposed account-level A/B design for a post-value refill promotion, displayed without assigning experiment arms or executing offers.
- A data-driven NBA policy with observed behavior, input signals, bottleneck hypothesis, conversion relationship, candidate action, outcome event, and guardrails.
- A five-pattern Signal Library with proactive PAL openers for plan research, unresolved support, recurring minute overage, connection without first use, and repeated successful use. These are proposed triggers awaiting event instrumentation.
- A selected-account trigger card that explains why the PAL is reaching out, plus server-side delivery of that account's synthetic business context to Tavus.
- Clearly labeled illustrative conversion hypotheses that are not used to rank actions.
- Explainable browser-side rule matching with visible evidence and a candidate outcome.
- Search and setup-path filters.
- A simulated, user-controlled PAL invitation, scripted conversation, decline path, and recorded milestone.
- A locally persisted interaction log for invitations, acceptance, decline, simulated milestones, session closure, and user-stated helpfulness, with CSV export.
- A local Node backend that creates Tavus conversations in test or live mode without exposing the API key to the browser.
- Local persistence and a reset control.
- Cohort counts labeled as synthetic demo data.

## What is needed for a live Tavus beta

The app can be reviewed without credentials. Creating a Tavus conversation requires a Tavus API key and PAL ID; a Face ID is needed only if the PAL has no default Face. The local backend endpoint is implemented. This prototype is for local testing: before a public beta, host the backend over HTTPS, add access control and rate limits, and decide how session end/error events will be captured. A real pilot also needs approved product-event definitions, an eligible cohort, an agreed intervention, and a holdout or comparison plan.

See [the case scope](docs/project-scope.md), [the NBA data model](docs/nba-data-model.md), and [the beta runbook](docs/beta-runbook.md) for assumptions, schema, demo boundaries, and the next implementation stages.

The hypothetical account economics, 0–100 churn-risk examples, offer scenarios, and field definitions are documented in the offline [NBA Account Context Guide](outputs/account-context-guide/NBA_Account_Context_Guide.xlsx). The churn scores are hand-assigned, synthetic, and uncalibrated; they are not probabilities or real-customer predictions. The server-side JSON mirror in `data/account-context.json` sends only the selected account's context to Tavus; it does not render in the dashboard or affect NBA ranking. The 50%-off-for-two-months upgrade offer and one-free-month retention offer are role-play examples only; no terms, eligibility checks, or billing actions are connected.

## Deploy with GitHub and Vercel

See [the deployment guide](docs/deployment.md). Vercel runs `npm run build` and publishes only the allowlisted `public/` assets. A shared Node function serves `/api/tavus/config` and `/api/tavus/conversations`; the account business context is bundled only with that function. The video call itself is hosted by Tavus.

The homepage is the standalone PAL launcher. `/dashboard.html` opens the strategy dashboard. Set `TAVUS_TEST_MODE=false` in the Vercel Production environment for live calls, then redeploy.
