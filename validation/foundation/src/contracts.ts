export type CheckInInput = Readonly<{
  tenantId: string;
  branchId: string;
  memberId: string;
  logicalRequestId: string;
}>;

export function parseCheckInInput(value: unknown): CheckInInput {
  if (typeof value !== "object" || value === null) throw new Error("invalid_input");
  const v = value as Record<string, unknown>;
  for (const key of ["tenantId", "branchId", "memberId", "logicalRequestId"] as const) {
    if (typeof v[key] !== "string" || v[key].length === 0) throw new Error(`invalid_${key}`);
  }
  return {
    tenantId: v.tenantId as string,
    branchId: v.branchId as string,
    memberId: v.memberId as string,
    logicalRequestId: v.logicalRequestId as string
  };
}
