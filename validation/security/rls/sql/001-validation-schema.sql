-- VALIDATION ONLY. Applied to a new, disposable PostgreSQL database.
-- Passwords are supplied by psql variables from the authorized runner and never committed.
BEGIN;
CREATE ROLE validation_schema_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE validation_runtime LOGIN NOSUPERUSER NOBYPASSRLS NOINHERIT PASSWORD :'runtime_password';
CREATE ROLE validation_worker LOGIN NOSUPERUSER NOBYPASSRLS NOINHERIT PASSWORD :'worker_password';
CREATE ROLE validation_migration_admin LOGIN NOSUPERUSER NOBYPASSRLS NOINHERIT PASSWORD :'admin_password';
GRANT validation_schema_owner TO validation_migration_admin WITH INHERIT FALSE, SET TRUE;

CREATE SCHEMA rls_validation AUTHORIZATION validation_schema_owner;
SET LOCAL ROLE validation_schema_owner;

CREATE TABLE rls_validation.validation_tenant (
    id uuid PRIMARY KEY,
    label text NOT NULL
);
CREATE TABLE rls_validation.validation_member_ref (
    tenant_id uuid NOT NULL REFERENCES rls_validation.validation_tenant(id),
    member_ref text NOT NULL,
    branch_id text NOT NULL,
    PRIMARY KEY (tenant_id, member_ref)
);
CREATE TABLE rls_validation.validation_tenant_record (
    id text PRIMARY KEY,
    tenant_id uuid NOT NULL,
    member_ref text NOT NULL,
    branch_id text NOT NULL,
    kind text NOT NULL,
    CONSTRAINT tenant_member_fk FOREIGN KEY (tenant_id,member_ref)
        REFERENCES rls_validation.validation_member_ref(tenant_id,member_ref)
);
CREATE INDEX rls_validation_record_tenant_kind ON rls_validation.validation_tenant_record(tenant_id,kind);
CREATE TABLE rls_validation.validation_history (
    id text PRIMARY KEY,
    tenant_id uuid NOT NULL,
    member_ref text NOT NULL,
    event_type text NOT NULL,
    CONSTRAINT tenant_history_member_fk FOREIGN KEY (tenant_id,member_ref)
        REFERENCES rls_validation.validation_member_ref(tenant_id,member_ref)
);
CREATE INDEX rls_validation_history_tenant_type ON rls_validation.validation_history(tenant_id,event_type);
CREATE TABLE rls_validation.validation_job_ref (
    id text PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES rls_validation.validation_tenant(id),
    status text NOT NULL
);
CREATE INDEX rls_validation_job_tenant ON rls_validation.validation_job_ref(tenant_id);

INSERT INTO rls_validation.validation_tenant(id,label) VALUES
 ('11111111-1111-4111-8111-111111111111','synthetic tenant A'),
 ('22222222-2222-4222-8222-222222222222','synthetic tenant B');
INSERT INTO rls_validation.validation_member_ref(tenant_id,member_ref,branch_id) VALUES
 ('11111111-1111-4111-8111-111111111111','member-a','branch-a'),
 ('11111111-1111-4111-8111-111111111111','other-a','branch-a'),
 ('22222222-2222-4222-8222-222222222222','member-b','branch-b'),
 ('22222222-2222-4222-8222-222222222222','only-b','branch-b');
INSERT INTO rls_validation.validation_tenant_record(id,tenant_id,member_ref,branch_id,kind) VALUES
 ('a-record','11111111-1111-4111-8111-111111111111','member-a','branch-a','active'),
 ('a-queue','11111111-1111-4111-8111-111111111111','other-a','branch-a','no-show'),
 ('b-record','22222222-2222-4222-8222-222222222222','member-b','branch-b','active');
INSERT INTO rls_validation.validation_history(id,tenant_id,member_ref,event_type) VALUES
 ('ha1','11111111-1111-4111-8111-111111111111','member-a','payment'),
 ('ha2','11111111-1111-4111-8111-111111111111','other-a','no-show'),
 ('hb1','22222222-2222-4222-8222-222222222222','member-b','payment');
INSERT INTO rls_validation.validation_job_ref(id,tenant_id,status) VALUES
 ('ja1','11111111-1111-4111-8111-111111111111','queued'),
 ('jb1','22222222-2222-4222-8222-222222222222','queued');

CREATE VIEW rls_validation.runtime_record_view WITH (security_invoker=true) AS
 SELECT id,tenant_id,member_ref,kind FROM rls_validation.validation_tenant_record;

RESET ROLE;
GRANT USAGE ON SCHEMA rls_validation TO validation_runtime,validation_worker;
GRANT SELECT,INSERT,UPDATE,DELETE ON
 rls_validation.validation_member_ref,rls_validation.validation_tenant_record,
 rls_validation.validation_history,rls_validation.validation_job_ref
 TO validation_runtime,validation_worker;
GRANT SELECT ON rls_validation.runtime_record_view TO validation_runtime,validation_worker;

ALTER TABLE rls_validation.validation_member_ref ENABLE ROW LEVEL SECURITY;
ALTER TABLE rls_validation.validation_tenant_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE rls_validation.validation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rls_validation.validation_job_ref ENABLE ROW LEVEL SECURITY;
-- Owner/FORCE behavior on tenant_record is tested before FORCE is applied.
ALTER TABLE rls_validation.validation_member_ref FORCE ROW LEVEL SECURITY;
ALTER TABLE rls_validation.validation_history FORCE ROW LEVEL SECURITY;
ALTER TABLE rls_validation.validation_job_ref FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_scope ON rls_validation.validation_member_ref
 TO validation_runtime,validation_worker
 USING (tenant_id = NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid)
 WITH CHECK (tenant_id = NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid);
CREATE POLICY tenant_scope ON rls_validation.validation_tenant_record
 TO validation_runtime,validation_worker
 USING (tenant_id = NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid)
 WITH CHECK (tenant_id = NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid);
CREATE POLICY tenant_scope ON rls_validation.validation_history
 TO validation_runtime,validation_worker
 USING (tenant_id = NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid)
 WITH CHECK (tenant_id = NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid);
CREATE POLICY tenant_scope ON rls_validation.validation_job_ref
 TO validation_runtime,validation_worker
 USING (tenant_id = NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid)
 WITH CHECK (tenant_id = NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid);
COMMIT;
