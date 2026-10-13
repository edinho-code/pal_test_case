# MVP Summary

This MVP demonstrates a lifecycle-based Next Best Action (NBA) strategy for Tavus adoption. It uses fictional account and event records to show how product behavior can inform a bottleneck hypothesis, an explainable action, optional PAL assistance, and a measurable outcome.

The prototype loads account data from `data/demo-accounts.json` and its human-authored decision policy from `data/nba-rules.json`. Before starting PAL, the demo asks for a participant name and explicit synthetic account selection; that selection determines the matched NBA case and context. Conversion relationships are clearly labeled illustrative hypotheses and do not rank actions. An optional local Node backend can create a Tavus conversation using the selected synthetic account, participant name, matched NBA rule, and server-side business context in API test mode or live mode. The browser records simulated interaction outcomes and user-stated helpfulness in a local, exportable log; it does not receive Tavus end/abandon callbacks, integrate an external CRM, send notifications, use a trained model, or measure conversion impact.

See [the case scope](project-scope.md), [the NBA data model](nba-data-model.md), and [the beta runbook](beta-runbook.md) for definitions, assumptions, and pilot guidance.
