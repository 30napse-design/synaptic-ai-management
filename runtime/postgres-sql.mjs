const numericPaths = new Set([
  "'$.acceptanceNeedsAssignment'", "'$.active'", "'$.aggregate_revision'", "'$.approved'",
  "'$.amount_rial'", "'$.expires'", "'$.progress'", "'$.requested_rial'", "'$.revision'", "'$.synthetic'", "'$.work_version'", "'$.unifiedIntake.version'", "'$.intake_v'", "'$.ticket_v'",
]);

// Parse only the legacy constructs used by the application, leaving quoted SQL
// strings and identifiers intact. Values remain PostgreSQL bind parameters.
export function postgresQuery(sql, args, changes) {
  const info = /^PRAGMA table_info\((\w+)\)$/i.exec(sql);
  if (info) sql = `SELECT * FROM pragma_table_info('${info[1]}')`;
  const ignore = /^\s*INSERT OR IGNORE INTO\b/i.test(sql);
  if (ignore) sql = sql.replace(/^\s*INSERT OR IGNORE INTO\b/i, "INSERT INTO");
  const tokens = sql.match(/'(?:''|[^'])*'|"(?:""|[^"])*"|--[^\n]*|\/\*[\s\S]*?\*\/|\?\d*|[a-z_]\w*|\s+|./gis) ?? [];
  let cursor = 0;
  let parameter = 0;

  function expression(inArguments = false) {
    let result = "";
    while (cursor < tokens.length) {
      const token = tokens[cursor];
      if (inArguments && (token === "," || token === ")")) break;
      cursor++;

      if (/^\?\d*$/.test(token)) {
        const index = token.length > 1 ? Number(token.slice(1)) : ++parameter;
        const value = args[index - 1];
        const type = typeof value === "number" ? (Number.isInteger(value) ? "::bigint" : "::double precision")
          : typeof value === "bigint" || typeof value === "boolean" ? "::bigint"
          : value instanceof Uint8Array || value instanceof ArrayBuffer ? "::bytea" : "";
        result += `$${index}${type}`;
      } else if (token === "(") {
        result += `(${expression()})`;
        cursor++;
      } else if (token === ")") {
        cursor--;
        break;
      } else if (/^as$/i.test(token) && /^\s+$/.test(tokens[cursor] ?? "") &&
        /^[a-z][a-z0-9]*[A-Z]\w*$/.test(tokens[cursor + 1] ?? "")) {
        result += `AS "${tokens[cursor + 1]}"`;
        cursor += 2;
      } else if (/^like$/i.test(token)) {
        result += 'ILIKE';
      } else if (/^rowid$/i.test(token)) {
        result += "_synapse_rowid";
      } else if (/^integer$/i.test(token)) {
        result += "bigint";
      } else if (/^(changes|json_extract|json_valid|json_set|json|json_object|json_group_array)$/i.test(token) && tokens[cursor] === "(") {
        const parameters = [];
        do {
          cursor++;
          parameters.push(expression(true).trim());
        } while (tokens[cursor] === ",");
        cursor++;
        result += translateFunction(token.toLowerCase(), parameters, changes);
      } else {
        result += token;
      }
    }
    return result;
  }

  const translated = expression().trimEnd();
  return ignore ? translated.replace(/;$/, "") + " ON CONFLICT DO NOTHING" : translated;
}

function translateFunction(name, args, changes) {
  switch (name) {
    case "changes": return String(changes);
    case "json_extract":
      return (numericPaths.has(args[1]) ? "synapse_json_number" : name) + `(${args.join(", ")})`;
    case "json_valid": return `(json_valid(${args[0]}) = 1)`;
    case "json_set": {
      let [document] = args;
      for (let index = 1; index < args.length; index += 2) {
        const arg = args[index + 1];
        const typed = /^(?:'[^']*(?:''[^']*)*'|\$\d+|null)$/i.test(arg) ? `${arg}::text` : arg;
        document = `synapse_json_set(${document}, ${args[index]}, to_jsonb(${typed}))`;
      }
      return document;
    }
    case "json": return `(${args[0]})::jsonb`;
    case "json_object": return `json_build_object(${args.join(", ")})`;
    case "json_group_array": return `COALESCE(json_agg(${args[0]})::text, '[]')`;
  }
}
