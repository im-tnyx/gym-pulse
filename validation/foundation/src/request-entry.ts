import { parseCheckInInput } from "./contracts.js";
import { checkIn } from "./application.js";
import type { Principal } from "./domain.js";
import { FileAttendancePort } from "./infrastructure.js";

export async function handleRequest(body: unknown, principal: Principal, stateFile: string, correlationId: string) {
  const input = parseCheckInInput(body);
  const port = new FileAttendancePort(stateFile, new Set([`${input.tenantId}:${input.memberId}`]));
  return checkIn(principal, input, { correlationId, source: "request" }, port);
}
