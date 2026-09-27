export type Principal = Readonly<{
  principalId: string;
  tenantId: string;
  branchIds: readonly string[];
  capabilities: readonly string[];
}>;

export type Eligibility = Readonly<{ eligible: boolean; reason?: string }>;

export function authorizeCheckIn(principal: Principal, tenantId: string, branchId: string): void {
  if (principal.tenantId !== tenantId) throw new Error("forbidden_tenant");
  if (!principal.branchIds.includes(branchId)) throw new Error("forbidden_branch");
  if (!principal.capabilities.includes("attendance.checkin.self")) throw new Error("forbidden_capability");
}

export function requireEligibility(value: Eligibility): void {
  if (!value.eligible) throw new Error(value.reason ?? "membership_ineligible");
}

export function gymBusinessDate(isoInstant: string, timeZone: string): string {
  const date = new Date(isoInstant);
  if (Number.isNaN(date.getTime())) throw new Error("invalid_instant");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
