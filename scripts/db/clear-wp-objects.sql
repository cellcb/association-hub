\pset pager off

DO $$
DECLARE
  obj record;
  owner_name text := current_user;
BEGIN
  -- Drop all views (plain + materialized) owned by the current user
  FOR obj IN
    SELECT n.nspname AS schema_name,
           c.relname,
           c.relkind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pg_get_userbyid(c.relowner) = owner_name
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND c.relkind IN ('v', 'm')
    ORDER BY n.nspname, c.relname
  LOOP
    IF obj.relkind = 'm' THEN
      EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE', obj.schema_name, obj.relname);
    ELSE
      EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', obj.schema_name, obj.relname);
    END IF;
  END LOOP;

  -- Drop all tables (including partitioned tables) owned by the current user
  FOR obj IN
    SELECT n.nspname AS schema_name,
           c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pg_get_userbyid(c.relowner) = owner_name
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND c.relkind IN ('r', 'p')
    ORDER BY n.nspname, c.relname
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', obj.schema_name, obj.relname);
  END LOOP;
END;
$$;
