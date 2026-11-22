import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";
import { postgresQuery } from "./postgres-sql.mjs";
import { postgresTLSOptions } from "./postgres-tls.mjs";

const activeDatabase = Symbol.for("synapse.hostinger.postgres");
const namespace = "synapse";
const schemaLock = "800214613051";
const writeLock = "800214613052";

function parseNumber(text) {
  const number = Number(text);
  // Keep the decimal string when it cannot be safely represented in JS.
  return Number.isSafeInteger(number) ? number : text;
}

function connectionOptions() {
  return {
    ...postgresTLSOptions(process.env.DATABASE_URL),
    connectionTimeoutMillis: 10000,
    types: {
      getTypeParser(oid, format) {
        return format !== "binary" && (oid === 20 || oid === 1700) ? parseNumber : pg.types.getTypeParser(oid, format);
      },
    },
  };
}

async function transaction(client, execute) {
  await client.query("BEGIN");
  try {
    const result = await execute();
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

export async function migrateDatabase(directory) {
  const client = new pg.Client(connectionOptions());
  try {
    await client.connect();
    await transaction(client, async () => {
      await client.query("SELECT pg_advisory_xact_lock($1)", [schemaLock]);
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${namespace}`);
      await client.query(`REVOKE ALL ON SCHEMA ${namespace} FROM PUBLIC`);
      await client.query(`SET LOCAL search_path TO pg_catalog, ${namespace}`);
      await client.query(`CREATE TABLE IF NOT EXISTS ${namespace}.synapse_migrations (name text PRIMARY KEY)`);
      // Put the app schema first for unqualified CREATE statements in migrations.
      await client.query(`SET LOCAL search_path TO ${namespace}, pg_catalog`);
      const files = (await readdir(directory)).filter(name => /^\d+_.*\.sql$/.test(name)).sort();
      if (!files.length) throw new Error("No SYNAPSE PostgreSQL migrations found.");
      const done = new Set((await client.query("SELECT name FROM synapse_migrations")).rows.map(row => row.name));
      for (const name of files) {
        if (done.has(name)) continue;
        try {
          await client.query(await readFile(join(directory, name), "utf8"));
          await client.query("INSERT INTO synapse_migrations (name) VALUES ($1)", [name]);
        } catch (error) {
          throw new Error(`PostgreSQL migration ${name} failed (${error.code ?? "read error"}).`, { cause: error });
        }
      }
    });
  } finally {
    await client.end();
  }
}

function normalize(value) {
  if (typeof value === "boolean") return Number(value);
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (value instanceof Uint8Array) return Buffer.from(value);
  return value;
}

function createBinding(pool) {
  const statements = new WeakMap();

  async function executeBatch(batch) {
    const client = await pool.connect();
    try {
      return await transaction(client, async () => {
        await client.query(`SET LOCAL search_path TO pg_catalog, ${namespace}`);
        if (batch.some(item => !/^\s*SELECT\b/i.test(item.sql))) {
          await client.query("SELECT pg_advisory_xact_lock($1)", [writeLock]);
        }
        let changes = 0;
        const results = [];
        for (const { sql, parameters, arrayMode } of batch) {
          const values = parameters.map(normalize);
          const result = await client.query({
            text: postgresQuery(sql, parameters, changes),
            values,
            rowMode: arrayMode ? "array" : undefined,
          });
          const write = ["INSERT", "UPDATE", "DELETE"].includes(result.command);
          if (write) changes = result.rowCount;
          const indexes = result.fields.flatMap((field, index) => field.name === "_synapse_rowid" ? [] : [index]);
          const rows = result.rows.map(row => {
            if (arrayMode) return indexes.map(index => row[index]);
            delete row._synapse_rowid;
            return row;
          });
          results.push({ success: true, results: rows, meta: { changes: write ? changes : 0 },
            columns: indexes.map(index => result.fields[index].name) });
        }
        return results;
      });
    } finally {
      client.release();
    }
  }

  function prepare(sql, parameters = []) {
    async function execute(arrayMode = false) {
      const [result] = await executeBatch([{ sql, parameters, arrayMode }]);
      return result;
    }

    const statement = {
      bind: (...values) => prepare(sql, values),
      async first(column) {
        const row = (await execute()).results[0];
        if (!row) return null;
        if (column === undefined) return row;
        if (!Object.hasOwn(row, column)) throw new Error(`Result has no column ${column}`);
        return row[column];
      },
      async all() { const { columns, ...result } = await execute(); return result; },
      async run() { return this.all(); },
      async raw({ columnNames = false } = {}) {
        const { results, columns } = await execute(true);
        return columnNames ? [columns, ...results] : results;
      },
    };
    statements.set(statement, { sql, parameters });
    return statement;
  }

  return {
    prepare,
    async batch(batch) {
      const queries = batch.map(statement => {
        const query = statements.get(statement);
        if (!query) throw new Error("Batch requires statements prepared by this database.");
        return query;
      });
      return (await executeBatch(queries)).map(({ columns, ...result }) => result);
    },
  };
}

export function getPostgresBinding() {
  if (!globalThis[activeDatabase]) {
    const pool = new pg.Pool({ ...connectionOptions(), max: 5 });
    pool.on("error", error => console.error("Idle PostgreSQL connection failed", error.code ?? ""));
    globalThis[activeDatabase] = createBinding(pool);
  }
  return globalThis[activeDatabase];
}
