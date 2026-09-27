import type { CheckInInput } from "./contracts.js";
import { authorizeCheckIn, requireEligibility, type Eligibility, type Principal } from "./domain.js";

export type Correlation = Readonly<{ correlationId: string; source: "request" | "worker" }>;
export type AttendanceResult = Readonly<{ attendanceId: string; created: boolean; correlationId: string }>;

export interface AttendancePort {
  getEligibility(tenantId: string, memberId: string): Promise<Eligibility>;
  createOnce(input: CheckInInput, correlation: Correlation): Promise<AttendanceResult>;
}

export async function checkIn(
  principal: Principal,
  input: CheckInInput,
  correlation: Correlation,
  port: AttendancePort
): Promise<AttendanceResult> {
  authorizeCheckIn(principal, input.tenantId, input.branchId);
  requireEligibility(await port.getEligibility(input.tenantId, input.memberId));
  return port.createOnce(input, correlation);
}
