# ADR-0021: Object Storage and Protected File Access

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0021`
- Primary Decision ID: `D-ARCH-010`
- Related Decision IDs: `D-ARCH-014`, `D-ARCH-009`, `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-019`, `D-ARCH-018`, `D-ARCH-003`, `D-ARCH-015`, `D-ARCH-004`, `D-SEC-001`, `D-SEC-005`, `D-SEC-006`, `D-SEC-008`, `D-PROVIDER-001`, `D-PROVIDER-006`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Backend / Security / Data / Platform`
- Date Proposed: `2026-09-27`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse has a conditional architecture boundary for protected object storage, but current Phase 1 requirements do not automatically imply a persistent-file subsystem.

The first decision is therefore not:

> Which object-storage provider should GymPulse use?

It is:

> Does confirmed Phase 1 scope require persisted binary/file objects outside canonical relational persistence?

Current structured architecture explicitly says object storage must remain conditional until receipt/export/file requirements justify it.

The governing distinction is:

```text
confirmed business/file requirement
!=
possible future convenience

Object Storage
!=
Canonical Business Database
```

This ADR evaluates whether persistent object storage is justified now, defines the protected-file architecture that must apply if it becomes justified, and records current provider evidence without accepting or provisioning a provider.

It creates no bucket, credential, upload/download route, SDK, receipt PDF, export job, storage lifecycle, or infrastructure.

Canonical `D-ARCH-010` remains `P1 OPEN`.

## 2. Confirmed Phase 1 Artifact Requirements

Current canonical requirements support the following classification.

| Artifact/workflow | Current classification | Persistent object required? | Evidence/interpretation |
|---|---|---|---|
| Stable receipt business record | Confirmed/conditional Phase 1 | No | `FR-RECEIPT-001` requires a stable receipt record where policy requires it. |
| Confirmed-paid receipt truth | Confirmed Phase 1 invariant | No | `FR-RECEIPT-002` prohibits confirmed-paid receipt issuance before canonical payment success. |
| Persisted receipt PDF | Not currently required | No | No canonical requirement says a PDF must be generated once and stored. |
| Downloadable receipt representation | Possible Phase 1 | No baseline persistence | Can be generated from canonical receipt/payment data on demand if product/legal policy requires a downloadable representation. |
| Data export capability | Possible/anticipated Phase 1 | No baseline persistence | `export.create` exists as a named capability and `NFR-PRIVACY-003` constrains exports, but no requirement mandates a long-lived stored export file. |
| Controlled member import | Confirmed Phase 1 | No | `FR-IMPORT-001..002` require controlled import/validation/reconciliation, not indefinite storage of the uploaded source. |
| Temporary import upload | Possible implementation detail | No baseline persistence | A source file may be streamed or held temporarily for parsing; retention is not required by the business requirement. |
| Generated report file | Not currently required | No | Current dashboards/read models do not require persisted binary reports. |
| Member/staff arbitrary upload | Not currently required | No | Phase 1 has no approved general upload requirement. |
| Profile image/avatar/gym logo | Future / not currently required | No | No current canonical Phase 1 requirement. |
| Trainer/workout/nutrition media | Future | No | These domains remain outside current active Phase 1 scope. |
| Medical/health documents | Future / explicitly sensitive | No | No current requirement and no approved health-data storage policy. |

Conclusion:

```text
Phase 1 currently requires
structured canonical records + controlled import/export behavior

but does not currently require
persistent binary object storage as a baseline infrastructure dependency.
```

## 3. Requirements and Decision Drivers

Primary functional evidence:

- `FR-IMPORT-001`: controlled member import with validation, duplicate detection, preview/error reporting, source-row traceability, and reconciliation count.
- `FR-IMPORT-002`: imports must not fabricate missing material business facts.
- `FR-RECEIPT-001`: successful payable transactions should produce a stable receipt record where business/jurisdiction policy requires it.
- `FR-RECEIPT-002`: a receipt must not be issued as confirmed paid before canonical payment success.
- `FR-PAYMENT-006..007`: verified payment business effects happen exactly once.
- `FR-AUDIT-001..003`: sensitive actions require attributable, reconstructable audit records.
- `FR-CROSS-003`: tenant/gym/branch context must be explicit where relevant.

Security/privacy/data drivers:

- `NFR-SECURITY-001`: tenant isolation includes storage access and exports.
- `NFR-SECURITY-002`: least privilege.
- `NFR-SECURITY-003`: server-side authorization.
- `NFR-SECURITY-004`: storage/provider credentials are server secrets.
- `NFR-SECURITY-005`: protected production traffic uses secure transport.
- `NFR-SECURITY-006`: protected object storage should use platform encryption at rest if introduced.
- `NFR-SECURITY-009`: sensitive actions are attributable.
- `NFR-SECURITY-011`: errors/logs avoid secret/cross-tenant/private data leakage.
- `NFR-PRIVACY-001`: data minimization.
- `NFR-PRIVACY-003`: exports enforce authorization scope and should be auditable.
- `NFR-PRIVACY-005`: exact retention/deletion periods remain open.
- `NFR-PRIVACY-006`: future export/correction/deletion support must not corrupt required history.
- `NFR-DATA-004`: financial and other defined history remains reconstructable after later edits.

Operations/availability drivers:

- `NFR-AVAILABILITY-004` currently requires automated **database** backup and documented/tested restore; it is not direct proof that object-storage backup is required.
- `NFR-OPERATIONS-001`: environments are separated.
- `NFR-OPERATIONS-002`: production credentials are not casually reused outside production.
- `NFR-MAINTAINABILITY-003` and `ARCH-PRIN-012`: provider-specific details stay behind internal boundaries.
- `NFR-TESTABILITY-004`: authorization boundaries require positive/negative evidence.

Decision drivers:

1. avoid premature infrastructure;
2. keep canonical business truth in GymPulse persistence;
3. minimize the security/privacy surface;
4. preserve authorization and tenant isolation for protected files;
5. preserve historical receipt integrity;
6. support safe imports/exports without assuming long-lived artifact persistence;
7. support private, bounded delegated access if storage is later introduced;
8. maintain region/residency optionality while `D-SEC-001` is open;
9. preserve provider exit/migration capability;
10. isolate storage outages from payment/membership/attendance truth.

## 4. Constraints and Assumptions

1. `D-ARCH-010` remains `P1 OPEN`.
2. `ADR-0021` is `Proposed`, not `Accepted`.
3. `D-SEC-001` remains `P0 OPEN`; no production storage provider/region is approved.
4. `D-SEC-005` remains open for deletion/export workflow and authority.
5. `D-SEC-006` remains open for retention periods.
6. `D-ARCH-014` remains open; storage does not select a managed backend.
7. `D-ARCH-009` remains open; storage does not select hosting.
8. `D-ARCH-006` and `D-ARCH-007` remain open.
9. `D-ARCH-019` remains open; credentials/deployment automation are separately governed.
10. `D-ARCH-015` remains proposed; protected object access follows the same application authorization semantics.
11. `D-SEC-008` remains separately governed; provider storage policies do not replace application authorization.
12. No exact retention duration, object size limit, signed-URL TTL, bucket layout, provider region, encryption key model, or CDN policy is selected.
13. Application-local filesystem is ephemeral/non-shared and is not canonical protected-object storage.
14. No current Phase 1 requirement establishes a general arbitrary user-upload subsystem.
15. Storage provider features do not become domain contracts.
16. Object-store operations and canonical database transactions are separate systems and are not assumed to be atomically committed together.

## 5. Canonical Data vs Derived Object Boundary

The core invariant is:

```text
Object Storage != Canonical Business Database
```

Object bytes must never become the sole authority for:

- payment success;
- receipt existence/truth;
- membership entitlement;
- attendance;
- renewal;
- authorization;
- audit truth.

Canonical persistence owns business metadata and history.

A file, if one exists, is an artifact of canonical state.

Conceptually:

```text
Payment / Receipt Record
= canonical truth

Generated PDF
= derived presentation artifact
```

A missing or corrupted PDF must not erase a valid payment.

Where an artifact is regenerable, historical canonical data must include the values needed to reproduce the historical representation correctly. For a legal/financial receipt this may include historical business name/address/tax fields, receipt number, amount, currency, payment method, and transaction time. This ADR does not finalize that schema.

## 6. Options Considered

### Option A — No Baseline Persistent Object Storage

```text
canonical structured data
+
on-demand generation / direct streaming
+
bounded temporary processing where needed
```

Use when Phase 1 does not require long-lived binary artifacts.

Benefits:

- smallest security surface;
- no bucket/credential lifecycle;
- no separate object retention/deletion system;
- no artifact backup/recovery obligation;
- no provider/region lock-in;
- simple failure model.

Tradeoffs:

- repeated receipt rendering if downloadable representations are needed;
- large exports may need asynchronous generation or bounded streaming;
- temporary import/export handling still needs validation and resource limits.

### Option B — Private Managed S3-Compatible Storage

```text
GymPulse ProtectedObjectStore
-> private managed S3-compatible object storage
```

If storage later becomes justified:

- private-by-default objects;
- canonical provider-neutral metadata;
- server-authorized access;
- short-lived signed/presigned operations where appropriate;
- opaque keys;
- explicit lifecycle;
- S3-compatible transfer where it materially improves portability.

### Option C — Integrated Managed Platform Storage

Representative candidate: Supabase Storage, only if independently justified.

Potential benefits:

- private buckets;
- signed access;
- RLS integration;
- project/region alignment;
- S3-compatible interface.

Risks:

- platform coupling;
- storage policy semantics tied to provider behavior;
- service/S3 credentials can bypass RLS;
- current S3 compatibility does not include object versioning;
- `D-ARCH-014` remains independently governed.

### Option D — Cloud-Native Regional Object Store

Representative examples: AWS S3 or Google Cloud Storage.

Potential benefits:

- mature regional location choices;
- IAM/workload identity options;
- signed access;
- encryption, versioning/lifecycle and integrity tooling;
- strong bulk migration ecosystems.

Tradeoffs:

- cloud-specific IAM/policy/event semantics;
- egress/request pricing;
- another provider surface if compute lives elsewhere.

### Option E — Hosting-Local Filesystem

Not acceptable as canonical protected-file storage.

ADR-0016 already requires application-local disk to be treated as ephemeral, non-shared, and replaceable.

It may be used only as bounded transient working space where the final runtime safely supports it.

## 7. Evaluation

| Criterion | No Persistent Storage | Private S3-Compatible | Integrated Platform Storage | Cloud-Native Regional Store | Local Filesystem |
|---|---|---|---|---|---|
| Actual Phase 1 requirement fit | **Strongest current fit** | Conditional | Conditional | Conditional | Weak |
| Security surface | Lowest | Medium | Medium | Medium | High/unsafe as canonical |
| Tenant isolation | Application/data scope only | App + object metadata + provider controls | App + provider/RLS controls | App + IAM/policy controls | Instance-local only |
| Authorization control | Server/application | Server + bounded signed access | Server/app + provider policy | Server/app + IAM/signed access | Ad hoc; poor multi-instance fit |
| Signed/private access | Not needed | Strong model | Strong model | Strong model | Not durable/distributed |
| Region/residency | No object-store decision | Provider dependent | Project/provider dependent | Strong regional choices | Hosting-dependent and ephemeral |
| Durability | Canonical DB only | Managed object durability | Managed object durability | Managed object durability | Insufficient |
| Backup/recovery posture | Regenerate/stream | Artifact-class specific | Artifact-class specific | Artifact-class specific | Poor |
| Cost | Lowest baseline | Storage/request/egress | Platform/storage pricing | Storage/request/egress | Hidden operational risk |
| Operational complexity | Lowest | Medium | Medium | Medium | High once scaled |
| Provider lock-in | None | Low-Medium with S3 compatibility | Medium | Medium | Hosting-coupled |
| Migration/export | Not applicable | Usually strong | S3 transfer possible, provider semantics remain | Strong tooling | Weak |
| Hosting independence | Highest | High | Medium | High | Low |
| Developer complexity | Low | Medium | Medium | Medium | deceptively low |
| Receipt regeneration | Native direction | Can store derived artifact | Can store derived artifact | Can store derived artifact | Unsafe |
| Export handling | Stream/on-demand | Short-lived/persisted supported | Supported | Supported | Unsafe |
| Future upload support | Deferred | Strong | Strong | Strong | Weak |
| Reversibility | Highest | High | Medium-High | High | Low |
| Overall GymPulse fit now | **Strong** | Future conditional fit | Future conditional fit | Future conditional fit | Reject as canonical |

The matrix intentionally does not reward provisioning storage merely because provider capabilities exist.

## 8. Proposed Decision

Choose outcome category **A**:

```text
Phase 1 does not currently justify persistent object storage as a baseline dependency.
```

Proposed direction:

```text
no general-purpose object-storage infrastructure now

+
canonical receipt/payment/export/import metadata
remain in GymPulse persistence

+
generate/stream receipt or export representations on demand
where that safely satisfies the confirmed workflow

+
controlled import may process untrusted source files
without indefinite raw-file retention

+
if persistent artifacts become justified later:
  private managed object storage
  + provider-neutral ProtectedObjectStore boundary
  + canonical ownership metadata
  + opaque non-PII object keys
  + server-authorized short-lived signed access
  + explicit retention/deletion policy
  + region/privacy gate
  + provider-exit validation
```

`D-ARCH-010` remains `P1 OPEN`.

No AWS S3, Cloudflare R2, Google Cloud Storage, Supabase Storage, or other provider is selected.

## 9. Provider and Portability Model

Provider selection is deferred.

Current official research was still reviewed so a future storage decision is not built on stale assumptions.

| Concern | AWS S3 | Cloudflare R2 | Google Cloud Storage | Supabase Storage |
|---|---|---|---|---|
| Private/protected access | Private by default + Block Public Access controls | Private S3/Workers access; public exposure is optional | IAM-based private access | Private buckets by default; RLS-based access |
| Signed/presigned access | Yes | Yes; presigned URL is a bearer capability | Yes; signed URL is a bearer capability | Yes; signed download/upload flows |
| S3 API compatibility | Native reference | Broad S3 compatibility with documented gaps | XML API has S3-style signing concepts; not S3-equivalent business semantics | S3-compatible endpoint with documented limitations |
| India-region evidence | Mumbai and Hyderabad S3 endpoints | APAC location hint only; current guaranteed jurisdictions are US/EU/FedRAMP, not India | Mumbai and Delhi bucket regions | Mumbai project region available |
| Encryption at rest | Default SSE-S3 for new uploads | Automatic at-rest encryption | Default server-side encryption | Managed platform storage; exact selected model requires validation |
| Object versioning | Supported | Do not assume AWS-equivalent versioning; validate current provider semantics | Supported | S3 object versioning not supported |
| Lifecycle | Supported | Supported | Supported | Provider-specific; validate before depending on it |
| Checksums/integrity | Mature S3 integrity features | S3 checksum support varies by algorithm/API | CRC32C/MD5 integrity support | Validate exact storage/S3 checksum behavior |
| Multipart/resumable | Multipart supported | Multipart S3 operations supported | Multipart/resumable supported | Standard, resumable and S3 uploads |
| Provider exit | Mature listing/export/tooling | S3-compatible byte transfer helps | Storage Transfer/bulk tools | S3-compatible byte transfer helps |
| Lock-in areas | IAM/policy/events/lifecycle | location/policy/Workers behavior | IAM/policy/event/lifecycle semantics | RLS/project/storage policy semantics |

Portability invariant:

```text
S3 API compatibility
can improve byte/tool portability

but does not make
IAM
bucket policy
signed URL semantics
lifecycle
events
region model
fully portable.
```

Canonical business metadata must therefore store provider-neutral internal object identity/ownership rather than a public provider URL.

## 10. Object Metadata and Ownership Model

If storage is later introduced, canonical GymPulse persistence should own conceptual metadata such as:

```text
internal object/artifact ID
tenant/gym ownership
artifact type
related business resource
provider-neutral storage reference
content type
size
checksum/integrity metadata
created timestamp
retention/deletion state
generation/finalization state
```

No schema is created by this ADR.

Ownership must be explicit in canonical metadata. Do not discover tenant ownership by parsing an object key.

Provider metadata is infrastructure metadata, not the domain model.

## 11. Upload Model

No general Phase 1 arbitrary upload system is approved.

Controlled member import is the only current file-like input requirement.

Preferred current posture:

```text
receive bounded import
-> validate transport/size/type
-> parse as untrusted input
-> validate rows
-> preview conflicts/errors
-> authorize confirmation
-> controlled write/reconciliation
-> retain only required canonical/audit/import metadata
-> discard raw temporary source according to approved policy
```

If future persistent uploads become required, compare:

### Server-proxied upload

```text
Client
-> GymPulse Runtime
-> Object Store
```

Good for central validation; consumes application bandwidth/runtime.

### Direct signed upload

```text
Client
-> request upload authorization
-> trusted GymPulse authorization
-> bounded signed operation
-> direct object upload
-> trusted finalization/verification
```

Good for offloading large transfer; adds incomplete-upload/orphan/content-validation concerns.

Upload authorization is not completion:

```text
signed upload issued
!=
valid business artifact finalized
```

No model is implemented now.

## 12. Download / Signed Access Model

If persistent protected artifacts are later introduced:

```text
Principal
-> authenticate
-> authorize current capability/member-self + scope + resource
-> resolve canonical object ownership
-> issue controlled short-lived access
```

Invariant:

```text
Signed URL != Authorization Decision
```

A signed URL is a temporary bearer capability. Anyone possessing a still-valid URL may be able to exercise the signed operation.

Controls:

- authorize before issuance;
- narrow to one object/operation;
- short lifetime according to later policy;
- HTTPS only;
- never log the full signed URL;
- no permanent signed/public URL stored as canonical reference;
- reassess current authorization when issuing new download access.

Exact TTL is deliberately not selected.

## 13. Authorization and Tenant Isolation

Protected object access uses ADR-0009 semantics:

```text
Principal
+
current account eligibility
+
named capability or Member-self relationship
+
trusted tenant/resource scope
+
trusted resource ownership
-> allow / deny
```

For receipts, a relevant receipt/payment read capability or Member-self policy plus resource ownership applies.

For exports:

```text
export.create
+
trusted tenant/resource scope
+
explicit export query
+
audit where required
```

A storage prefix is not authorization:

```text
tenant-a/file.pdf
!=
tenant authorization
```

Provider IAM/bucket/RLS policies may add defense in depth but do not replace application authorization.

```text
Storage Policy != Complete Authorization System
```

## 14. Receipt Artifact Model

Current canonical requirements establish receipt business truth, not a stored PDF mandate.

Preferred default:

```text
canonical Payment/Receipt data
-> authorized request
-> generate representation on demand
-> stream/download
```

Only introduce persisted receipt binaries if later product/legal/operational evidence requires them.

If persisted:

```text
Receipt/Payment canonical state
-> durable continuation where needed
-> generate immutable/regenerable artifact
-> store private object
-> finalize canonical artifact metadata
```

Rules:

- confirmed-paid artifact only after canonical payment success;
- PDF failure does not revert a valid payment;
- retries do not repeat payment/membership/add-on business effects;
- receipt business number is not the storage key;
- historical values required for regeneration come from historical canonical state, not mutable current gym settings;
- object loss should not erase receipt/payment truth.

## 15. Export Artifact Model

`NFR-PRIVACY-003` requires export authorization scope and recommends auditability. It does not mandate long-lived object storage.

Evaluate workflows in increasing persistence order:

1. stream export directly;
2. generate on demand and stream;
3. generate a short-lived artifact for bounded download;
4. persist long term only with explicit business/legal evidence.

Current preference is the smallest safe model.

If an asynchronous export artifact later becomes necessary:

```text
authorize export.create + scope
-> audit request
-> generate from explicit scoped query
-> private short-lived artifact
-> authorize download access
-> bounded lifecycle delete
-> retain canonical audit of actor/scope/time
```

Permanent "whoever has the URL can download" access is not acceptable.

## 16. Retention, Deletion, and Lifecycle

`D-SEC-005`, `D-SEC-006`, and `NFR-PRIVACY-005` remain unresolved.

Therefore:

```text
retention must be explicit by artifact class
```

but this ADR does not invent durations.

Potential classes differ:

- generated export: likely bounded operational lifetime;
- generated receipt representation: depends on business/legal receipt policy and whether regeneration is sufficient;
- raw import source: minimize/short retention unless reconciliation requirements prove a need;
- future uploaded legal document: potentially irreplaceable and subject to separate policy.

Provider lifecycle rules must implement approved policy; they do not define policy.

Financial history is not hard-deleted merely for reporting cleanliness, but that does not prove every generated binary must be retained forever.

## 17. Region and Data-Residency Posture

`D-SEC-001 = P0 OPEN`.

Technical evidence currently shows:

- AWS S3 has India endpoints in Mumbai (`ap-south-1`) and Hyderabad (`ap-south-2`);
- Google Cloud Storage supports India bucket regions including Mumbai (`asia-south1`) and Delhi (`asia-south2`);
- Supabase currently offers a specific Mumbai project region (`ap-south-1`);
- Cloudflare R2 exposes an APAC location hint, but location hints are best effort, and current guaranteed jurisdictions are EU, US and FedRAMP rather than an India-specific jurisdiction.

This is technical availability evidence only.

```text
production provider + region
requires D-SEC-001 validation
```

No legal or compliance conclusion is made.

Cross-region replication must not be enabled by default because it can change residency/cost/legal-transfer implications.

## 18. Encryption and Credential Model

If protected storage is later introduced:

- HTTPS/TLS for protected object operations;
- provider/platform encryption at rest as baseline under `NFR-SECURITY-006`;
- customer-managed KMS keys only when a concrete compliance/threat requirement justifies operational complexity;
- no custom application-layer file encryption by default;
- storage administration/signing credentials remain server-only secrets;
- least privilege;
- separate environment credentials;
- rotation;
- federated/short-lived workload identity preferred where supported;
- no long-lived admin/write credentials in browser/mobile clients.

Direct client transfer, if used, receives only bounded delegated authorization.

## 19. Reliability, Recovery, and Reconciliation

Object store and relational DB cannot be treated as one ACID transaction.

Safe conceptual patterns include:

```text
DB intent/status
-> external object operation
-> DB finalize
```

or:

```text
canonical business commit
-> durable continuation
-> generate/store artifact
-> finalize canonical artifact metadata
```

No distributed 2PC is proposed.

Required future reconciliation states include:

- object exists but metadata finalization failed;
- metadata references missing object;
- duplicate generation race;
- deletion failed;
- upload timed out/incomplete;
- object checksum mismatch.

Recovery depends on artifact class:

```text
Regenerable
  receipt representation
  generated export

Irreplaceable
  future user-uploaded legal/private source material
```

Provider durability is not the same as backup/recovery from accidental deletion, bad lifecycle rules, malicious deletion, or provider exit.

## 20. Performance and Cost

Because storage is deferred, there is no current storage cost baseline.

Future evaluation must include:

- stored GB-month;
- PUT/GET requests;
- egress/download cost;
- storage class/retrieval charges;
- versioning overhead;
- replication;
- minimum-storage duration where applicable;
- application proxy bandwidth;
- direct signed transfer;
- large export generation;
- receipt regeneration compute;
- cross-region latency.

For small Phase 1 receipt/export volumes, operational/security simplicity can outweigh small theoretical storage-price differences.

CDN caching is not a baseline requirement for protected objects.

## 21. Security and Privacy Impact

### Security benefits of deferral

- no bucket/public-access misconfiguration risk today;
- no storage credentials;
- no permanent signed/public URLs;
- no new cross-tenant object path;
- no object lifecycle drift;
- reduced provider attack surface.

### Threat model if storage is later introduced

| Threat | Primary control |
|---|---|
| Public bucket misconfiguration | private-by-default + provider public-access controls + tests |
| Cross-tenant download | application authorization + canonical ownership + negative tests |
| Object-key enumeration | opaque keys; key never grants authority |
| Long-lived signed URL leak | short/narrow bearer access; do not log URL |
| Admin/service credential in client | server-only secrets; bundle/security tests |
| Path/key injection | application-generated opaque keys |
| Unsafe filename/header injection | sanitized response filename/headers |
| MIME spoofing | declared type + content validation where untrusted uploads exist |
| Oversized upload | per-operation size bounds |
| Malware | only introduce scanning when arbitrary untrusted upload risk exists |
| Tenant prefix treated as authority | explicit canonical ownership + application authorization |
| Stale access after revocation | authorize each issuance; bounded TTL |
| Preview reaches production | separate environments/credentials/buckets |
| Orphan object | reconciliation/cleanup |
| Missing object referenced by DB | reconciliation/regeneration |
| Manual provider mutation | restrict admin access; controlled operational paths |
| Malicious/accidental delete | artifact-class recovery/versioning/retention plan |
| Lifecycle misconfiguration | reviewed lifecycle policy + staging validation |
| Cross-region residency violation | `D-SEC-001` gate |
| Provider account compromise | least privilege, workload identity, provider account controls |
| Storage/egress abuse | rate/quota limits when user uploads/download scale requires them |

Object keys should avoid unnecessary names, phone/email, payment data, medical information, or private notes because keys can appear in provider logs/URLs.

## 22. Operations and Observability

If storage is introduced, safe provider-neutral operational events may include:

```text
operation category
artifact type
safe internal object ID
tenant context where operationally safe
latency
provider status/error category
retry/finalization state
```

Never log:

- full signed URL;
- access token;
- secret key;
- private file contents;
- sensitive user filename.

Object-store outage should degrade artifact generation/download, not fabricate or revert canonical business state.

```text
Object Store Outage
!=
Payment Failure

Object Store Outage
!=
Membership Reversal
```

## 23. Testing and Validation

Because storage is deferred, immediate acceptance evidence should prove confirmed Phase 1 workflows can work safely without persistent object storage.

If storage is later proposed, require at least:

1. anonymous protected-object read denied;
2. correct-tenant read allowed;
3. wrong-tenant read denied;
4. wrong Member-self denied;
5. object key alone grants no authority;
6. signed URL issued only after authorization;
7. signed URL expiry;
8. signed URL cannot access another object;
9. signed URL absent from logs;
10. storage credential absent from client bundle;
11. preview lacks production credential;
12. private bucket policy confirmed;
13. upload size/type restrictions;
14. filename sanitization;
15. incomplete direct upload not finalized;
16. orphan cleanup;
17. checksum/integrity verification;
18. receipt artifact only after canonical payment success;
19. storage failure does not revert payment;
20. receipt regeneration preserves historical truth;
21. `export.create` required;
22. export wrong-tenant denied;
23. export generation audited where required;
24. export artifact bounded lifecycle;
25. metadata/missing-object reconciliation;
26. idempotent generation/retry;
27. concurrent generation consistency;
28. provider timeout handling;
29. deletion failure handling;
30. environment isolation;
31. retention/lifecycle validation;
32. region/residency validation;
33. bulk export/provider migration;
34. checksum-preserving migration;
35. artifact-class recovery validation;
36. representative storage/request/egress cost.

No test is implemented by this ADR.

## 24. Migration and Adoption Plan

Current plan is **do not adopt object storage yet**.

Trigger-based future adoption:

1. confirm a real persisted artifact requirement;
2. define artifact class and canonical metadata;
3. resolve required retention/deletion policy;
4. validate `D-SEC-001` provider/region;
5. compare current serious providers;
6. create a non-production private bucket only after approval;
7. establish least-privilege workload identity/credentials;
8. implement the narrow `ProtectedObjectStore` boundary;
9. implement server-side authorization before access issuance;
10. validate upload/download limits and integrity;
11. validate object/DB reconciliation;
12. validate provider outage behavior;
13. validate bulk export/migration;
14. measure cost/egress;
15. explicitly approve production provider/region before production data.

No step is executed here.

## 25. Provider Exit and Reversibility

Future provider exit should preserve:

```text
canonical ownership metadata
provider-neutral internal object IDs
object inventory
checksums
artifact class
tenant/resource ownership
retention state
bulk byte transfer
old reference -> new provider reference mapping
access abstraction
```

Do not store a temporary signed/provider URL as the canonical business reference.

A future `ProtectedObjectStore` port should expose only GymPulse-required operations, for example conceptually:

- put/store object;
- get metadata;
- delete;
- create bounded upload authorization;
- create bounded download authorization.

It should not be a generic wrapper for every cloud SDK feature.

## 26. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Premature infrastructure | defer storage until persisted artifact requirement exists |
| Receipt PDF becomes business truth | canonical receipt/payment record remains authoritative |
| Historical receipt regeneration changes old facts | preserve historical business values in canonical data |
| Export leaks broad tenant data | explicit `export.create`, trusted scope, audit, field minimization |
| Raw import retained unnecessarily | process as untrusted temporary input; keep only required traceability/reconciliation metadata |
| Provider lock-in | provider-neutral metadata + narrow storage port + bulk export/checksum validation |
| Public access | private-by-default |
| Signed URL mistaken for authorization | authorize before issuance; treat URL as bounded bearer capability |
| Cross-tenant object leak | canonical ownership + application authorization + negative tests |
| DB/object split-brain | explicit intent/finalize state + reconciliation |
| Object outage corrupts payment | derived-artifact boundary; canonical state independent |
| Retention invented by infrastructure | `D-SEC-005/006` govern policy |
| Residency assumption | `D-SEC-001` validation before production provider/region |
| File malware/abuse architecture added too early | defer until arbitrary uploads are approved |
| Local disk used as durable storage | reject as canonical persistence |

## 27. Revisit Triggers

Revisit `D-ARCH-010` when any of the following becomes confirmed:

- business/legal policy requires persisted receipt PDFs;
- receipt representations must be immutable/downloadable independently of regeneration;
- exports must be generated asynchronously and downloaded later;
- export files must remain available for a bounded period;
- controlled import requires retained raw source for approved audit/reconciliation;
- member/staff documents/images become Phase 1 requirements;
- generated reports must be persisted;
- provider file callbacks or large-file workflows appear;
- a compliance/legal rule requires immutable stored artifacts;
- object storage becomes a prerequisite of an accepted managed-backend/hosting design for a confirmed requirement.

Provider selection must be re-researched at that time.

## 28. Open Questions

1. Which receipt/invoice fields and artifact form are required for the pilot jurisdiction/business?
2. Is a downloadable receipt representation required, or is an in-app/HTML receipt sufficient?
3. If downloadable, must it be persisted or can it be regenerated?
4. Which historical gym/tax/legal values must be frozen for receipt reconstruction?
5. Is bulk data export required during the pilot or only as an administrative/compliance capability?
6. Can export be streamed synchronously, or does expected size require asynchronous generation?
7. Does controlled member import require retention of the raw source file after reconciliation?
8. What exact retention/deletion rules will `D-SEC-005` and `D-SEC-006` establish?
9. What jurisdiction/residency constraints will `D-SEC-001` establish?
10. If persistent storage later becomes necessary, which provider/region best fits the accepted hosting/runtime and portability requirements?
11. Which artifact classes are regenerable versus irreplaceable?
12. What operational user is authorized to delete/recover protected artifacts?

## 29. Decision Evidence

Research date: `2026-09-27`.

### Repository evidence

- `docs/01-product/functional-requirements.md`: receipt record/truth and controlled import requirements.
- `docs/01-product/non-functional-requirements.md`: tenant isolation, secret protection, encryption, protected exports, retention, historical integrity, and database-specific backup requirement.
- `docs/01-product/user-roles.md`: `receipt.read`, `export.create`, scoped authorization and sensitive bulk-operation posture.
- `docs/01-product/user-journeys.md`: verified payment creates receipt after canonical success; pilot member import is validate/preview/confirm/reconcile.
- `docs/02-architecture/technology-stack.md`: protected object storage remains conditional; first confirm persisted receipt/export binaries.
- `ADR-0006`: storage is a separately governed commodity responsibility; canonical ownership/business metadata remains GymPulse-owned.
- `ADR-0009`: application authorization remains authoritative for exports/protected resources.
- `ADR-0011`: file upload/download/export transport need not be forced into JSON.
- `ADR-0016`: application-local filesystem is ephemeral/non-shared.
- `ADR-0017`: credentials follow environment/secret isolation.
- `ADR-0020`: observability must not log secrets/sensitive payloads.

### Current official provider research

#### AWS S3

- https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html
- https://docs.aws.amazon.com/general/latest/gr/s3.html

Verified evidence includes private/public-access controls, presigned access, default server-side encryption, versioning/lifecycle, and current Mumbai/Hyderabad S3 endpoints.

#### Cloudflare R2

- https://developers.cloudflare.com/r2/api/s3/api/
- https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- https://developers.cloudflare.com/r2/reference/data-location/
- https://developers.cloudflare.com/r2/reference/data-security/
- https://developers.cloudflare.com/r2/buckets/object-lifecycles/
- https://developers.cloudflare.com/r2/buckets/storage-classes/

Verified evidence includes S3-compatible APIs with documented gaps, bearer-style presigned URLs, encryption at rest, lifecycle rules, no Internet egress charge for current standard/infrequent-access classes, APAC best-effort location hints, and current guaranteed jurisdictions that do not include India.

#### Google Cloud Storage

- https://cloud.google.com/storage/docs/access-control/signed-urls
- https://cloud.google.com/storage/docs/access-control
- https://cloud.google.com/storage/docs/locations
- https://cloud.google.com/storage/docs/using-object-versioning
- https://cloud.google.com/storage/docs/lifecycle
- https://cloud.google.com/storage/docs/encryption/default-keys
- https://cloud.google.com/storage/docs/data-validation

Verified evidence includes IAM/signed URLs, Mumbai/Delhi locations, default encryption, object versioning/lifecycle, and checksum-based integrity validation.

#### Supabase Storage

- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/storage/s3/compatibility
- https://supabase.com/docs/guides/storage/s3/authentication
- https://supabase.com/docs/guides/platform/regions
- https://supabase.com/docs/guides/storage/uploads/file-limits

Verified evidence includes private buckets by default, RLS/signed access, server-side S3 credentials that bypass RLS, S3 compatibility, current Mumbai region availability, upload restrictions, and lack of S3 object-versioning support.

All provider capabilities, regions, limits, and prices are time-sensitive evidence only. No provider, region, plan, credential model, SDK version, retention setting, or bucket policy is accepted by this ADR.

## 30. Related Documents

- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-roles.md`
- `../01-product/user-journeys.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/system-context.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `README.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0009-authorization-implementation.md`
- `ADR-0010-data-layer-tenant-isolation-rls.md`
- `ADR-0011-api-contract-architecture.md`
- `ADR-0013-member-client-strategy.md`
- `ADR-0014-api-deployment-boundary.md`
- `ADR-0015-background-jobs-scheduler.md`
- `ADR-0016-hosting-deployment-platform.md`
- `ADR-0017-ci-cd-release-secrets.md`
- `ADR-0018-testing-toolchain.md`
- `ADR-0020-observability-provider.md`
- legacy migration source: `../05-system-architecture.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../13-testing-qa.md`
- legacy migration source: `../16-open-decisions.md`
