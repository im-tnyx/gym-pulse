import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Client } = require("../.node-client/node_modules/pg");

const baseConfig = {
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? "55432"),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  connectionTimeoutMillis: 2500,
};

function ensureConfig() {
  for (const key of ["user", "password", "database"]) {
    if (!baseConfig[key]) {
      throw new Error(`Missing PostgreSQL client configuration: ${key}`);
    }
  }
}

async function connectOnce() {
  const client = new Client(baseConfig);
  await client.connect();
  return client;
}

async function connectionProof() {
  ensureConfig();

  const client = await connectOnce();
  const first = await client.query(
    "select current_setting('server_version') as server_version, current_database() as database_name"
  );
  await client.query("begin");
  await client.query("select 1 as transaction_probe");
  await client.query("commit");
  await client.end();

  const reconnect = await connectOnce();
  const second = await reconnect.query("select 1 as reconnect_probe");
  await reconnect.end();

  const clients = Array.from({ length: 6 }, () => new Client(baseConfig));
  await Promise.all(clients.map((candidate) => candidate.connect()));
  const concurrent = await Promise.all(
    clients.map((candidate) =>
      candidate.query("select pg_backend_pid() as pid, pg_sleep(0.2)")
    )
  );
  await Promise.all(clients.map((candidate) => candidate.end()));

  console.log(
    JSON.stringify({
      kind: "connection-proof",
      serverVersion: first.rows[0].server_version,
      database: first.rows[0].database_name,
      reconnectProbe: second.rows[0].reconnect_probe,
      concurrentConnections: concurrent.length,
      backendPids: concurrent.map((result) => result.rows[0].pid),
    })
  );
}

async function errorTranslationProof() {
  ensureConfig();
  const client = await connectOnce();

  const observed = {};

  async function observe(label, sql, params, category) {
    try {
      await client.query(sql, params);
      throw new Error(`Expected PostgreSQL error for ${label}, but statement succeeded`);
    } catch (error) {
      if (!error?.code) throw error;
      observed[label] = {
        sqlstate: error.code,
        applicationCategory: category,
        constraint: error.constraint ?? null,
      };
    }
  }

  await observe(
    "unique_violation",
    "insert into validation_tenant(id, display_name) values ($1, $2)",
    ["tenant-a", "Duplicate synthetic tenant"],
    "already_applied"
  );

  await observe(
    "foreign_key_violation",
    "insert into validation_member_ref(tenant_id, member_ref, eligibility_marker) values ($1, $2, $3)",
    ["missing-tenant", "member-invalid-fk", "unknown"],
    "invalid_reference"
  );

  await observe(
    "check_violation",
    "insert into validation_member_ref(tenant_id, member_ref, eligibility_marker) values ($1, $2, $3)",
    ["tenant-a", "member-invalid-check", "not-an-allowed-marker"],
    "invalid_value"
  );

  await client.end();

  const required = {
    unique_violation: "23505",
    foreign_key_violation: "23503",
    check_violation: "23514",
  };

  for (const [label, expected] of Object.entries(required)) {
    if (observed[label]?.sqlstate !== expected) {
      throw new Error(
        `Unexpected SQLSTATE for ${label}: observed=${observed[label]?.sqlstate}, expected=${expected}`
      );
    }
  }

  console.log(JSON.stringify({ kind: "error-translation", observed }));
}

async function expectUnavailable() {
  ensureConfig();
  const client = new Client({ ...baseConfig, connectionTimeoutMillis: 1500 });
  try {
    await client.connect();
    await client.end();
    throw new Error("PostgreSQL unexpectedly remained reachable during interruption test");
  } catch (error) {
    if (error?.message === "PostgreSQL unexpectedly remained reachable during interruption test") {
      throw error;
    }
    console.log(
      JSON.stringify({
        kind: "expected-unavailable",
        observed: true,
        errorName: error?.name ?? "Error",
      })
    );
  }
}

async function reconnectProof() {
  ensureConfig();
  const client = await connectOnce();
  const result = await client.query(
    "select current_database() as database_name, current_setting('server_version') as server_version"
  );
  await client.end();
  console.log(JSON.stringify({ kind: "reconnect-proof", ...result.rows[0] }));
}

const mode = process.argv[2] ?? "connection";

if (mode === "connection") {
  await connectionProof();
} else if (mode === "errors") {
  await errorTranslationProof();
} else if (mode === "expect-unavailable") {
  await expectUnavailable();
} else if (mode === "reconnect") {
  await reconnectProof();
} else {
  throw new Error(`Unknown validation-client mode: ${mode}`);
}
