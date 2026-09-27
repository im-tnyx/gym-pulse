import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { handleRequest } from "../out/request/request-entry.js";
import { handleWorkerDelivery } from "../out/worker/worker-entry.js";
import { sign, verifyRawWebhook } from "../out/request/webhook.js";
import { FileAttendancePort } from "../out/request/infrastructure.js";
import { gymBusinessDate } from "../out/request/domain.js";

const stateFile="/tmp/gympulse-foundation-state/state.json";
await rm("/tmp/gympulse-foundation-state",{recursive:true,force:true});
const principal={principalId:"p1",tenantId:"tenant-a",branchIds:["branch-a"],capabilities:["attendance.checkin.self"]};
const input={tenantId:"tenant-a",branchId:"branch-a",memberId:"member-1",logicalRequestId:"req-1"};

const first=await handleRequest(input,principal,stateFile,"corr-1");
assert.equal(first.created,true);
const replay=await handleRequest(input,principal,stateFile,"corr-2");
assert.equal(replay.created,false);
assert.equal(replay.attendanceId,first.attendanceId);

const afterRestart=await handleWorkerDelivery(input,principal,stateFile,"corr-3");
assert.equal(afterRestart.created,false);
assert.equal(afterRestart.attendanceId,first.attendanceId);

await assert.rejects(()=>handleRequest(input,{...principal,tenantId:"tenant-b"},stateFile,"corr-x"),/forbidden_tenant/);
await assert.rejects(()=>handleRequest({...input,branchId:"branch-b"},principal,stateFile,"corr-y"),/forbidden_branch/);
await assert.rejects(()=>handleRequest(input,{...principal,capabilities:[]},stateFile,"corr-cap"),/forbidden_capability/);
await assert.rejects(()=>handleRequest({tenantId:"tenant-a"},principal,stateFile,"corr-z"),/invalid_branchId/);

const secret="validation-secret";
const raw=Buffer.from(JSON.stringify({eventId:"evt-1",status:"success"}),"utf8");
const signature=sign(raw,secret);
assert.equal(verifyRawWebhook(raw,signature,secret).eventId,"evt-1");
const tampered=Buffer.from(raw); tampered[tampered.length-2]^=1;
assert.throws(()=>verifyRawWebhook(tampered,signature,secret),/invalid_signature/);

assert.equal(gymBusinessDate("2026-09-27T20:00:00.000Z","Asia/Kolkata"),"2026-09-28");

const portA=new FileAttendancePort(stateFile,new Set(["tenant-a:member-1"]));
assert.equal(await portA.claimProviderEventOnce("evt-1"),true);
const portB=new FileAttendancePort(stateFile,new Set(["tenant-a:member-1"]));
assert.equal(await portB.claimProviderEventOnce("evt-1"),false);

console.log(JSON.stringify({
  strictRuntimeValidation:"PASS",
  requestReplayDedup:"PASS",
  workerReplayAfterNewRepositoryInstance:"PASS",
  crossTenantNegative:"PASS",
  crossBranchNegative:"PASS",
  capabilityNegative:"PASS",
  gymTimezoneBoundary:"PASS",
  rawWebhookExactBytes:"PASS",
  rawWebhookTamperReject:"PASS",
  providerEventReplayDedup:"PASS"
},null,2));
