# NBA Data Model

## Purpose

Define the inputs and explainability fields used to recommend a next best action during onboarding and post-deployment optimization. The model is a prototype decision policy, not a trained or validated prediction model.

## Data files

- `data/demo-accounts.json` contains fictional account state and event history.
- `data/nba-rules.json` contains signal conditions, behavior descriptions, bottleneck hypotheses, candidate actions, outcome events, guardrails, and illustrative conversion associations.
- `data/demo-analytics.json` contains synthetic A/B dashboard and AI SDR outcome examples.
- `data/account-context.json` mirrors the offline account-context guide for server-side use. Only the selected account's synthetic business context is supplied to its Tavus conversation; it is not rendered in the dashboard or used to rank NBA actions.
- `data/signal-library.json` contains proposed event patterns, proactive opener examples, candidate NBA actions, success measures, and eligibility guardrails. These patterns are not connected to product events.
- `app.js` loads these files, evaluates rule conditions, and displays the highest-priority matching action and experiment metrics.

## Decision record

Each rule is a reviewable decision record with these fields:

| Field | Meaning |
| --- | --- |
| `rule_id` | Stable identifier for the rule that matched. |
| `priority_rank` | Human-authored ordering used when multiple rules match. It is not a model score. |
| `when` | Boolean conditions against account fields. The prototype supports `all` and `any` clauses and the operators `equals`, `not_equals`, `gt`, `gte`, `lt`, `lte`, `lt_field`, `gte_field`, and `in`. |
| `behavior.summary` | Plain-language description of observed behavior. |
| `behavior.input_signals` | Fields, sources, provenance, and descriptions used to support the behavior statement. |
| `bottleneck_hypothesis` | Possible explanation for the behavior; it must not be presented as established fact. |
| `conversion_relationship` | Reference to a measured or explicitly illustrative association with paid conversion. |
| `next_best_action` | Action label, channel, PAL conversation brief, and observable success event. |
| `guardrails` | Constraints that prevent an unsuitable or repeated intervention. |

The runtime sorts matching NBA rules by `priority_rank`. Conversion associations are displayed as context and **do not currently rank actions**. A higher conversion propensity does not prove that a particular action will cause conversion.

## Account fields

The fictional account data uses these field groups:

- Identity and cohort: `id`, `name`, `plan`, `planType`, `daysSinceSignup`.
- Declared context: `industry`, `industryUseCaseFit`, `need`.
- Lifecycle state: `stage`, `path`, `firstValue`, `repeatUse`.
- Product behavior: `daysSinceLastProductActivity`, `palCreated`, `conversationStarted`, `conversationCount`, `apiErrors`, `apiConnected`, `mcpLinked`, `mcpToolUsed`, and `deploymentPublished`.
- Credit and plan state: `planType`, `minutesConsumed`, `creditsExhausted`, and `daysToCreditExhaustion`. Validate actual billing and usage event definitions before using these fields with real accounts.
- AI SDR outcome context: `agentPerformance.deployed`, `meetingsHeld`, `qualifiedOpportunities`, `qualificationRate`, `targetQualificationRate`, and `minimumMeetingsForReview`.
- Intervention state: `actionStatus`.
- Evidence history: `events[]` with `time`, `name`, and `provenance`.

For a real dataset, an absent event must not silently mean a failed event. Instrumentation coverage and event freshness need to be validated before interpreting a missing signal as inactivity.

The AI SDR example compares meeting-to-qualified-opportunity rate with an account-provided target after a demo minimum sample. The dashboard labels the sample threshold as illustrative; real experiments need validated outcome definitions, eligible lead populations, and a statistical power calculation. “Below target” is a reason to investigate, not proof that the agent is inherently good or bad.

One shared PAL is supplied with account context and a rule-specific conversation brief. The rules table selects the current next best action; the PAL confirms the user's goal, guides the selected action, and records structured feedback. This prototype does not fine-tune a PAL or let it change a live agent without approval.

The demo separates three credit-exhaustion cases: a free-trial account that exhausts minutes within two days before first value; a paid-plan account that exhausts its allowance before first value; and a paid-plan account that exhausts its allowance after reaching value. The first case proposes optimizing the test and reviewing eligibility for a small, one-time extension. The second prioritizes diagnosing usage or setup before a refill. The third proposes a refill offer with an account-level A/B test of a pre-approved promotion versus the standard offer. Thresholds, refill policies, and promotional effects remain hypotheses; the prototype does not grant credits, charge accounts, or randomize experiment arms.

The Signal Library shows five additional reusable trigger patterns. Pricing-page activity is a possible plan-evaluation signal, not proof of purchase intent. An unresolved ticket may justify a status check or an offered escalation, but the PAL must not say it escalated the ticket until a support system confirms it. Overages across three complete months may justify a capacity conversation; a temporary 2×-minutes offer is mentionable only when the offer is approved and account eligibility is confirmed. The remaining examples cover a successful connection with no first use and repeated successful use. All five patterns are proposed and need event definitions, freshness checks, eligibility rules, and suppression logic before activation.

For the post-value refill experiment, the proposed primary outcome is refill completion within seven days. Revenue and gross margin per eligible account, repeat use, refunds, support contacts, and cancellation are guardrails. A conversion rate alone is not enough to establish that a promotion is beneficial.

The PAL activation dashboard compares standard onboarding with a proactive PAL plus NBA context. It shows first-value rate by arm, invitation acceptance, completed sessions, average PAL minutes per completed conversation, and abandonment among accepted sessions. The displayed cohort is synthetic and its difference is descriptive only; no experiment is randomized or statistically evaluated by the prototype.

## Conversion associations

`conversion_associations[]` records a proposed relationship independently of the recommended action. Each record identifies:

- the condition and behavior being compared;
- the outcome, currently proposed as paid conversion by day 60;
- the baseline cohort and relative conversion index;
- evidence status and source note;
- whether the relationship is causal (currently false); and
- whether it is used to rank actions (currently false).

The `0.5x` inactivity and `1.3x` industry/use-case-fit values are user-proposed case hypotheses. They are labeled illustrative and unvalidated in the UI. They are not Tavus benchmarks, causal effects, or model outputs. Replace them only after analyzing mature, eligible cohorts with a defined denominator and observation window.

## Evidence provenance

Use an explicit provenance label for every value that enters a decision:

- `product_event`: recorded application behavior;
- `product_state`: current configuration state;
- `account_profile`: account-provided attributes;
- `user_stated`: information explicitly stated during a PAL conversation;
- `inference`: model interpretation that needs confirmation; or
- `synthetic`: fabricated demo data.

Keep user statements, observed events, and inferred states distinct. Real-time audio or visual perception may help the PAL adjust its conversation, but inferred emotion is not stored here as a durable customer attribute or used by the NBA to predict purchase intent.

## Outcome loop

After an intervention, record the invitation status, user acceptance or decline, PAL session completion, user-stated blocker, issue-resolution confirmation, satisfaction response, first-value event, and repeat use when available. Re-evaluate the account after those events. Preserve a no-action option and suppress follow-up after decline, opt-out, or recent contact.

## Current boundary

All demo account records are synthetic and stored in browser local storage. The Signal Library is a design artifact, not a set of running triggers. No Tavus customer telemetry, external CRM, support ticket system, notification channel, regression model, or causal experiment is connected.

The hypothetical account-spend, ROI, offer scenarios, and hand-assigned 0–100 churn-risk examples are documented in the offline [NBA Account Context Guide](../outputs/account-context-guide/NBA_Account_Context_Guide.xlsx) and mirrored for server-side session context in `data/account-context.json`. These risk scores are synthetic, uncalibrated, and not probabilities or predictions. The backend sends only the selected account's fields to its Tavus conversation, labels the context synthetic, and instructs the PAL to use it only for scenario guidance without disclosing the score. This context is not loaded into the browser or NBA rule evaluation. Offer eligibility, promotion terms, and billing remain disconnected.

The browser stores a separate local interaction log for invitations, acceptance, decline, scripted milestone completion, satisfaction feedback before call closure, Tavus conversation creation, and call closure. It can be exported as CSV. These are demo actions rather than Tavus callbacks or customer outcomes; they must not be mixed with the illustrative A/B cohort metrics.

Before ending a PAL call, the conversation checks whether the participant found the help useful. Positive feedback can lead to a hypothetical 50%-off-for-two-months offer only after first value plus explicit upgrade/pricing intent or a capacity need. Negative feedback triggers a question about what was missing and service recovery first; a one-free-month retention offer is only a hypothetical path for selected high-risk rows after recovery. Satisfaction alone does not establish upgrade intent, and no offer is applied by the prototype.
