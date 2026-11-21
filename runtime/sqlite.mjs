import { readdirSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const busyTimeout = 5000;
const activeDatabase = Symbol.for("synapse.hostinger.database");

function openDatabase() {
  const path = process.env.SYNAPSE_SQLITE_PATH;
  if (!path || !isAbsolute(path)) {
    throw new Error("SYNAPSE_SQLITE_PATH must be an absolute path to a private, persistent SQLite file.");
  }

  const database = new DatabaseSync(path, { enableForeignKeyConstraints: true });
  database.exec(`PRAGMA busy_timeout = ${busyTimeout}`);
  return database;
}

function transaction(database, execute) {
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = execute();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function migrateDatabase(directory) {
  const database = openDatabase();
  try {
    database.exec("PRAGMA journal_mode = WAL");
    database.exec(`
      CREATE TABLE IF NOT EXISTS synapse_sqlite_migrations (
        name TEXT PRIMARY KEY
      )
    `);
    const applied = database.prepare("SELECT name FROM synapse_sqlite_migrations WHERE name = ?");
    const record = database.prepare("INSERT INTO synapse_sqlite_migrations (name) VALUES (?)");
    const files = readdirSync(directory).filter(name => /^\d+_.*\.sql$/.test(name)).sort();
    if (!files.length) throw new Error("No SYNAPSE SQL migrations found.");
    for (const name of files) {
      transaction(database, () => {
        if (applied.get(name)) return;
        database.exec(readFileSync(join(directory, name), "utf8"));
        record.run(name);
      });
    }
    if (database.prepare("PRAGMA foreign_key_check").get()) {
      throw new Error("SQLite foreign key check failed.");
    }
  } finally {
    database.close();
  }
}

function createBinding(database) {
  const statements = new WeakMap();

  function prepare(sql, parameters = []) {
    function execute(arrayMode = false) {
      const statement = database.prepare(sql);
      if (statement.columns().length) {
        if (arrayMode) statement.setReturnArrays(true);
        return { success: true, results: statement.all(...parameters), meta: { changes: 0 } };
      }

      const { changes, lastInsertRowid } = statement.run(...parameters);
      return { success: true, results: [], meta: { changes, last_row_id: lastInsertRowid } };
    }

    const prepared = {
      bind: (...values) => prepare(sql, values.map(value =>
        typeof value === "boolean" ? Number(value) : value instanceof ArrayBuffer ? new Uint8Array(value) : value
      )),
      async first(column) {
        const row = execute().results[0];
        if (!row) return null;
        if (column === undefined) return row;
        if (!Object.hasOwn(row, column)) throw new Error(`SQLite result has no column ${column}`);
        return row[column];
      },
      async all() { return execute(); },
      async run() { return execute(); },
      async raw({ columnNames = false } = {}) {
        const { results } = execute(true);
        return columnNames ? [database.prepare(sql).columns().map(column => column.name), ...results] : results;
      },
    };
    statements.set(prepared, execute);
    return prepared;
  }

  return {
    prepare,
    async batch(batch) {
      return transaction(database, () => batch.map(statement => {
        const execute = statements.get(statement);
        if (!execute) throw new Error("SQLite batch requires statements prepared by this database.");
        return execute();
      }));
    },
  };
}

export function getSqliteBinding() {
  globalThis[activeDatabase] ??= createBinding(openDatabase());
  return globalThis[activeDatabase];
}
