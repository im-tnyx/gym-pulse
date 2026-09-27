import { handleWorkerDelivery } from "../out/worker/worker-entry.js";
const stateFile=process.argv[2];
const principal={principalId:"p1",tenantId:"tenant-a",branchIds:["branch-a"],capabilities:["attendance.checkin.self"]};
const input={tenantId:"tenant-a",branchId:"branch-a",memberId:"member-1",logicalRequestId:"restart-req"};
console.log(JSON.stringify(await handleWorkerDelivery(input,principal,stateFile,"corr-process-2")));
