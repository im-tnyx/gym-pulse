# GymPulse Documentation

This directory is the source of truth for GymPulse product and technical planning.

## Reading order

1. `00-product-blueprint.md`
2. `01-product-requirements.md`
3. `02-user-roles-permissions.md`
4. `03-user-flows.md`
5. `04-screen-specifications.md`
6. `05-system-architecture.md`
7. `06-database-schema.md`
8. `07-api-contracts.md`
9. `08-automations.md`
10. `09-payments-billing.md`
11. `10-notifications-whatsapp.md`
12. `11-analytics-kpis.md`
13. `12-security-audit.md`
14. `13-testing-qa.md`
15. `14-roadmap.md`
16. `15-engineering-workflow.md`
17. `16-open-decisions.md`

## Documentation rules

- Product behavior must be defined before implementation-specific shortcuts are accepted.
- Tenant isolation, payment integrity, attendance integrity, and auditability are cross-cutting requirements.
- Any implementation decision that changes product behavior should update the relevant document in the same pull request.
- Open decisions must be recorded in `16-open-decisions.md` instead of silently assumed.
- Phase 1 scope must remain focused on attendance, retention, renewal, payments, basic add-ons, owner operations, and auditability.
- Future features should not be implemented merely because the schema can support them.

## Source boundary

The initial workflow is based on the uploaded Gym App Blueprint by Roy Digital App Studio. Sections marked as GymPulse extensions represent product architecture added for the standalone SaaS direction.
