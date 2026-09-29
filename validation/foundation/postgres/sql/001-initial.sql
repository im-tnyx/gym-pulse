-- GymPulse foundation validation only.
-- This schema is disposable, non-production, and non-canonical.
-- It must not be treated as the final Member, Membership, Attendance, Payment, or RLS schema.

CREATE TABLE validation_tenant (
  id text PRIMARY KEY,
  display_name text NOT NULL
);

CREATE TABLE validation_member_ref (
  tenant_id text NOT NULL REFERENCES validation_tenant(id) ON DELETE CASCADE,
  member_ref text NOT NULL,
  eligibility_marker text NOT NULL
    CHECK (eligibility_marker IN ('eligible', 'ineligible', 'unknown')),
  PRIMARY KEY (tenant_id, member_ref)
);

CREATE TABLE validation_attendance (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id text NOT NULL,
  member_ref text NOT NULL,
  logical_key text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  note text,
  CONSTRAINT validation_attendance_member_fk
    FOREIGN KEY (tenant_id, member_ref)
    REFERENCES validation_member_ref(tenant_id, member_ref)
    ON DELETE CASCADE,
  CONSTRAINT validation_attendance_business_key_uq
    UNIQUE (tenant_id, member_ref, logical_key)
);

CREATE TABLE validation_provider_event (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT validation_provider_event_identity_uq
    UNIQUE (provider, provider_event_id)
);

CREATE TABLE validation_effect_target (
  tenant_id text NOT NULL REFERENCES validation_tenant(id) ON DELETE CASCADE,
  target_ref text NOT NULL,
  effect_count integer NOT NULL DEFAULT 0 CHECK (effect_count >= 0),
  PRIMARY KEY (tenant_id, target_ref)
);

CREATE TABLE validation_business_effect (
  effect_key text PRIMARY KEY,
  tenant_id text NOT NULL,
  target_ref text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT validation_business_effect_target_fk
    FOREIGN KEY (tenant_id, target_ref)
    REFERENCES validation_effect_target(tenant_id, target_ref)
    ON DELETE CASCADE
);

CREATE TABLE validation_no_show_case (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id text NOT NULL,
  member_ref text NOT NULL,
  rule_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  resolved_at timestamptz,
  CONSTRAINT validation_no_show_member_fk
    FOREIGN KEY (tenant_id, member_ref)
    REFERENCES validation_member_ref(tenant_id, member_ref)
    ON DELETE CASCADE,
  CONSTRAINT validation_no_show_resolution_ck
    CHECK (
      (status = 'active' AND resolved_at IS NULL)
      OR
      (status = 'resolved' AND resolved_at IS NOT NULL)
    )
);

CREATE UNIQUE INDEX validation_no_show_one_active_uq
  ON validation_no_show_case (tenant_id, member_ref, rule_key)
  WHERE status = 'active';

CREATE TABLE validation_history (
  tenant_id text NOT NULL,
  member_ref text NOT NULL,
  seq integer NOT NULL CHECK (seq > 0),
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL,
  detail text,
  PRIMARY KEY (tenant_id, member_ref, seq),
  CONSTRAINT validation_history_member_fk
    FOREIGN KEY (tenant_id, member_ref)
    REFERENCES validation_member_ref(tenant_id, member_ref)
    ON DELETE CASCADE
);
