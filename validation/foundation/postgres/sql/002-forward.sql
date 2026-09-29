-- GymPulse foundation validation only.
-- Representative forward-compatible change. This is not a production migration.

ALTER TABLE validation_member_ref
  ADD COLUMN validation_note text;

CREATE INDEX validation_history_tenant_member_time_idx
  ON validation_history (tenant_id, member_ref, occurred_at DESC);

CREATE TABLE validation_forward_marker (
  marker_key text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

INSERT INTO validation_forward_marker(marker_key)
VALUES ('forward-migration-002-applied');
