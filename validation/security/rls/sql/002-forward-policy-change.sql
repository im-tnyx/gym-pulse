-- Disposable forward migration. The zero UUID guard tightens, never broadens, existing scoped access.
BEGIN;
SET LOCAL ROLE validation_schema_owner;
ALTER POLICY tenant_scope ON rls_validation.validation_tenant_record
 USING (tenant_id = NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid
        AND tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid)
 WITH CHECK (tenant_id = NULLIF(current_setting('gympulse.tenant_id',true),'')::uuid
        AND tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid);
COMMIT;
