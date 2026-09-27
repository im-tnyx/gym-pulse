import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { AttendancePort, AttendanceResult, Correlation } from "./application.js";
import type { CheckInInput } from "./contracts.js";
import type { Eligibility } from "./domain.js";

type State = { attendance: Record<string, string>; processedEvents: Record<string, true> };

export class FileAttendancePort implements AttendancePort {
  constructor(private readonly file: string, private readonly eligibleMembers: ReadonlySet<string>) {}

  async getEligibility(tenantId: string, memberId: string): Promise<Eligibility> {
    return { eligible: this.eligibleMembers.has(`${tenantId}:${memberId}`), reason: "membership_ineligible" };
  }

  private async load(): Promise<State> {
    try { return JSON.parse(await readFile(this.file, "utf8")) as State; }
    catch { return { attendance: {}, processedEvents: {} }; }
  }

  private async save(state: State): Promise<void> {
    await mkdir(dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(state, null, 2));
  }

  async createOnce(input: CheckInInput, correlation: Correlation): Promise<AttendanceResult> {
    const state = await this.load();
    const key = `${input.tenantId}:${input.logicalRequestId}`;
    const existing = state.attendance[key];
    if (existing) return { attendanceId: existing, created: false, correlationId: correlation.correlationId };
    const id = `att-${Object.keys(state.attendance).length + 1}`;
    state.attendance[key] = id;
    await this.save(state);
    return { attendanceId: id, created: true, correlationId: correlation.correlationId };
  }

  async claimProviderEventOnce(eventId: string): Promise<boolean> {
    const state = await this.load();
    if (state.processedEvents[eventId]) return false;
    state.processedEvents[eventId] = true;
    await this.save(state);
    return true;
  }
}
