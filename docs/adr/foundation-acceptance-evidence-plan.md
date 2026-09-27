# Foundation ADR Acceptance Evidence Plan

## Document Control

- Status: Draft
- Scope: Acceptance-evidence planning for ADR-0001 through ADR-0004
- Review Date: 2026-09-27
- Canonical Decision Statuses: unchanged
- Approval Effect: none
- Production Implementation Effect: none

## 1. Purpose

Define the smallest shared non-production validation program needed to produce the missing technical evidence for the first GymPulse ADR foundation batch:

~~~text
ADR-0001  D-ARCH-005  Phase 1 Modular Monolith Architecture
ADR-0002  D-ARCH-016  Primary Language / Runtime
ADR-0003  D-ARCH-001  Repository / Workspace Strategy
ADR-0004  D-ARCH-002  Canonical Database Engine
~~~

The plan exists because all four ADRs are reviewable but are not acceptance-ready.

This document is not an ADR and does not approve any decision.

## 2. Current Repository State

Fresh audit shows the repository is documentation-only.

Current root:

~~~text
.ai/
README.md
docs/
~~~

No current repository evidence exists for:

~~~text
package.json
pnpm-lock.yaml
package-lock.json
yarn.lock
tsconfig.json
Docker / Compose database harness
Drizzle / Prisma / Kysely configuration
Vitest / Jest configuration
Playwright configuration
GitHub Actions workflow
application source tree
database migration tree
production infrastructure
~~~

Therefore the missing evidence cannot be obtained by inspecting an existing implementation.

A bounded validation harness is required.

## 3. Governance Rules

### 3.1 Evidence is not acceptance

A successful spike means only:

~~~text
the proposed direction has supporting technical evidence
~~~

It does not mean:

~~~text
ADR Accepted
canonical decision DECIDED
production scaffold approved
tool/provider accepted
~~~

### 3.2 Temporary spike tooling is not a canonical choice

A validation harness may need temporary tools to execute tests.

For example, a spike may temporarily use:

- a supported Node.js runtime;
- a TypeScript compiler;
- one workspace-capable package manager;
- a PostgreSQL client/driver;
- a local/containerized PostgreSQL instance;
- a test runner or shell scripts;
- a cycle/dependency checker.

Using a tool in the spike does not accept it for production.

Every temporary dependency must be labeled:

~~~text
validation-only
not a production/tooling acceptance decision
~~~

### 3.3 No production infrastructure

Do not provision:

- production cloud accounts;
- managed production database;
- production secrets;
- production hosting;
- production CI deployment;
- production payment/messaging/auth provider;
- production domain data.

### 3.4 Do not finalize unresolved downstream decisions

The spike must not silently decide:

- exact package manager;
- task orchestrator;
- web framework;
- Member client framework;
- API deployment topology;
- ORM/query builder/migration tool;
- Auth provider;
- job runner;
- hosting provider;
- CI/CD provider;
- testing toolchain;
- RLS model;
- Member/Membership final schema/state model;
- exact Node.js version for production;
- exact PostgreSQL version for production.

### 3.5 Keep validation schema non-canonical

Database validation may use temporary tables/models solely to prove PostgreSQL behavior.

It must not be presented as the final GymPulse schema.

In particular:

~~~text
D-DATA-007 remains unresolved
~~~

so the validation harness must not encode the final Member/Membership state machine.

## 4. Acceptance-Evidence Classification

Each missing item belongs to one of three categories.

### A. Technical evidence gatherable now

Can be produced through isolated local/non-production validation.

Examples:

- dependency direction;
- strict TypeScript;
- runtime validation;
- shared request/worker use case;
- concurrency/idempotency;
- PostgreSQL rollback;
- backup/restore;
- connection/restart behavior.

### B. Human governance evidence

Cannot be produced by a technical spike.

Required:

~~~text
authorized decision owner
explicit approval / rejection / remain-Proposed record
~~~

### C. External/business/security evidence

Requires a later owner/security/business input.

Examples include:

- approved launch region/jurisdiction constraints;
- approved recovery objectives;
- staffing/team capability constraints if materially decision-changing.

The validation program must not fabricate Category B or C evidence.

## 5. Shared Validation Strategy

Do not create four independent prototypes.

Use one bounded shared harness because the ADR evidence overlaps substantially.

Conceptual structure:

~~~text
Foundation Validation Harness
|
+-- Boundary / workspace proof
|
+-- Protected application-use-case proof
|
+-- Request adapter proof
|
+-- Worker-delivery/retry proof
|
+-- Raw webhook proof
|
+-- Real PostgreSQL correctness proof
|
+-- Backup / restore / connection proof
|
+-- Evidence report
~~~

The harness should be disposable or clearly isolated from future production scaffold.

Its purpose is to prove architecture properties, not to establish production structure by inertia.

## 6. Stage 0 — Evidence Charter

Before implementing the spike, record:

~~~text
validation scope
ADRs covered
temporary tools used
which choices remain unaccepted
expected evidence artifacts
cleanup / disposition
~~~

Required output:

- one validation README/report header;
- explicit statement that the harness is non-production;
- exact commit SHA tested;
- runtime/database/tool versions used for reproducibility;
- mapping from every test to ADR evidence.

This stage does not require a decision owner to be identified, but acceptance cannot occur until one is.

## 7. Stage 1 — Boundary and Workspace Proof

### Goal

Produce shared evidence for ADR-0001, ADR-0002, and ADR-0003 without choosing production frameworks/providers.

### Minimum conceptual boundaries

Use only as much structure as needed to demonstrate:

~~~text
client-safe code
transport adapters
application use cases
domain rules
server-only infrastructure
worker adapter
validation-only persistence adapter
~~~

Do not automatically create one package per domain.

### Required proofs

1. Strict TypeScript compilation succeeds.
2. Domain/application code does not import:
   - web framework objects;
   - database driver objects;
   - provider SDK objects;
   - hosting APIs.
3. Client-safe code cannot import:
   - database access;
   - secrets/config;
   - server-only provider code.
4. Architecture dependency check rejects a deliberately forbidden import.
5. Dependency cycles are detected.
6. At least two independently buildable validation entry artifacts exist:
   - request/server entry;
   - worker entry.
7. A shared client-safe contract can be consumed without importing server internals.
8. A conceptual dependency graph can be generated or documented from the actual spike structure.

### ADR coverage

~~~text
ADR-0001:
module ownership / dependency direction / thin adapters

ADR-0002:
strict TypeScript / server-only boundary

ADR-0003:
monorepo/workspace dependency and independent-artifact semantics
~~~

### Required evidence artifacts

- compile output;
- dependency-rule test output;
- forbidden-import negative test;
- dependency graph;
- artifact build output;
- short architecture map.

## 8. Stage 2 — Protected Application Use-Case Proof

### Goal

Prove modular-monolith behavior and reuse across interactive/background adapters.

Use one narrow representative use case.

Preferred shape:

~~~text
Principal
-> tenant/resource scope
-> named capability or explicit actor rule
-> runtime input validation
-> application command
-> domain decision
-> persistence port
-> result
~~~

The use case should be small enough not to finalize broad product schema.

### Candidate use-case shape

A validation-only attendance command is suitable because existing canonical requirements already require:

- verified actor/Member context;
- Membership eligibility;
- duplicate protection;
- exactly one Attendance;
- retry safety;
- tenant/branch scope.

However, the spike must not finalize Member/Membership lifecycle schema.

Eligibility may be injected through a validation-only port/fixture rather than a final Membership state model.

### Required proofs

1. Request adapter invokes application command.
2. Worker/test delivery adapter invokes the same application command or shared application/domain behavior.
3. Business rule is not copied into either adapter.
4. Cross-tenant negative path denies.
5. Cross-branch negative path denies where branch scope applies.
6. Invalid external input is rejected before domain execution.
7. Repeat/retry does not duplicate the effective result.
8. Gym-time logic uses an injected clock/timezone where relevant.
9. Correlation context can flow from entry point to application behavior and worker continuation metadata.

### ADR coverage

~~~text
ADR-0001:
shared domain/application behavior
authorization path
adapter thinness
idempotency architecture

ADR-0002:
runtime validation
protected command
worker reuse
time/correlation behavior

ADR-0003:
same use case reused across independent entry artifacts
~~~

## 9. Stage 3 — Real PostgreSQL Correctness Slice

### Goal

Prove PostgreSQL-specific correctness behavior without finalizing the production schema or data-access tool.

Use a real isolated PostgreSQL instance.

Mocks are insufficient for this stage.

### Validation-only schema principle

Use intentionally temporary/minimal tables such as:

~~~text
validation_tenant
validation_member_ref
validation_attendance
validation_provider_event
validation_business_effect
validation_no_show_case
~~~

Names are illustrative only.

Do not create final:

~~~text
Member.status
Membership.status
Membership state constraints
production migrations
production RLS policy
~~~

### Required scenarios

1. Concurrent attendance uniqueness:
   - race logically duplicate check-ins;
   - prove one canonical attendance effect.

2. Provider-event dedupe:
   - replay same verified provider-event key;
   - prove one stored/effective event path.

3. Exactly-once business effect:
   - race/retry same logical effect;
   - prove effect applied once.

4. Single-active no-show invariant:
   - race/retry active-case creation;
   - prove one active case for the validation key.

5. Transaction rollback:
   - force error after intermediate write;
   - prove partial state is not committed.

6. Tenant-scoped query isolation:
   - Tenant A query cannot return Tenant B validation rows.

7. Representative aggregate/history query:
   - prove bounded relational query behavior on seeded pilot-like validation data.

8. Database error translation:
   - uniqueness/conflict is translated into a stable application-level result rather than leaking raw database error shape.

### ADR coverage

~~~text
ADR-0001:
local transactional correctness in modular monolith

ADR-0002:
real transaction-heavy server path

ADR-0004:
PostgreSQL transactions, constraints, concurrency, relational query fit
~~~

## 10. Stage 4 — Raw Webhook and Retry Boundary Proof

### Goal

Prove the runtime can preserve raw signed bytes and normalize verified provider evidence without selecting a production payment provider/framework.

Use a synthetic HMAC fixture or equivalent validation-only signed payload.

### Required proofs

1. Raw request bytes are available before JSON transformation.
2. Signature verification passes for exact bytes.
3. A modified byte fails verification.
4. Verified provider event is normalized before domain/application use.
5. Replayed event identity is safe.
6. Distinct duplicate-success evidence still produces one logical business effect.
7. Provider payload type does not leak into domain model.

### Tooling rule

A minimal built-in server/runtime API or temporary transport library may be used.

That choice does not accept a production framework.

### ADR coverage

~~~text
ADR-0001:
provider adapter separation

ADR-0002:
raw-body/security-sensitive webhook capability
runtime validation

ADR-0004:
durable event/effect uniqueness when combined with Stage 3
~~~

## 11. Stage 5 — Worker Retry / Restart Proof

### Goal

Prove repeated/background delivery reuses application/domain logic and does not depend on in-process memory for correctness.

Do not select a production job runner.

### Required proofs

1. A validation worker adapter loads a durable work reference or receives a replayable command.
2. Deliver the same logical job twice.
3. Application/domain/persistence controls prevent duplicate business effect.
4. Simulate process restart between attempts.
5. No in-memory lock or singleton is required for correctness.
6. Correlation/job identifiers remain visible in diagnostic output.
7. Current state is reloaded before applying the retry-sensitive effect.

### ADR coverage

~~~text
ADR-0001:
background adapter reuses application/domain behavior

ADR-0002:
worker retry/restart assumptions

ADR-0003:
independent worker artifact

ADR-0004:
durable correctness backstop
~~~

## 12. Stage 6 — Backup, Restore, Connection, Restart Proof

### Goal

Produce the operational evidence specifically missing from ADR-0004.

### Backup / restore

Required:

1. seed representative validation data;
2. create a PostgreSQL backup using a normal supported mechanism;
3. restore into a separate isolated database;
4. verify row counts plus selected relational/idempotency invariants;
5. prove original and restored environments are distinct.

No production RPO/RTO claim is made.

### Connection / restart

Required:

1. establish application connection through a temporary validation client/driver;
2. run representative transaction/query;
3. restart or interrupt PostgreSQL;
4. observe safe failure;
5. reconnect/recover;
6. prove retry does not duplicate a committed critical effect.

A temporary driver/pool is evidence only and does not accept D-ARCH-017.

### Regional/hosting limitation

A local technical spike cannot approve:

~~~text
production region
jurisdiction
managed provider
backup location
support/admin access
~~~

Those remain external/security governance evidence.

### ADR coverage

~~~text
ADR-0004:
backup/restore
connection/pooling/restart behavior
operational viability
~~~

## 13. Stage 7 — Evidence Matrix

Produce one report mapping actual evidence to each ADR gate.

Minimum columns:

| ADR | Evidence Requirement | Test / Artifact | Result | Reproducible Command | Remaining Gap |
|---|---|---|---|---|---|

Every row should be one of:

~~~text
PASS
FAIL
NOT RUN
EXTERNAL / HUMAN EVIDENCE REQUIRED
~~~

Do not use:

~~~text
ACCEPTED
DECIDED
~~~

inside technical test results.

## 14. ADR-0001 Exit Criteria

Technical evidence is sufficient for decision-owner review when all of the following are demonstrated:

- module/dependency boundaries are executable, not only documented;
- request and worker paths reuse application/domain behavior;
- cross-domain write discipline has an enforceable mechanism or test;
- one protected command proves scope/capability/validation flow;
- retry/concurrency examples prove one effective result;
- provider adapter is separable;
- time/tenant negative tests exist;
- diagnostics identify module/use-case context safely.

Still required after technical PASS:

~~~text
authorized decision owner
explicit approval record
~~~

## 15. ADR-0002 Exit Criteria

Technical evidence is sufficient for decision-owner review when:

- strict TypeScript works across representative boundaries;
- untrusted runtime input validation is proven;
- protected application command is proven;
- real transaction-heavy path is proven;
- raw signed webhook path is proven;
- worker retry/restart reuse is proven;
- injected clock/timezone is proven;
- correlation crosses request/background boundary;
- client-safe code cannot import server-only modules.

No benchmark is required merely to prove Node.js can run the current workload.

However, if a contrary performance/team/deployment constraint appears, it must be recorded before acceptance.

Still required:

~~~text
authorized decision owner
explicit approval record
~~~

## 16. ADR-0003 Exit Criteria

Technical evidence is sufficient for decision-owner review when:

- actual workspace/dependency graph exists;
- dependency direction is enforced;
- client/server boundary negative test exists;
- independent request/worker build artifacts exist;
- shared validated contract is demonstrated;
- request/worker behavior reuse is demonstrated;
- cycles are detected;
- affected build/test execution is demonstrated;
- one traceable validation change includes source/test/docs evidence.

A production monorepo scaffold is not required merely to complete this evidence.

Still required:

~~~text
authorized decision owner
explicit approval record
~~~

## 17. ADR-0004 Exit Criteria

Technical evidence is sufficient for database-engine decision-owner review when:

- real PostgreSQL concurrency/idempotency scenarios pass;
- rollback semantics pass;
- tenant-scoped query behavior is demonstrated;
- representative relational query/history use is demonstrated;
- backup/restore rehearsal passes;
- connection/restart behavior is demonstrated;
- temporary migration-from-zero/forward-change feasibility is demonstrated or explicitly separated into the D-ARCH-017 follow-up.

Important distinction:

~~~text
D-DATA-007 unresolved
-> blocks final Member/Membership schema semantics

D-DATA-007 unresolved
!=
automatic blocker to PostgreSQL engine review
~~~

External/human evidence still required:

- authorized decision owner;
- explicit approval;
- launch region/jurisdiction constraints;
- approved recovery objectives where needed for production readiness.

## 18. Decision-Owner Review Packet

After technical evidence is gathered, prepare a concise packet per ADR.

Required fields:

~~~text
ADR
canonical decision ID
current canonical status
proposed choice
alternatives considered
key tradeoffs
technical evidence result
remaining external/business/security gaps
decision owner
review date
decision:
  Accept
  Reject
  Remain Proposed
approval evidence/reference
required canonical follow-up
~~~

Do not write an acceptance outcome before the authorized owner actually decides.

## 19. Canonical Synchronization Only After Approval

If an ADR is explicitly accepted:

1. change ADR Status to Accepted;
2. record decision owner;
3. record acceptance date;
4. record approval evidence/reference;
5. synchronize the matching canonical decision to DECIDED;
6. update affected canonical architecture/product docs;
7. open only the implementation gate that the accepted ADR actually permits.

Do not batch unrelated downstream decisions into the acceptance commit.

Example:

~~~text
Accepting ADR-0004 PostgreSQL
does not automatically accept:
Drizzle
Supabase
RLS
pg-boss
Render
Node.js
final schema
~~~

## 20. Failure Handling

A failed validation is useful evidence.

If a stage fails:

~~~text
record exact failure
-> identify whether the proposal or test assumption is wrong
-> update ADR evidence
-> compare alternative if material
-> keep ADR Proposed
~~~

Do not tune the spike until it only confirms the preferred option.

## 21. Security Controls for the Validation Harness

- no production secrets;
- no real member/payment data;
- synthetic tenant/member/provider data only;
- no production provider credentials;
- localhost/private test database only unless a separately approved ephemeral environment is used;
- no secret values committed;
- cross-tenant negative tests mandatory;
- logs must avoid unnecessary personal data;
- generated artifacts must not contain credentials.

## 22. Cleanup / Disposition

Before a validation harness is merged or retained permanently, classify each artifact:

~~~text
retain as reusable test/scaffold candidate
retain as documentation evidence
or
delete as disposable spike
~~~

Retention does not convert the tool used into an accepted production dependency.

Any durable production scaffold must follow accepted ADRs.

## 23. Current Result

The first isolated validation pass has now been executed and committed under:

~~~text
validation/foundation/
~~~

Evidence report:

~~~text
validation/foundation/EVIDENCE.md
~~~

Observed validation environment:

~~~text
Node.js v22.16.0
TypeScript compiler 5.8.3
PostgreSQL tools unavailable
Docker / Podman unavailable
~~~

These versions are evidence only.

Current evidence status:

~~~text
Stage 0 evidence charter                      PASS
Stage 1 boundary / artifact proof             PARTIAL PASS
Stage 2 protected application-use-case proof  PARTIAL PASS
Stage 3 real PostgreSQL correctness slice     NOT RUN
Stage 4 raw webhook boundary proof            PASS
Stage 5 worker retry / separate-process proof PASS
Stage 6 backup/restore/connection proof        NOT RUN
Stage 7 evidence matrix                        PASS
human decision-owner approval                 EXTERNAL / REQUIRED
~~~

Key successful proofs include:

- strict client/request/worker TypeScript builds;
- clean source dependency graph;
- deliberate forbidden client -> server import detection;
- deliberate dependency-cycle detection;
- tenant/branch/capability negative authorization;
- malformed input rejection;
- request/worker reuse of one application command;
- replay-safe result across separate Node processes using validation-only durable state;
- gym-timezone date-boundary behavior;
- exact raw-byte HMAC webhook verification and tamper rejection;
- provider-event replay dedupe.

Important limitation:

~~~text
file-backed validation state
!=
PostgreSQL evidence
~~~

Therefore:

~~~text
ADR-0001 = Proposed
ADR-0002 = Proposed
ADR-0003 = Proposed
ADR-0004 = Proposed

canonical statuses = unchanged
decision owners = Open
production infrastructure = none
~~~

## 24. Next Bounded Action

Complete the missing **real PostgreSQL validation** for ADR-0004 and the shared transaction/concurrency evidence required by ADR-0001/ADR-0002.

Required next evidence:

~~~text
real PostgreSQL instance
concurrent attendance uniqueness
provider-event dedupe under DB uniqueness
exactly-once business effect
single-active no-show invariant
transaction rollback
tenant-scoped SQL isolation
representative relational aggregate/history query
database error translation
backup + restore
connection / restart recovery
~~~

The current execution environment cannot perform these items because PostgreSQL client/server tools and container runtime are unavailable.

Do not substitute SQLite, file storage, mocks, or inferred documentation for real PostgreSQL behavior.

After PostgreSQL evidence is collected, prepare the decision-owner review packet.

Do not invent a new ADR.

Do not mark any ADR Accepted from technical evidence alone.

Acceptance remains a later explicit human governance action.
