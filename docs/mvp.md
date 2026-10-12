# Proposed MVP

## Objective

Demonstrate lead qualification through a Tavus conversation, with structured outcomes in a simple table and no external CRM integration.

## Confirmed decisions

- No external CRM integration.
- Initial demonstration data stored in a browser-local table.
- Code, UI, and project documentation in English.

## Open decisions

- Target segment and product offered by the SDR.
- Backend stack, hosting, and user identification.
- Qualification fields and qualified-lead criteria.
- Spoken PAL language for the demonstration.

## Proposed scope

- Lead list, detail view, and activity history.
- Start and end a Tavus conversation.
- PAL with discovery questions and approved product knowledge.
- Summary, needs, confirmed information, and next step.
- Synchronization states and failure recovery.

Automatic scheduling and external communications require a later scope decision.

## Acceptance criteria

- Tavus API key stays out of browser code and Git.
- The backend links each session to an authorized lead.
- Users can start and end a conversation.
- Missing data remains unknown.
- Outcomes attach to the correct lead; repeated events do not duplicate activities.
- Integration failures are visible and recoverable.
- The demonstration clearly identifies fictional data and simulated integrations.

## Planned validation

Check the local demonstration and session creation with test_mode first. A real conversation must validate PAL behavior, tools, and saved outcomes. Cover abandonment, persistence failures, and repeated events.

## Candidate metrics

Qualification completion, field completeness, successful outcome persistence, time to outcome, and cost per qualification. No results have been measured yet.
