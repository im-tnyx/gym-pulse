import type { CheckInInput } from "./contracts.js";
import { checkIn } from "./application.js";
import type { Principal } from "./domain.js";
import { FileAttendancePort } from "./infrastructure.js";

export async function handleWorkerDelivery(input: CheckInInput, principal: Principal, stateFile: string, correlationId: string) {
  const port = new FileAttendancePort(stateFile, new Set([`${input.tenantId}:${input.memberId}`]));
  return checkIn(principal, input, { correlationId, source: "worker" }, port);
}
