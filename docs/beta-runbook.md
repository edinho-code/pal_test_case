# Beta Runbook

## Beta objective

Demonstrate one complete lifecycle NBA loop with fictional account data:

1. Read product and user-stated signals.
2. Explain the matched rule and onboarding hypothesis.
3. Offer one relevant PAL walkthrough.
4. Record acceptance, decline, or completion.
5. Show the account's updated lifecycle milestone.

The browser prototype demonstrates the decision and measurement design. It does not establish that the signals predict conversion or that the intervention causes an uplift.

## Demo path

Use **Mosaic Studio** for the main walkthrough. Its synthetic event history shows a PAL created and no conversation attempt. The rule recommends a guided first conversation. Simulate the invitation, accept the session, then record a first useful conversation. Explain that the updated milestone is a user-entered demo outcome, not a Tavus telemetry event.

Use **Northstar Labs** to show that a critical setup issue should receive troubleshooting before any commercial offer. Use **Beacon Health** or **Orbit AI** to show how the same framework selects a different action for another adoption path.

## Data labels

- **Synthetic product event:** fabricated account activity used to drive the demo rules.
- **User-stated (synthetic):** fabricated statement included to show how declared needs may inform an action.
- **Bottleneck hypothesis:** a possible explanation, not a fact about a real customer.
- **Demo outcome:** manually selected in the prototype, not independently verified.

Do not use this dataset to estimate conversion, churn, model accuracy, or causal lift.

## Decision logic

The browser reads account state from `data/demo-accounts.json` and decision policy from `data/nba-rules.json`. It evaluates each rule's conditions, then selects the matching rule with the highest human-authored `priority_rank`. The selected record explains behavior, input fields, bottleneck hypothesis, action, success event, and guardrails.

Conversion associations are shown as context and do not change action ranking. The `0.5x` and `1.3x` values are illustrative, unvalidated case hypotheses, not Tavus benchmarks or causal effects. A missing product event is not evidence of inactivity until event coverage and the observation window are validated.

## Pilot measurement proposal

For a real test, select one eligible lifecycle segment and one intervention. Define the trigger, intervention window, account-level randomization unit, holdout experience, primary leading outcome, and guardrails before exposure. A plausible leading outcome is first useful conversation within a prespecified period. For mature free-account cohorts, measure free-to-paid by day 60 as a downstream outcome. Track invitation exposure, acceptance, completion, milestone progress, opt-outs, unresolved critical errors, and usage before first value.

Report cohort dates, denominator, sample size, missing events, and uncertainty. Treat observational relationships as associations; report causal impact only from a suitable experiment.

## Start a local Tavus API test or live PAL session

1. Use the configured Tavus onboarding/support PAL (`p447fc20f4a7`): Brooke / Phoenix 4.5 Face (`rc8992fe8e8e`), Objective (`o3219a468312f`), and four attached Guardrails. The prompt version is 1.4.0. See `data/growth-pal-deployment.json` for the deployment record and `prompts/growth-pal-system-prompt.md` for the prompt.
2. Copy `.env.example` to `.env` and set `TAVUS_API_KEY` and `TAVUS_PAL_ID` (plus optional `TAVUS_FACE_ID` override). Never put the key in browser code or Git.
3. Run `npm start` and open `http://localhost:3000`. The entry screen asks for the participant name and company scenario, previews the selected signal and next best action, then starts the Tavus conversation with that case context. The growth dashboard remains available from the entry screen.
4. With `TAVUS_TEST_MODE=true`, the entry screen creates a no-cost API test and the PAL does not join. To run a live PAL session, set `TAVUS_TEST_MODE=false` before starting the server. The entry screen then opens the live Tavus conversation after case selection; this may use plan minutes or credits.

The local integration's test-mode request was verified to create a Tavus test conversation (`c3b9f1025bb5d451`); the test conversation ended without the PAL joining. This verifies API configuration and request plumbing, not spoken behavior. The current PAL prompt and objective include a pre-close satisfaction check, a service-recovery branch, and conditional offer examples; the new behavior still needs a live dialogue evaluation. The prototype displays a selected-account trigger and sends only that account's matched NBA rule and synthetic business context to Tavus; the context file is not exposed as a static asset or used to rank actions. The local interaction log captures simulated invitation, acceptance, decline, milestone, satisfaction feedback before call closure, call closure, and Tavus conversation creation, with CSV export. It does not embed Tavus in the dashboard or persist conversation end, abandonment, error, or completion callbacks from a real PAL session. It also does not send a proactive notification. A public beta needs an HTTPS host, access control, rate limiting, approved product-event definitions, a privacy/retention plan, an eligible cohort, and an agreed holdout or comparison design. Add and verify a Tavus callback/webhook lifecycle before treating live conversation metrics as complete.

## PAL quality training loop

“Training” in this beta means configuring the system prompt, Objective, Guardrails, and session context, then evaluating and revising the prompt. It does not fine-tune model weights. Use the same ten fixtures in `growth-pal-evaluation.md` for each version, with at least one multi-turn run per fixture and varied user phrasing. Score the transcript against the rubric, save failure examples without credentials or unnecessary personal data, change one prompt element at a time, and rerun the full suite. Require all safety-critical checks to pass and at least 8/9 overall before a supervised pilot. A human reviews every failed case; do not claim the PAL is “perfect” or ready from a single successful conversation.

## Local validation checklist

- From `pal_test_case`, `npm start` serves the app and local Tavus backend at `http://localhost:3000`.
- Both JSON files load and the account rows display the matching rules.
- Search and setup-path filters select the intended accounts.
- Each account displays the matching rule and its evidence.
- Accept, decline, complete, close, and reset actions update the local state and event history.
- The selected account's business context is passed to Tavus by the backend; direct static access to the context JSON returns 404.
- Local interaction events and user-stated feedback persist across reloads, appear in the local outcomes panel, and export to CSV.
- Local session counts remain separate from the illustrative A/B cohort metrics.
- Reset demo restores the original synthetic cohort.
- With no `.env`, the dashboard loads and its Tavus button is disabled; the backend returns a clear configuration error to direct API requests.
- With test credentials, test mode creates a Tavus test conversation and does not join the PAL.
- Live mode creates a session and displays the returned join URL; this may consume plan minutes or credits.
- No external notification occurs, and live session outcome metrics are not yet persisted.
