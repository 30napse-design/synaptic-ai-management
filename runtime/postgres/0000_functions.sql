CREATE FUNCTION synapse_json_path(path text) RETURNS text[]
LANGUAGE sql IMMUTABLE STRICT
RETURN CASE WHEN path = '$' THEN ARRAY[]::text[] ELSE
  string_to_array(regexp_replace(substr(path, 3), '\[([0-9]+)\]', '.\1', 'g'), '.')
END;

CREATE FUNCTION json_extract(document text, path text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT
RETURN document::jsonb #>> synapse_json_path(path);

CREATE FUNCTION synapse_json_number(document text, path text) RETURNS bigint
LANGUAGE sql IMMUTABLE STRICT
RETURN CASE json_extract(document, path)
  WHEN 'true' THEN 1 WHEN 'false' THEN 0
  ELSE json_extract(document, path)::bigint END;

CREATE FUNCTION json_type(document text, path text DEFAULT '$') RETURNS text
LANGUAGE sql IMMUTABLE STRICT
RETURN CASE jsonb_typeof(document::jsonb #> synapse_json_path(path))
  WHEN 'string' THEN 'text'
  WHEN 'number' THEN CASE WHEN json_extract(document, path) ~ '^-?[0-9]+$' THEN 'integer' ELSE 'real' END
  WHEN 'boolean' THEN json_extract(document, path)
  ELSE jsonb_typeof(document::jsonb #> synapse_json_path(path))
END;

CREATE FUNCTION json_valid(document text) RETURNS bigint
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF document IS NULL THEN RETURN 0; END IF;
  PERFORM document::jsonb;
  RETURN 1;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN 0;
END;
$$;

CREATE FUNCTION json_each(document text, path text DEFAULT '$') RETURNS TABLE (key text, value text)
LANGUAGE sql IMMUTABLE STRICT
AS $$
  WITH selected AS (SELECT document::jsonb #> synapse_json_path(path) AS data)
  SELECT item.key, item.value FROM selected,
    LATERAL jsonb_each_text(CASE WHEN jsonb_typeof(data) = 'object' THEN data END) AS item
  UNION ALL
  SELECT (ordinal - 1)::text, element #>> '{}' FROM selected,
    LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(data) = 'array' THEN data END)
    WITH ORDINALITY AS item(element, ordinal)
  UNION ALL
  SELECT NULL::text, data #>> '{}' FROM selected
    WHERE jsonb_typeof(data) NOT IN ('object', 'array');
$$;

CREATE FUNCTION json_remove(document text, path text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT
RETURN (document::jsonb #- synapse_json_path(path))::text;

CREATE FUNCTION synapse_json_set(document text, path text, value jsonb) RETURNS text
LANGUAGE sql IMMUTABLE
RETURN jsonb_set(document::jsonb, synapse_json_path(path), coalesce(value, 'null'::jsonb), true)::text;

CREATE FUNCTION pragma_table_info(table_name text) RETURNS TABLE (name text)
LANGUAGE sql STABLE STRICT
AS $$
  SELECT column_name::text FROM information_schema.columns
  WHERE table_schema = 'synapse' AND columns.table_name = $1
  ORDER BY ordinal_position;
$$;

CREATE VIEW sqlite_master AS
SELECT 'table'::text AS type, table_name::text AS name
FROM information_schema.tables WHERE table_schema = 'synapse' AND table_type = 'BASE TABLE';
