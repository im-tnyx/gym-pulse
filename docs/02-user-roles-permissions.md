# GymPulse User Roles and Permissions

## 1. Purpose

Define who can see and change each category of GymPulse data, how access is scoped, and which sensitive actions require stronger controls.

Authorization must be enforced server-side. UI visibility is not an authorization boundary.

## 2. Tenant hierarchy

```text
Platform
  -> Organization
      -> Gym
          -> Branch
              -> Staff Users
              -> Members
```

A user may have one or more role assignments with explicit scope.

Examples:

- owner scoped to one gym,
- branch manager scoped to one branch,
- organization admin scoped to all gyms in an organization,
- platform admin scoped outside normal tenant authorization.

## 3. Phase 1 roles

### Member

A member is an end user whose access is restricted to their own permitted records.

Typical permissions:

- view own profile,
- view own membership,
- view own attendance,
- perform own QR check-in,
- view own weekly goal / streak,
- view own renewal offers,
- create own payment attempt through approved flow,
- view own payment result and receipt,
- view available add-ons,
- manage own communication preferences where supported.

A member must not:

- view another member,
- modify attendance directly,
- change expiry,
- mark payment as paid,
- view staff notes not intended for member visibility,
- change tenant configuration.

### Front Desk Staff

Typical permissions:

- search members within authorized branch,
- view membership eligibility,
- create assisted attendance with mandatory reason,
- view attendance history,
- record follow-up outcome when assigned/allowed,
- view renewal status,
- view payment result,
- share receipt,
- perform explicitly authorized offline-payment action if gym policy enables it.

Restricted by default:

- plan pricing changes,
- tenant settings,
- role assignment,
- destructive financial actions,
- cross-branch data.

### Owner / Manager

Typical permissions:

- all front-desk operational permissions,
- manage members,
- manage plans,
- manage membership state,
- approve / manage freezes,
- configure no-show threshold,
- configure renewal windows,
- manage add-ons,
- review operational KPIs,
- review audit history within tenant scope,
- manage staff role assignments allowed by policy,
- review payment and refund state,
- export authorized operational data.

Sensitive operations should still require explicit permission even for an owner role.

## 4. Future roles

### Trainer

Potential scope:

- assigned clients,
- PT schedule,
- session completion,
- package utilization,
- training notes,
- future workout programs.

Trainer should not automatically receive access to all payment or owner financial reporting.

### Sales Staff

Potential scope:

- leads,
- trials,
- sales follow-ups,
- conversion status,
- approved membership offers.

### Branch Manager

Potential scope:

- branch members,
- branch staff,
- branch attendance,
- branch retention,
- branch renewals,
- branch operations.

### Organization Admin

Potential scope:

- all gyms / branches in organization,
- organization configuration,
- cross-branch reporting,
- organization-level staff access.

### Finance / Accountant

Potential scope:

- payments,
- receipts,
- refunds,
- reconciliation,
- exports.

May not need access to member fitness or trainer notes.

### Platform Support

Restricted support role used only for approved operational troubleshooting.

Access must be:

- explicitly granted,
- time-limited where possible,
- audited,
- minimized to required tenant and resource.

### Platform Admin

Internal GymPulse role for platform-level administration.

Platform admins must not use normal tenant UI as an unrestricted backdoor. Support access should use audited tooling and explicit reason codes.

## 5. Permission model

Recommended authorization model:

```text
User
  -> RoleAssignment
      -> Role
      -> ScopeType
      -> ScopeId
      -> PermissionSet
```

Example:

```json
{
  "role": "front_desk",
  "scope_type": "branch",
  "scope_id": "branch_123"
}
```

## 6. Permission naming convention

Use capability-oriented permission names:

```text
member.read
member.create
member.update
membership.read
membership.create
membership.update
membership.freeze
attendance.read
attendance.checkin.assisted
attendance.correct
noshow.read
noshow.assign
followup.create
plan.read
plan.manage
renewal.read
renewal.manage
payment.read
payment.record_offline
payment.refund
addon.read
addon.manage
analytics.read
settings.manage
roles.manage
audit.read
export.create
```

Avoid permission logic such as `if role === owner` scattered across the codebase. Roles should resolve to capabilities.

## 7. Phase 1 permission matrix

Legend:

- `Self`: own records only
- `Branch`: authorized branch
- `Gym`: authorized gym
- `No`: denied by default
- `Conditional`: requires specific capability or policy

| Capability | Member | Front Desk | Owner / Manager |
| --- | --- | --- | --- |
| View member profile | Self | Branch | Gym |
| Create member | No | Conditional | Gym |
| Edit member profile | Limited Self | Conditional | Gym |
| View membership | Self | Branch | Gym |
| Create membership | No | Conditional | Gym |
| Change membership dates | No | Conditional | Gym |
| Freeze membership | No | Conditional | Gym |
| View attendance | Self | Branch | Gym |
| QR self check-in | Self | No | No |
| Assisted check-in | No | Branch | Gym |
| Correct attendance | No | Conditional | Conditional |
| View no-show queue | No | Branch | Gym |
| Record follow-up | No | Branch | Gym |
| Assign no-show case | No | Conditional | Gym |
| View plans | Available plans | Branch | Gym |
| Manage plans | No | No | Gym |
| View renewal offer | Self | Branch | Gym |
| Create online payment | Self | Conditional | Conditional |
| Mark online payment paid | No | No | No |
| Record offline payment | No | Conditional | Conditional |
| View payment | Self | Branch | Gym |
| Refund payment | No | No | Conditional |
| View add-ons | Self | Branch | Gym |
| Manage add-ons | No | No | Gym |
| View owner KPIs | No | No | Gym |
| Manage settings | No | No | Gym |
| Manage roles | No | No | Conditional |
| View audit log | No | No | Conditional |
| Export data | No | No | Conditional |

## 8. Sensitive action policy

The following actions should use stronger authorization and audit requirements:

- membership backdating,
- membership expiry override,
- attendance correction,
- offline payment recording,
- refund / reversal action,
- plan price changes,
- stock adjustments,
- role and permission changes,
- tenant settings affecting renewal or risk logic,
- bulk import,
- bulk export.

Each sensitive action should record:

- actor,
- tenant,
- branch where relevant,
- resource,
- action,
- reason if required,
- before state,
- after state,
- timestamp,
- request / correlation identifier.

## 9. Tenant isolation rules

### Rule 1: tenant scope must be explicit

Every tenant-owned table should include a tenant key directly or through a relationship that is safe and efficient to enforce.

### Rule 2: authorization precedes resource lookup exposure

An API must not reveal whether an unauthorized resource exists through different error behavior.

### Rule 3: client tenant identifiers are untrusted

The server derives or verifies scope from the authenticated principal.

### Rule 4: background jobs retain scope

Jobs must include the tenant / branch context needed to safely fetch records.

### Rule 5: analytics events preserve tenant context

Events must never merge data across tenants because of missing identifiers.

### Rule 6: storage paths are tenant-scoped

Future documents, receipts, progress photos, and exports must use scoped object-storage paths and access rules.

## 10. Member data visibility

Member-facing fields should be explicitly classified.

### Member-visible examples

- own name,
- own membership,
- expiry,
- attendance,
- weekly goal,
- renewal offers,
- payment status,
- receipts,
- purchased add-ons.

### Staff-only examples

- internal follow-up note,
- risk case status,
- operational reason codes,
- internal audit context.

### Restricted examples

- role assignment,
- other members' information,
- full tenant financial analytics,
- support/admin tooling.

## 11. Branch behavior

Phase 1 may launch with one branch, but branch authorization should not be hardcoded away.

Questions that must be decided before multi-branch production:

- can a member check in at any branch?
- is a membership branch-specific or organization-wide?
- can staff search members from another branch?
- which branch receives renewal revenue attribution?
- how are cross-branch transfers handled?

Until those rules are approved, Phase 1 should assume the member belongs to a primary branch and check-in occurs at an authorized branch.

## 12. Authorization implementation guidance

Recommended flow for protected requests:

```text
Authenticate user
  -> Load role assignments
  -> Resolve tenant and branch scope
  -> Check named permission
  -> Fetch resource within authorized scope
  -> Validate business rule
  -> Execute action
  -> Write audit record if required
```

Database row-level security may add defense in depth, but it does not replace application-level business authorization.

## 13. Failure behavior

Authorization failures should return a consistent error contract.

Examples:

- `401 UNAUTHENTICATED`
- `403 FORBIDDEN`
- `404 NOT_FOUND` when resource existence should not be disclosed

Sensitive errors must not reveal:

- other tenant IDs,
- role internals,
- private member data,
- database details.

## 14. Testing requirements

Authorization tests must cover:

- member -> another member record denied,
- front desk -> unauthorized branch denied,
- owner -> own gym permitted,
- missing capability denied even if UI button is manually invoked,
- role removal invalidates future protected actions,
- background job cannot fetch another tenant by malformed job payload,
- export respects authorized scope,
- audit access requires explicit permission.

## 15. Open decisions

- member authentication method,
- front-desk member-creation permission,
- who may correct attendance,
- who may record offline payment,
- refund approval model,
- owner vs manager distinction,
- whether support access can impersonate a tenant user,
- branch portability rules.

Track final decisions in `16-open-decisions.md` and update this document when resolved.
