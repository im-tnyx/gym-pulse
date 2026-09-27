# Task 0029: Draft Object Storage ADR

## Goal

Draft one `Proposed` ADR for `D-ARCH-010` by first deciding whether confirmed Phase 1 scope actually requires persistent binary/object storage, then defining the conditional protected-file architecture without provisioning storage, creating credentials, installing SDKs, or changing canonical status to `DECIDED`.

Target:

`docs/adr/ADR-0021-object-storage.md`

## Inputs Read

Fresh latest-`main` repository/governance inputs included:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0027-draft-package-manager-adr.md`
- `.ai/task/0028-draft-observability-provider-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/user-journeys.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0006-managed-backend-responsibilities.md`
- `docs/adr/ADR-0009-authorization-implementation.md`
- `docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md`
- `docs/adr/ADR-0011-api-contract-architecture.md`
- `docs/adr/ADR-0013-member-client-strategy.md`
- `docs/adr/ADR-0014-api-deployment-boundary.md`
- `docs/adr/ADR-0015-background-jobs-scheduler.md`
- `docs/adr/ADR-0016-hosting-deployment-platform.md`
- `docs/adr/ADR-0017-ci-cd-release-secrets.md`
- `docs/adr/ADR-0018-testing-toolchain.md`
- `docs/adr/ADR-0020-observability-provider.md`

Structured `docs/09-security/`, `docs/10-infrastructure/`, `docs/11-observability/`, and `docs/14-operations/` entry files were checked and are not present.

Legacy evidence inputs:

- `docs/05-system-architecture.md`
- `docs/12-security-audit.md`
- `docs/13-testing-qa.md`
- `docs/16-open-decisions.md`

Canonical structured docs take precedence.

## Repository State Verified

At task start:

- latest `main` was `80443e0c5fae95da1abfa5eac02d8f647bb3d494`;
- Task 0028 / ADR-0020 were complete at documentation level;
- `docs/adr/ADR-0021-object-storage.md` did not exist;
- `.ai/task/0029-draft-object-storage-adr.md` did not exist;
- ADR index order 21 remained `D-ARCH-010 Object storage OPEN`;
- canonical `D-ARCH-010` remained `P1 OPEN`;
- no ADR was `Accepted`;
- no object-storage provider was accepted;
- repository search found no S3/R2/GCS/Supabase Storage credentials or storage SDK implementation evidence;
- no newer canonical requirement mandated persisted binary files.

Task 0029 was the actual next bounded governance task.

## Canonical Decision State

```text
D-ARCH-010
Priority: P1
Status: OPEN
Decision: Object storage provider and protected-access model
Acceptance: none
```

`ADR-0021 = Proposed`.

Creating it does not promote `D-ARCH-010` to `DECIDED`.

## Confirmed Phase 1 File Requirements

Current evidence:

```text
stable receipt business record                  confirmed/conditional
persisted receipt PDF                           not required
controlled member import                        confirmed
raw import-file long-term retention             not required
protected data export capability                anticipated/possible
long-lived persisted export artifact            not required
general member/staff file uploads               not required
profile/media/document upload platform          future/not required
```

## Receipt Requirement Findings

`FR-RECEIPT-001` requires a stable receipt record where policy requires it.

`FR-RECEIPT-002` requires canonical payment success before a confirmed-paid receipt.

Neither requirement mandates a persisted PDF.

Current default:

```text
canonical receipt/payment data
-> generate authorized representation on demand
-> stream/download
```

If a PDF is later stored, it remains a derived/regenerable artifact and never the sole receipt/payment truth.

Historical receipt regeneration depends on canonical historical legal/business values rather than mutable current gym settings.

## Export Requirement Findings

`export.create` exists as a named capability.

`NFR-PRIVACY-003` requires export authorization scope and recommends auditability.

No current requirement mandates long-lived object storage for exports.

Preference order:

```text
direct stream
-> on-demand generation
-> short-lived private artifact if async/bounded workflow requires it
-> long-term persistence only with explicit evidence
```

## Import / Upload Findings

`FR-IMPORT-001..002` confirm controlled member import.

They do not require retaining the raw source file indefinitely.

Current posture:

```text
receive bounded untrusted source
-> validate / parse
-> preview
-> authorize confirm
-> reconcile
-> retain required canonical/audit metadata
-> remove temporary raw source according to policy
```

No general-purpose user upload architecture is justified.

## Storage Need Decision

Outcome category:

```text
A. Phase 1 does not currently justify persistent object storage;
   defer provider and preserve conditional protected-storage architecture.
```

This is the core Task 0029 finding.

## Options Evaluated

1. no baseline persistent object storage;
2. private managed S3-compatible storage;
3. integrated managed platform storage;
4. cloud-native regional object storage;
5. hosting-local filesystem.

No provider is accepted.

## Provider Candidates Researched

Conditional future candidates researched:

- AWS S3;
- Cloudflare R2;
- Google Cloud Storage;
- Supabase Storage.

Provider comparison is evidence for future readiness, not a reason to provision storage now.

## Official Research Date

`2026-09-27`.

First-party documentation only was used for material provider claims.

## Region / Residency Findings

Current technical evidence:

- AWS S3: Mumbai and Hyderabad endpoints;
- Google Cloud Storage: Mumbai and Delhi locations;
- Supabase: Mumbai specific project region;
- Cloudflare R2: APAC best-effort location hint; current guaranteed jurisdictions are US/EU/FedRAMP rather than India.

`D-SEC-001 = P0 OPEN`.

No production provider/region is approved.

## Access Model Evaluation

If storage is later introduced:

```text
private by default
+
server-side application authorization
+
canonical object ownership
+
bounded signed/presigned access
```

Signed URL is a temporary bearer capability, not an authorization decision.

## Canonical Metadata Boundary

Canonical GymPulse persistence should own:

- internal artifact/object ID;
- tenant/resource ownership;
- artifact type;
- provider-neutral storage reference;
- content type/size/checksum;
- lifecycle/finalization state.

No schema is created.

## Object Key Posture

Use opaque/random non-PII keys.

Do not embed unnecessary Member name, phone, email, payment data, medical detail, or private notes.

Key/prefix does not establish authorization.

## Upload Posture

No arbitrary upload baseline.

If future upload is approved, compare server-proxied versus direct signed upload.

Signed upload issuance is not artifact finalization.

Validate expected object, size/type/checksum/ownership before use.

Malware scanning becomes a serious candidate only when arbitrary untrusted uploads are actually approved.

## Download / Signed URL Posture

```text
authenticate
-> authorize resource/scope
-> resolve canonical artifact
-> issue short-lived narrow access
```

Do not store temporary signed URLs as canonical references.

Do not log them.

Exact TTL remains policy/implementation-specific.

## Tenant Isolation Posture

```text
Principal
+
capability/member-self
+
trusted tenant/resource relationship
-> protected object access
```

Provider IAM/RLS/bucket policy is defense in depth.

`Storage Policy != Complete Authorization System`.

## Receipt Artifact Posture

Receipt business truth stays in canonical data.

Persisted PDF is not currently required.

If later stored:

- generated after canonical payment success;
- preferably immutable/regenerable;
- failure does not revert payment;
- retries do not duplicate financial effects;
- historical data supports faithful regeneration.

## Export Artifact Posture

Prefer direct/on-demand generation.

If async persistence later becomes necessary:

- explicit `export.create`;
- scoped query;
- audit;
- private bounded artifact;
- re-authorization before access issuance;
- explicit deletion/lifecycle.

## Retention / Deletion Posture

`D-SEC-005`, `D-SEC-006`, and `NFR-PRIVACY-005` remain unresolved.

Retention is artifact-class specific.

Storage lifecycle implements approved policy; it does not define business/legal policy.

## Encryption / Credential Posture

Future protected storage:

- HTTPS;
- provider encryption at rest;
- server-only least-privilege credentials;
- environment separation;
- rotation;
- federated/short-lived workload identity where supported;
- no long-lived admin/write key in clients.

No custom application encryption/KMS requirement without evidence.

## Reliability / Reconciliation Findings

DB and object-store writes are not one ACID transaction.

Use intent/finalize or post-commit durable generation patterns.

Reconcile:

- orphan object;
- missing object;
- incomplete upload;
- finalization failure;
- deletion failure;
- duplicate generation.

Object-store outage must not change canonical payment/membership truth.

## Performance / Cost Findings

Future comparison must include storage, requests, egress, retrieval, versioning/replication, direct transfer versus proxy bandwidth, and cross-region latency.

Do not select by headline GB price alone.

Deferral currently has the lowest operational/security cost.

## Security Findings

Primary future threats include public bucket configuration, cross-tenant access, object-key enumeration, signed-URL leakage, client credential exposure, MIME/filename/size abuse, orphan/missing objects, preview-to-production access, malicious deletion, lifecycle drift, account compromise, and egress/storage abuse.

Current deferral removes most of this attack surface.

## Privacy Findings

Data minimization favors not persisting binary duplicates without a requirement.

Object keys must avoid unnecessary PII.

Exports are high-sensitivity aggregates and require narrow scope/audit.

Raw import sources should not be retained indefinitely without purpose.

Region, retention, deletion, operational access and provider subprocessors remain future review surfaces.

## Provider Exit Findings

Future design should preserve:

- provider-neutral internal object identity;
- canonical ownership metadata;
- object inventory;
- checksums;
- bulk byte export;
- reference migration mapping;
- narrow storage port.

S3 compatibility helps transfer/tooling but does not make IAM, lifecycle, signed URL, event, or region behavior portable.

## Evaluation Summary

Current evidence strongly favors:

```text
no persistent object store now
+
on-demand receipt/export representation where sufficient
+
temporary bounded import processing
+
future private ProtectedObjectStore only on a confirmed need trigger
```

## Proposed Direction

```text
D-ARCH-010 stays OPEN

No provider selected

No baseline bucket/storage infrastructure

If future need is confirmed:
  private managed object storage
  + canonical provider-neutral metadata
  + server authorization
  + short-lived signed access
  + opaque keys
  + explicit lifecycle
  + D-SEC-001 region gate
  + provider-exit validation
```

## Decisions Kept Separate

```text
D-ARCH-014 managed backend
D-ARCH-009 hosting
D-ARCH-006 API deployment
D-ARCH-007 background jobs
D-ARCH-019 CI/CD / secrets
D-ARCH-018 testing
D-ARCH-003 API contract
D-ARCH-015 authorization
D-ARCH-004 authentication/session
D-SEC-001 jurisdiction/privacy
D-SEC-005 deletion/export workflow
D-SEC-006 retention
D-SEC-008 data-layer isolation
D-PROVIDER-001 payment
D-PROVIDER-006 observability
```

No decision above is accepted by Task 0029.

## Requirement IDs Referenced

```text
FR-IMPORT-001
FR-IMPORT-002
FR-RECEIPT-001
FR-RECEIPT-002
FR-PAYMENT-006
FR-PAYMENT-007
FR-AUDIT-001
FR-AUDIT-002
FR-AUDIT-003
FR-CROSS-003

NFR-SECURITY-001
NFR-SECURITY-002
NFR-SECURITY-003
NFR-SECURITY-004
NFR-SECURITY-005
NFR-SECURITY-006
NFR-SECURITY-009
NFR-SECURITY-011

NFR-PRIVACY-001
NFR-PRIVACY-003
NFR-PRIVACY-005
NFR-PRIVACY-006

NFR-DATA-004
NFR-AVAILABILITY-004
NFR-OPERATIONS-001
NFR-OPERATIONS-002
```

`NFR-AVAILABILITY-004` is correctly treated as a database backup/restore requirement, not a direct object-storage backup mandate.

## Validation Required

While storage is deferred, later acceptance should first prove confirmed Phase 1 receipt/export/import workflows are safe without persistent object storage.

If storage is introduced, require private-access, tenant-negative, signed-access, secret-isolation, upload validation, checksum, receipt/payment boundary, export authorization, reconciliation, retention, residency, migration, recovery, and cost evidence described in ADR-0021.

No validation implementation is created now.

## Files Changed

Created:

- `docs/adr/ADR-0021-object-storage.md`
- `.ai/task/0029-draft-object-storage-adr.md`

Governance continuity updates:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No canonical requirement file required correction.

## Open Questions

Key unresolved items:

- pilot receipt/invoice representation requirement;
- whether any receipt PDF must be persisted;
- export size/workflow and persistence need;
- raw import source retention;
- historical receipt fields;
- `D-SEC-001` residency outcome;
- `D-SEC-005/006` deletion/retention policy;
- future regenerable versus irreplaceable artifact classes;
- provider choice if a persisted-artifact trigger occurs.

## Result

Expected synchronized state:

```text
ADR-0021 = Proposed
D-ARCH-010 = P1 OPEN
Persistent object storage = deferred
No provider selected
Receipt PDF persistence = not required by current evidence
Exports = authorize/stream/on-demand by default
Controlled import = no indefinite raw-file retention requirement
Future storage = private/provider-neutral/authorization-gated
```

Implementation status:

```text
No bucket created
No storage provider account configured
No credential created
No SDK installed
No file uploaded
No upload/download route created
No receipt PDF generated
No export job implemented
No lifecycle rule configured
No replication/CDN config
No database schema/migration
No CI workflow
No prior ADR accepted
```

## Next Recommended Task

After Task 0029 synchronization, fresh-read the ADR index and canonical register.

Current ordered queue indicates the next bounded decision is expected to be:

```text
Task 0030: Draft Payment Provider ADR
Primary decision: D-PROVIDER-001
Canonical status: P1 OPEN
```

The ADR filename/number must be confirmed from the synchronized repository before execution.

Do not execute Task 0030 as part of Task 0029.
