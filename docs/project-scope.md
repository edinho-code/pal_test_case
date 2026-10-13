# Tavus Lifecycle NBA Growth Case

## Case objective

Present a practical Next Best Action (NBA) strategy for helping Tavus customers progress through product onboarding and improve the performance of workflows they build with Tavus. One shared PAL receives a context-specific brief from the NBA playbook. The case demonstrates how lifecycle or customer outcome signals could surface a likely bottleneck, how the PAL could offer a useful intervention, and how Growth would measure whether it helped.

The case is a strategy and prototype. It does not claim access to Tavus customer telemetry, a trained production model, or proven conversion lift.

## Problem hypothesis

Some self-serve accounts may spend time configuring Tavus, encounter friction, and use part of their trial allowance before reaching a useful outcome. The first research question is whether a meaningful activation bottleneck exists between account setup and the first useful conversation, and which intervention could help resolve it.

This is a hypothesis to validate with real, appropriately authorized product data. Any rates, risk multipliers, minute thresholds, or examples shown in the demo are labeled as illustrative unless supported by a cited dataset.

## Target user and lifecycle

The initial user is a self-serve Tavus builder or team evaluating a use case. The case follows the first 60 days and recognizes multiple implementation paths rather than assuming every account uses every feature:

1. Discover a use case and create an account.
2. Begin setup and choose a path: hosted deployment, API, or MCP connector.
3. Complete the relevant setup and connect successfully.
4. Run a first conversation and achieve a useful outcome.
5. Deploy or integrate the experience into a real workflow.
6. Return, repeat the use case, invite collaborators, or consider expansion.

## Growth objective and metrics

The primary business outcome for eligible free accounts is free-to-paid conversion within 60 days. The leading activation outcome is a first useful conversation, defined for the experiment before launch. A useful conversation should achieve a stated objective or complete a task that the account selected; merely creating a PAL or opening a room does not count as value.

Supporting measures:

- Time from signup to first useful outcome.
- Conversion between lifecycle milestones, segmented by adoption path.
- Successful setup rate and time to recover from critical errors.
- Trial minutes consumed before first useful outcome.
- Return activity in distinct weeks and activity during days 46–60.
- Invitation acceptance, PAL conversation completion, and progress after the intervention.
- PAL invitation acceptance, completed and abandoned sessions, average PAL conversation minutes, and first-value outcome by experiment arm.
- Meeting-to-qualified-opportunity rate for the AI SDR example, compared with the account's stated target and a minimum review threshold.
- Paid conversion by day 60 for mature, eligible cohorts.

Paid churn and lifetime value belong to later lifecycle analyses. The initial case does not claim to estimate either from a short or synthetic dataset.

Guardrails include cost or minutes consumed before value, unresolved critical errors, opt-outs or declined invitations, repeated recommendations, and inappropriate commercial offers.

## NBA strategy

The NBA is a decision strategy, not just a behavior score. For each eligible account and decision moment, it:

1. Reads observed product signals and the account's lifecycle stage.
2. Forms an explainable bottleneck hypothesis.
3. Filters to actions appropriate for that stage and adoption path.
4. Recommends one next action with evidence and a measurable expected outcome.
5. Records whether the user accepted the action and whether the account advanced.

The demo uses transparent, editable rules. It does not train a regression model on invented or unavailable data. A future analysis could test which signals predict activation, then run controlled experiments to estimate the incremental effect of each intervention.

Example candidate actions, all hypotheses until validated:

| Observed signal | Bottleneck hypothesis | Candidate next action | Outcome to measure |
| --- | --- | --- | --- |
| Account created; setup not started | The first use case or next step is unclear | Offer a short use-case walkthrough | Setup started |
| PAL created; no conversation attempted | The account needs a concrete first test | Offer a guided first conversation | First conversation started and completed |
| API attempts fail before a useful conversation | Technical setup is blocking activation | Offer troubleshooting based on the recorded error | Successful connection, then useful conversation |
| MCP authorization is incomplete or tools are unused | Connector setup has not become a working workflow | Offer a connector or tool-call walkthrough | Tool successfully used in a conversation |
| Deployment published; no conversation observed | The live experience may not yet have been tested or reached | Offer a deployment test | First visitor conversation |
| Trial usage rises before an aha moment | The account may use its allowance before seeing value | Offer a shorter, targeted test and review setup | Useful outcome before allowance is exhausted |
| Trial minutes exhausted within two days after at most one conversation, with no first value | The account may have spent its allowance on setup or an unsuccessful test | Offer a focused, PAL-guided first-value test and review eligibility for a small, one-time minute extension | First useful outcome after any eligible extension; track conversion separately |
| Paid-plan allowance exhausted before first value | Setup, retries, or a technical issue may be consuming paid usage | Diagnose the blocker and optimize usage before offering a refill | First useful outcome and usage to value |
| Paid-plan allowance exhausted after first value and repeat use | The account may need a refill to continue a valuable workflow | Offer an eligible refill; test an approved promotion against the standard offer at account/workspace level | Refill completion within seven days, with revenue and margin guardrails |
| AI SDR has enough completed meetings, but meeting-to-qualified-opportunity rate is below the account target | Prospect fit, qualification criteria, or handoff timing may be limiting results | Use the shared PAL to review outcome evidence and agree on one change to test against the current agent | Qualified opportunities per completed meeting, with qualified meeting volume and show rate as guardrails |
| Useful outcome achieved and a related need is stated | The account may be ready to extend the workflow | Suggest a relevant next capability or scale option | Adoption of the next use case or paid conversion |

Signals such as time spent in setup or minutes consumed are contextual. No single threshold automatically establishes intent, frustration, churn risk, or upgrade readiness. A proposed ratio such as “20x more likely” must include its source, cohort, time window, and denominator; otherwise it is displayed only as a synthetic example.

## PAL and real-time conversation

The account-level NBA decides whether to offer help and what kind of help fits the observed product state. A PAL can then explain the recommendation, guide the user through a step, ask whether the issue is resolved, or offer a follow-up session.

If real-time perception is available and configured appropriately, audio or visual cues may help the PAL adapt pacing or wording during a conversation. These cues are uncertain and are not durable account labels. The PAL should confirm the user's preference instead of inferring commercial intent, churn, or discount eligibility from expression or tone.

The intended invitation is user-controlled: an in-product prompt or notification offers “Talk now” or “Schedule a walkthrough.” The user chooses whether to join. The prototype may simulate this invitation. It must not imply that Tavus itself sends a native push notification unless that capability is separately verified; a real notification channel would be an application or messaging integration.

Griffin may be shown as an optional future interaction layer if access is available. The core NBA strategy and prototype must work independently of Griffin's preview availability.

## Prototype and data

The prototype remains a lightweight browser application with a simple local table and fictional records. No external CRM is connected. The demo table may include:

- Account and cohort identifiers.
- Lifecycle stage and selected setup path.
- Timestamped product events, latest setup state, and error category.
- PAL, API, MCP, deployment, and conversation milestones where relevant.
- Trial usage and first useful outcome status.
- NBA hypothesis, recommended action, rationale, and priority.
- Invitation status and outcome after the intervention.
- Data provenance label: observed, user-stated, inferred, or synthetic.

An event-history table is preferable to storing only a current score, because it lets the demo explain why a recommendation appeared and what happened afterward. In the prototype, fictional account state and events live in `data/demo-accounts.json`; human-authored NBA rules and conversion associations live in `data/nba-rules.json`. Each rule separates observed behavior, input fields, bottleneck hypothesis, next best action, success event, and guardrails. All sample data is synthetic and must be labeled. The proposed `0.5x` inactivity and `1.3x` industry-fit conversion relationships are illustrative, unvalidated hypotheses; they are displayed as context and do not rank actions.

## Demo narrative

1. Show a small cohort of fictional accounts across setup paths and post-deployment outcomes.
2. Select either an onboarding blocker or the AI SDR performance case, and inspect the matching signal and hypothesis.
3. Show the observed events separately from the bottleneck hypothesis.
4. Explain why one candidate action is recommended and why an upsell is not appropriate yet.
5. Offer “Talk now” or “Schedule a walkthrough.”
6. Demonstrate a PAL receiving the account context and guiding a short troubleshooting conversation, or show a clearly labeled simulated conversation if live Tavus credentials or deployment access are unavailable.
7. Record whether the user accepted, whether the issue was resolved, and whether the account reached the next milestone.
8. Close with the experiment needed to determine whether this NBA improves activation and D60 conversion.
9. Review the PAL A/B dashboard, including first-value outcomes, invitation acceptance, conversation duration, and abandonment. Treat all visible counts and rates as synthetic examples.

## Pilot design

Before a real pilot, validate the event definitions and account eligibility with the product or Growth data owner. Select one bottleneck and one intervention first. Compare eligible accounts receiving the intervention with an appropriate holdout or randomized comparison. Record action exposure, acceptance, completion, and subsequent milestone outcomes.

Report sample size, cohort dates, adoption path, missing data, and uncertainty. Separate descriptive association from causal impact. Do not report a lift until the experiment supports it.

## In scope

- Growth case narrative and lifecycle map.
- Explainable NBA decision logic and candidate action catalog.
- Local table using synthetic account and event data.
- Demo of a contextual, user-controlled PAL invitation and follow-up.
- Metrics, guardrails, and pilot measurement plan.

## Out of scope

- Integrating a production CRM or importing real customer data.
- Sending real push notifications, email, phone calls, or calendar invitations from the prototype.
- Claiming production Tavus analytics or customer behavior without access to an authorized dataset.
- Training or validating a predictive model on synthetic records.
- Automatically granting discounts or making financial commitments.
- Automatically granting trial minutes; any extension must follow the applicable trial policy and be confirmed before the demo records it as granted.
- Launching a promotion experiment or making a billing change from the prototype; offer terms, eligibility, randomization, and accounting require approval and a real implementation.
- Using inferred facial expression or voice emotion as a persistent customer score or sole basis for commercial treatment.
- Depending on Griffin being generally available.

## Definition of done

- A reviewer can understand the lifecycle, selected bottleneck, NBA rationale, proposed action, and outcome metric.
- The prototype distinguishes observed evidence from hypotheses and synthetic values.
- At least one end-to-end account scenario shows recommendation → invitation → PAL help or labeled simulation → recorded outcome.
- Free-to-paid is framed as a downstream outcome, while activation is measured as the leading outcome.
- The case includes a credible pilot plan and makes no unsupported claims of lift or model accuracy.
