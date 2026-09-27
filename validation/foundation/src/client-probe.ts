import { parseCheckInInput, type CheckInInput } from "./contracts.js";

export function clientSafeNormalize(value: unknown): CheckInInput {
  return parseCheckInInput(value);
}
