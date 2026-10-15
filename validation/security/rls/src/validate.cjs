"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const UNKNOWN = "33333333-3333-4333-8333-333333333333";
const dir = path.resolve(__dirname, "../results");
fs.mkdirSync(dir, { recursive: true });
const base = {
  host: process.env.PGHOST, port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE, connectionTimeoutMillis: 3500
};
const makePool = (user, password, max = 2) => new Pool({ ...base, user, password, max, idleTimeoutMillis: 3000 });
const root = makePool(process.env.PGUSER, process.env.PGPASSWORD);
const runtime = makePool("validation_runtime", process.env.RUNTIME_PASSWORD, 4);
const one = makePool("validation_runtime", process.env.RUNTIME_PASSWORD, 1);
const worker = makePool("validation_worker", process.env.WORKER_PASSWORD, 2);
const admin = makePool("validation_migration_admin", process.env.ADMIN_PASSWORD);
const matrix = [];
const evidence = {};
function check(ok, msg) { assert.ok(ok, msg); }
async function caseRun(name, fn) {
  try {
    const details = await fn();
    matrix.push({ test: name, result: "PASS" });
    evidence[name] = details === undefined ? { observed: "assertions passed" } : details;
    console.log("PASS " + name);
  } catch (error) {
    matrix.push({ test: name, result: "FAIL" });
    evidence[name] = { error: error.message, code: error.code || null };
    console.error("FAIL " + name + ": " + error.message);
    process.exitCode = 1;
  }
}
async function denies(action, expectRows = false) {
  try {
    const rows = await action();
    if (expectRows) { assert.equal(rows.rowCount, 0); return "0 rows"; }
    throw new Error("Unauthorized statement succeeded");
  } catch (error) {
    if (error.message === "Unauthorized statement succeeded") throw error;
    if (error.code) return "SQLSTATE " + error.code;
    throw error;
  }
}
async function scoped(pool, tenant, fn) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const before = await c.query("SELECT NULLIF(current_setting('gympulse.tenant_id', true),'') AS scope");
    assert.equal(before.rows[0].scope, null, "stale session tenant context detected");
    await c.query("SELECT set_config('gympulse.tenant_id', $1, true)", [tenant]);
    const result = await fn(c);
    await c.query("COMMIT");
    return result;
  } catch (error) {
    await c.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { c.release(); }
}
function count(rows) { return Number(rows.rows[0].n); }
async function countRecords(c) { return count(await c.query("SELECT count(*)::int AS n FROM rls_validation.validation_tenant_record")); }
async function ownerSQL(sql, args = []) {
  const c = await admin.connect();
  try {
    await c.query("BEGIN");
    await c.query("SET LOCAL ROLE validation_schema_owner");
    const r = await c.query(sql, args);
    await c.query("COMMIT");
    return r;
  } catch(e) { await c.query("ROLLBACK").catch(() => {}); throw e; }
  finally { c.release(); }
}
function authorize(principal, action) {
  if (!principal.verified || !principal.active) throw new Error("unverified or inactive");
  if (principal.tenantId !== action.tenantId) throw new Error("wrong tenant");
  if (!principal.branches.includes(action.branchId)) throw new Error("wrong branch");
  if (!principal.capabilities.includes(action.capability)) throw new Error("missing capability");
  if (action.memberId && principal.memberId !== action.memberId) throw new Error("wrong member-self");
  return true;
}
function appDenies(principal, action) {
  try { authorize(principal, action); throw new Error("application authorization unexpectedly allowed"); }
  catch(e) { if (e.message === "application authorization unexpectedly allowed") throw e; return e.message; }
}
async function run() {
  await caseRun("real_postgresql_and_runtime_roles", async () => {
    const server = await root.query("SELECT current_setting('server_version') AS version");
    const roles = await root.query(
      "SELECT rolname, rolsuper, rolbypassrls, rolcanlogin FROM pg_roles WHERE rolname=ANY($1)",
      [["validation_runtime","validation_worker","validation_schema_owner","validation_migration_admin"]]);
    assert.equal(roles.rowCount,4);
    const runtimeRole = roles.rows.find(x=>x.rolname==="validation_runtime");
    const workerRole = roles.rows.find(x=>x.rolname==="validation_worker");
    check(!runtimeRole.rolsuper && !runtimeRole.rolbypassrls && runtimeRole.rolcanlogin,"runtime role bypass");
    check(!workerRole.rolsuper && !workerRole.rolbypassrls,"worker bypass");
    const own = await root.query("SELECT pg_get_userbyid(relowner) AS owner, relrowsecurity, relforcerowsecurity FROM pg_class WHERE oid='rls_validation.validation_tenant_record'::regclass");
    assert.equal(own.rows[0].owner,"validation_schema_owner");
    assert.equal(own.rows[0].relrowsecurity,true);
    const realRole = await runtime.query("SELECT current_user AS role");
    assert.equal(realRole.rows[0].role,"validation_runtime");
    return { postgresql:server.rows[0].version, roles:roles.rows, owner:own.rows[0],runtimeIdentity:realRole.rows[0] };
  });
  await caseRun("migration_from_zero", async () => {
    const tables = await root.query("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='rls_validation' AND tablename LIKE 'validation_%'");
    check(tables.rowCount>=5,"initial migration tables missing");
    const policies = await root.query("SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname='rls_validation'");
    check(policies.rowCount>=4,"tenant policies missing");
    return { tables:tables.rows, policyCount:policies.rowCount };
  });
  await caseRun("application_authorization_independent_of_rls", async () => {
    const principal = { verified:true, active:true, tenantId:A, branches:["branch-a"],capabilities:["members.read"],memberId:"member-a" };
    const action = { tenantId:A,branchId:"branch-a",capability:"members.read",memberId:"member-a" };
    assert.equal(authorize(principal,action),true);
    const failures = [
      appDenies(principal,{...action,tenantId:B}),
      appDenies(principal,{...action,branchId:"branch-b"}),
      appDenies(principal,{...action,capability:"payments.refund"}),
      appDenies(principal,{...action,memberId:"member-b"}),
      appDenies({...principal,active:false}, action),
      appDenies({...principal,verified:false}, action)
    ];
    assert.equal(failures.length,6);
    return { type:"validation-only server adapter", results:failures, caveat:"Not a production authorization module" };
  });
  await caseRun("tenant_a_select_isolation", async () => {
    return scoped(one,A,async c => {
      const r=await c.query("SELECT id,tenant_id FROM rls_validation.validation_tenant_record ORDER BY id");
      check(r.rows.length>=2,"A fixture missing");
      check(r.rows.every(x=>x.tenant_id===A),"cross-tenant A SELECT");
      return { count:r.rows.length };
    });
  });
  await caseRun("tenant_b_select_isolation", async () => {
    return scoped(one,B,async c => {
      const r=await c.query("SELECT id,tenant_id FROM rls_validation.validation_tenant_record ORDER BY id");
      check(r.rows.length>=1,"B fixture missing");
      check(r.rows.every(x=>x.tenant_id===B),"cross-tenant B SELECT");
      return { count:r.rows.length };
    });
  });
  await caseRun("insert_with_check", async () => {
    return scoped(one,A,async c => {
      const good=await c.query("INSERT INTO rls_validation.validation_tenant_record(id,tenant_id,member_ref,branch_id,kind) VALUES('a-insert',$1,'member-a','branch-a','active') RETURNING tenant_id",[A]);
      assert.equal(good.rows[0].tenant_id,A);
      await c.query("SAVEPOINT negative_insert");
      const denied=await denies(()=>c.query("INSERT INTO rls_validation.validation_tenant_record(id,tenant_id,member_ref,branch_id,kind) VALUES('b-forged',$1,'member-b','branch-b','active')",[B]));
      await c.query("ROLLBACK TO SAVEPOINT negative_insert");
      const persisted=await root.query("SELECT count(*)::int AS n FROM rls_validation.validation_tenant_record WHERE id='b-forged'");
      assert.equal(count(persisted),0);
      return { allowed:"Tenant A", rejected:denied, wrongTenantRows:0 };
    });
  });
  await caseRun("update_cross_tenant_denial", async () => scoped(one,A,async c=>{
    const good=await c.query("UPDATE rls_validation.validation_tenant_record SET kind='renewal' WHERE id='a-insert'");
    assert.equal(good.rowCount,1);
    const bad=await c.query("UPDATE rls_validation.validation_tenant_record SET kind='compromised' WHERE id='b-record'");
    assert.equal(bad.rowCount,0);
    const b=await root.query("SELECT kind FROM rls_validation.validation_tenant_record WHERE id='b-record'");
    assert.notEqual(b.rows[0].kind,"compromised");
    return { ownMutated:1,otherMutated:0 };
  }));
  await caseRun("tenant_ownership_update_denial", async () => scoped(one,A,async c=>{
    await c.query("SAVEPOINT ownership");
    const rejected=await denies(()=>c.query("UPDATE rls_validation.validation_tenant_record SET tenant_id=$1,member_ref='member-b' WHERE id='a-insert'",[B]));
    await c.query("ROLLBACK TO SAVEPOINT ownership");
    const owner=await c.query("SELECT tenant_id FROM rls_validation.validation_tenant_record WHERE id='a-insert'");
    assert.equal(owner.rows[0].tenant_id,A);
    return { rejection:rejected, originalTenantIntact:true };
  }));
  await caseRun("delete_cross_tenant_denial", async () => scoped(one,A,async c=>{
    const negative=await c.query("DELETE FROM rls_validation.validation_tenant_record WHERE id='b-record'");
    assert.equal(negative.rowCount,0);
    const own=await c.query("DELETE FROM rls_validation.validation_tenant_record WHERE id='a-insert'");
    assert.equal(own.rowCount,1);
    const rootB=await root.query("SELECT count(*)::int AS n FROM rls_validation.validation_tenant_record WHERE id='b-record'");
    assert.equal(count(rootB),1);
    return { otherDeleted:0, ownDeleted:1, bPreserved:true };
  }));
  await caseRun("missing_tenant_context_fail_closed", async () => {
    const read=await one.query("SELECT count(*)::int AS n FROM rls_validation.validation_tenant_record");
    assert.equal(count(read),0);
    const insert=await denies(()=>one.query("INSERT INTO rls_validation.validation_tenant_record(id,tenant_id,member_ref,branch_id,kind) VALUES('missing-context',$1,'member-a','branch-a','active')",[A]));
    const update=await one.query("UPDATE rls_validation.validation_tenant_record SET kind='unauthorized' WHERE id='a-record'");
    const del=await one.query("DELETE FROM rls_validation.validation_tenant_record WHERE id='b-record'");
    assert.equal(update.rowCount,0);assert.equal(del.rowCount,0);
    return { select:0,insert,update:0,delete:0 };
  });
  await caseRun("invalid_tenant_context_fail_closed", async () => {
    const r=[];
    for (const tenant of [UNKNOWN,"not-a-uuid","","  ","client-forged-tenant"]) {
      try {
        const outcome=await scoped(one,tenant,async c=>{
          const read=await c.query("SELECT count(*)::int AS n FROM rls_validation.validation_tenant_record");
          assert.equal(count(read),0);
          return "zero rows";
        });
        r.push({ supplied:tenant, outcome });
      } catch(error) {
        check(error.code==="22P02","unexpected tenant failure "+error.message);
        r.push({ supplied:tenant, outcome:"invalid uuid SQLSTATE 22P02" });
      }
    }
    return r;
  });
  await caseRun("broad_query_rls_independent_of_sql_predicates", async () => scoped(one,A,async c=>{
    const all=await c.query("SELECT id,tenant_id FROM rls_validation.validation_tenant_record");
    check(all.rows.length>=2,"fixture missing");
    check(all.rows.every(x=>x.tenant_id===A),"broad query leaked tenant B");
    return { predicate:"none",visibleRows:all.rows.length };
  }));
  await caseRun("runtime_and_worker_cannot_alter_policies_or_switch_role", async () => {
    const runtimeDDL=await denies(()=>runtime.query("ALTER TABLE rls_validation.validation_tenant_record DISABLE ROW LEVEL SECURITY"));
    const workerDDL=await denies(()=>worker.query("ALTER TABLE rls_validation.validation_tenant_record DISABLE ROW LEVEL SECURITY"));
    const switchRole=await denies(()=>worker.query("SET ROLE validation_schema_owner"));
    const runtimeSwitch=await denies(()=>runtime.query("SET ROLE validation_schema_owner"));
    return { runtimeDDL, workerDDL, switchRole, runtimeSwitch };
  });
  await caseRun("table_owner_bypass_and_force_rls", async () => {
    const before=await ownerSQL("SELECT count(*)::int AS n FROM rls_validation.validation_tenant_record");
    check(count(before)>1,"owner bypass evidence missing");
    await ownerSQL("ALTER TABLE rls_validation.validation_tenant_record FORCE ROW LEVEL SECURITY");
    const after=await ownerSQL("SELECT count(*)::int AS n FROM rls_validation.validation_tenant_record");
    assert.equal(count(after),0);
    const meta=await root.query("SELECT relforcerowsecurity FROM pg_class WHERE oid='rls_validation.validation_tenant_record'::regclass");
    assert.equal(meta.rows[0].relforcerowsecurity,true);
    return { ownerBeforeForce:count(before),ownerAfterForce:0,superuserOrBYPASSRLSStillBypass:true };
  });
  await caseRun("transaction_commit_context_clears", async () => {
    const pid=await scoped(one,A,async c=>(await c.query("SELECT pg_backend_pid() AS pid")).rows[0].pid);
    const outside=await one.query("SELECT pg_backend_pid() AS pid,NULLIF(current_setting('gympulse.tenant_id',true),'') AS tenant");
    assert.equal(outside.rows[0].pid,pid);
    assert.equal(outside.rows[0].tenant,null);
    return { reusedPid:pid, afterCommit:null };
  });
  await caseRun("same_physical_pool_connection_a_then_b", async () => {
    const a=await scoped(one,A,async c=>({pid:(await c.query("SELECT pg_backend_pid() AS pid")).rows[0].pid,visible:await countRecords(c)}));
    const b=await scoped(one,B,async c=>({pid:(await c.query("SELECT pg_backend_pid() AS pid")).rows[0].pid,visible:await countRecords(c)}));
    assert.equal(a.pid,b.pid,"not same physical connection");
    check(a.visible>0&&b.visible>0,"missing tenant fixtures");
    return { a,b, samePhysicalBackend:true };
  });
  await caseRun("rollback_context_and_business_rows_clear", async () => {
    const c=await one.connect();let pid;
    try {
      await c.query("BEGIN");
      pid=(await c.query("SELECT pg_backend_pid() AS pid")).rows[0].pid;
      await c.query("SELECT set_config('gympulse.tenant_id',$1,true)",[A]);
      await c.query("INSERT INTO rls_validation.validation_tenant_record(id,tenant_id,member_ref,branch_id,kind) VALUES('rollback-marker',$1,'member-a','branch-a','active')",[A]);
      await c.query("ROLLBACK");
    } finally {c.release();}
    const b=await scoped(one,B,async c=>({
      pid:(await c.query("SELECT pg_backend_pid() AS pid")).rows[0].pid,
      rows:await c.query("SELECT tenant_id FROM rls_validation.validation_tenant_record")
    }));
    assert.equal(b.pid,pid);
    check(b.rows.rows.every(x=>x.tenant_id===B),"rollback tenant leaked");
    const committed=await root.query("SELECT count(*)::int AS n FROM rls_validation.validation_tenant_record WHERE id='rollback-marker'");
    assert.equal(count(committed),0);
    return { samePhysicalBackend:true, rollbackMarkerCount:0 };
  });
  await caseRun("genuine_parallel_a_b_sessions", async () => {
    const ca=await runtime.connect(), cb=await runtime.connect();
    let release;
    const barrier=new Promise(resolve=>{release=resolve;});
    const work=async (c,tenant)=>{
      await c.query("BEGIN");
      await c.query("SELECT set_config('gympulse.tenant_id',$1,true)",[tenant]);
      await barrier;
      const start=Date.now();
      const r=await c.query("SELECT pg_backend_pid() AS pid,(SELECT count(*)::int FROM rls_validation.validation_tenant_record) AS n,pg_sleep(0.3)");
      const end=Date.now();
      await c.query("COMMIT");
      return { pid:r.rows[0].pid,count:r.rows[0].n,start,end };
    };
    try {
      const pa=work(ca,A),pb=work(cb,B);
      release();
      const [a,b]=await Promise.all([pa,pb]);
      assert.notEqual(a.pid,b.pid);
      check(a.count>0&&b.count>0,"missing tenant fixture");
      check(Math.min(a.end,b.end)-Math.max(a.start,b.start)>50,"no actual overlap");
      return {a,b,concurrentPids:true,overlapMs:Math.min(a.end,b.end)-Math.max(a.start,b.start)};
    } finally {
      await ca.query("ROLLBACK").catch(()=>{}); await cb.query("ROLLBACK").catch(()=>{});
      ca.release(); cb.release();
    }
  });
  await caseRun("background_worker_scope_and_reuse", async () => {
    const wOne=makePool("validation_worker",process.env.WORKER_PASSWORD,1);
    try {
      const a=await scoped(wOne,A,async c=>({
        pid:(await c.query("SELECT pg_backend_pid() AS pid")).rows[0].pid,
        rows:(await c.query("SELECT tenant_id FROM rls_validation.validation_job_ref")).rows
      }));
      const b=await scoped(wOne,B,async c=>({
        pid:(await c.query("SELECT pg_backend_pid() AS pid")).rows[0].pid,
        rows:(await c.query("SELECT tenant_id FROM rls_validation.validation_job_ref")).rows
      }));
      assert.equal(a.pid,b.pid);
      check(a.rows.length>0&&a.rows.every(x=>x.tenant_id===A),"worker A scope");
      check(b.rows.length>0&&b.rows.every(x=>x.tenant_id===B),"worker B scope");
      const missing=await wOne.query("SELECT count(*)::int AS n FROM rls_validation.validation_job_ref");
      assert.equal(count(missing),0);
      return {samePid:a.pid,tenantA:a.rows.length,tenantB:b.rows.length,missingContext:0};
    } finally { await wOne.end(); }
  });
  await caseRun("verified_callback_resource_scope", async () => {
    const trustedResourceTenant={"resource-a":A,"resource-b":B};
    async function callback(verified, resource, claimedTenant) {
      if (!verified) throw new Error("unverified callback");
      const resolved=trustedResourceTenant[resource];
      if (!resolved||resolved!==claimedTenant) throw new Error("resource tenant mismatch");
      return scoped(one,resolved,async c=> {
        const q=await c.query("UPDATE rls_validation.validation_tenant_record SET kind='callback-confirmed' WHERE id=$1 RETURNING tenant_id",[resource==="resource-a"?"a-record":"b-record"]);
        assert.equal(q.rowCount,1);
        return q.rows[0].tenant_id;
      });
    }
    const good=await callback(true,"resource-a",A);assert.equal(good,A);
    let refused=false;
    try{await callback(true,"resource-b",A);}catch(e){refused=e.message==="resource tenant mismatch";}
    assert.equal(refused,true);
    return { good:"A update", mismatched:"denied before SQL", caveat:"synthetic verified flag; not signature verification" };
  });
  await caseRun("security_invoker_view_isolation",async () => scoped(one,A,async c=>{
    const r=await c.query("SELECT tenant_id FROM rls_validation.runtime_record_view");
    check(r.rows.length>0&&r.rows.every(x=>x.tenant_id===A),"view leaked B");
    const info=await root.query("SELECT reloptions FROM pg_class WHERE oid='rls_validation.runtime_record_view'::regclass");
    check(JSON.stringify(info.rows[0]).includes("security_invoker=true"),"not invoker view");
    return {rows:r.rows.length,options:info.rows[0].reloptions,securityDefinerFunctions:"NOT RUN" };
  }));
  await caseRun("tenant_aware_referential_integrity",async () => scoped(one,A,async c=>{
    await c.query("SAVEPOINT crossfk");
    let code="";
    try{await c.query("INSERT INTO rls_validation.validation_tenant_record(id,tenant_id,member_ref,branch_id,kind) VALUES('crossfk',$1,'only-b','branch-a','active')",[A]);throw Error("cross-tenant FK unexpectedly accepted");}
    catch(e){ if(!e.code)throw e; code=e.code; }
    await c.query("ROLLBACK TO SAVEPOINT crossfk");
    assert.equal(code,"23503");
    return {crossTenantFk:code,existenceDisclosure:"PostgreSQL FK/unique errors may disclose existence; production mitigation unresolved"};
  }));
  await caseRun("admin_forward_policy_migration",async () => {
    const before=await root.query("SELECT pg_get_expr(polqual,polrelid) AS expr FROM pg_policy WHERE polrelid='rls_validation.validation_tenant_record'::regclass");
    assert.equal(before.rowCount,1);
    const file=fs.readFileSync(path.resolve(__dirname,"../sql/002-forward-policy-change.sql"),"utf8");
    const c=await admin.connect();
    try{await c.query(file);}finally{c.release();}
    const after=await root.query("SELECT pg_get_expr(polqual,polrelid) AS expr FROM pg_policy WHERE polrelid='rls_validation.validation_tenant_record'::regclass");
    check(after.rows[0].expr!==before.rows[0].expr,"policy did not change");
    const a=await scoped(one,A,async c=>countRecords(c));
    const b=await scoped(one,B,async c=>countRecords(c));
    check(a>0&&b>0,"forward migration blocked legitimate tenants");
    const safe=await scoped(one,A,async c=>(await c.query("SELECT count(*)::int AS n FROM rls_validation.validation_tenant_record WHERE tenant_id=$1",[B])).rows[0].n);
    assert.equal(safe,0);
    return {before:before.rows[0].expr,after:after.rows[0].expr,tenantA:a,tenantB:b,unauthorized:0};
  });
  await caseRun("validation_policy_drift_detection",async () => {
    const c=await admin.connect();
    try {
      await c.query("BEGIN");
      await c.query("SET LOCAL ROLE validation_schema_owner");
      await c.query("CREATE TABLE rls_validation.validation_drift_probe (tenant_id uuid NOT NULL)");
      await c.query("ALTER TABLE rls_validation.validation_drift_probe ENABLE ROW LEVEL SECURITY");
      await c.query("CREATE POLICY drift_expected ON rls_validation.validation_drift_probe USING (tenant_id= NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid)");
      const before=await c.query("SELECT pg_get_expr(polqual,polrelid) AS expr FROM pg_policy WHERE polname='drift_expected' AND polrelid='rls_validation.validation_drift_probe'::regclass");
      await c.query("ALTER POLICY drift_expected ON rls_validation.validation_drift_probe USING (true)");
      const after=await c.query("SELECT pg_get_expr(polqual,polrelid) AS expr FROM pg_policy WHERE polname='drift_expected' AND polrelid='rls_validation.validation_drift_probe'::regclass");
      check(before.rows[0].expr!==after.rows[0].expr,"drift not detected");
      await c.query("ALTER POLICY drift_expected ON rls_validation.validation_drift_probe USING (tenant_id= NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid)");
      const restored=await c.query("SELECT pg_get_expr(polqual,polrelid) AS expr FROM pg_policy WHERE polname='drift_expected' AND polrelid='rls_validation.validation_drift_probe'::regclass");
      assert.equal(restored.rows[0].expr,before.rows[0].expr);
      await c.query("DROP TABLE rls_validation.validation_drift_probe");
      await c.query("COMMIT");
      return { baseline:before.rows[0].expr,mutated:after.rows[0].expr,detected:true,restored:true };
    } catch(e){await c.query("ROLLBACK").catch(()=>{});throw e;}finally{c.release();}
  });
  await caseRun("representative_query_plans", async () => scoped(one,A,async c=>{
    const queries={
      member_search:"SELECT member_ref FROM rls_validation.validation_member_ref WHERE member_ref LIKE 'member%' LIMIT 10",
      no_show_queue:"SELECT id FROM rls_validation.validation_tenant_record WHERE kind='no-show' LIMIT 10",
      renewal_queue:"SELECT id FROM rls_validation.validation_tenant_record WHERE kind='renewal' LIMIT 10",
      payment_reconciliation:"SELECT count(*) FROM rls_validation.validation_history WHERE event_type='payment'",
      dashboard_aggregate:"SELECT kind,count(*) FROM rls_validation.validation_tenant_record GROUP BY kind"
    };
    const results={};
    for(const [key,sql] of Object.entries(queries)){
      const plan=await c.query("EXPLAIN (ANALYZE,FORMAT JSON) "+sql);
      const obj=plan.rows[0]["QUERY PLAN"][0];
      results[key]={plan:obj.Plan["Node Type"],rows:obj.Plan["Actual Rows"],ms:obj["Execution Time"],totalCost:obj.Plan["Total Cost"]};
    }
    return {queryPlans:results,caveat:"tiny synthetic fixtures; not production benchmark"};
  }));
  await caseRun("policy_force_state_after_forward",async()=>{
    const r=await root.query("SELECT relrowsecurity,relforcerowsecurity FROM pg_class WHERE oid='rls_validation.validation_tenant_record'::regclass");
    check(r.rows[0].relrowsecurity&&r.rows[0].relforcerowsecurity,"RLS was weakened by migration");
    return r.rows[0];
  });
}
run().catch(e=>{console.error("HARNESS_FATAL "+e.message);process.exitCode=1;}).finally(async()=>{
  for(const pool of [root,runtime,one,worker,admin]){try{await pool.end();}catch(e){process.exitCode=1;}}
  const required=[
    "real_postgresql_and_runtime_roles","migration_from_zero","application_authorization_independent_of_rls",
    "tenant_a_select_isolation","tenant_b_select_isolation","insert_with_check","update_cross_tenant_denial",
    "tenant_ownership_update_denial","delete_cross_tenant_denial","missing_tenant_context_fail_closed",
    "invalid_tenant_context_fail_closed","broad_query_rls_independent_of_sql_predicates",
    "runtime_and_worker_cannot_alter_policies_or_switch_role","table_owner_bypass_and_force_rls",
    "transaction_commit_context_clears","same_physical_pool_connection_a_then_b",
    "rollback_context_and_business_rows_clear","genuine_parallel_a_b_sessions",
    "background_worker_scope_and_reuse","verified_callback_resource_scope",
    "security_invoker_view_isolation","tenant_aware_referential_integrity",
    "admin_forward_policy_migration","validation_policy_drift_detection",
    "representative_query_plans","policy_force_state_after_forward"];
  const present=new Set(matrix.map(x=>x.test));
  for(const name of required)if(!present.has(name))matrix.push({test:name,result:"NOT RUN"});
  const passed=matrix.filter(x=>x.result==="PASS").length;
  const report={
    title:"GymPulse synthetic PostgreSQL RLS validation",
    environment:"isolated Docker PostgreSQL; no production resources",
    sourceCommit:process.env.GITHUB_SHA||"local-validation",
    nodeVersion:process.version,
    scope:"ADR-0010 / D-SEC-008 evidence only; decisions unchanged",
    matrix,evidence,passed,total:matrix.length,
    status:passed===matrix.length?"PASS":"FAIL",
    residualRisks:[
      "Database custom GUC is not independently authenticated and can be changed by arbitrary SQL run as the same role",
      "Provider signature verification and production business authorization are NOT tested",
      "Production provider/pooler semantics and performance NOT tested",
      "Security-definer functions and backup confidentiality NOT tested"
    ]
  };
  fs.writeFileSync(path.join(dir,"test-results.json"),JSON.stringify(report,null,2)+"\n");
  fs.writeFileSync(path.join(dir,"test-matrix.md"),
    "| Test | Result |\n|---|---|\n"+matrix.map(x=>"| "+x.test+" | "+x.result+" |").join("\n")+"\n");
  console.log("RLS_MATRIX "+passed+"/"+matrix.length+" "+report.status);
});
