CREATE TABLE "research_people" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"create_key" text NOT NULL,
	"revision" bigint DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "research_person_name" CHECK(length(trim("research_people"."name"))>0)
);
CREATE TABLE "workflow_positions" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"permission" text NOT NULL,
	"active" bigint DEFAULT 1 NOT NULL,
	"revision" bigint DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "workflow_position_title" CHECK(length(trim("workflow_positions"."title"))>0),
	CONSTRAINT "workflow_position_active" CHECK("workflow_positions"."active" IN (0,1))
);
CREATE TABLE "research_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"researcher_id" text NOT NULL,
	"title" text NOT NULL,
	"current_position_id" text NOT NULL,
	"scope_type" text DEFAULT 'institute' NOT NULL,
	"scope_id" text DEFAULT '' NOT NULL,
	"next_action" text NOT NULL,
	"follow_up_date" text NOT NULL,
	"status" text DEFAULT 'awaiting_order_confirmation' NOT NULL,
	"create_key" text NOT NULL,
	"revision" bigint DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	FOREIGN KEY ("researcher_id") REFERENCES "research_people"("id") ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY ("current_position_id") REFERENCES "workflow_positions"("id") ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "research_order_required" CHECK(length(trim("research_orders"."title"))>0 AND length(trim("research_orders"."next_action"))>0 AND length("research_orders"."follow_up_date")=10),
	CONSTRAINT "research_order_scope" CHECK("research_orders"."scope_type" IN ('institute','laboratory') AND ("research_orders"."scope_type"!='institute' OR "research_orders"."scope_id"='') AND ("research_orders"."scope_type"!='laboratory' OR length("research_orders"."scope_id")>0)),
	CONSTRAINT "research_order_status" CHECK("research_orders"."status" IN ('awaiting_order_confirmation','awaiting_scientific_preparation','awaiting_sample','ready_for_assignment','executing','awaiting_laboratory','blocked','awaiting_scientific_control','ready_for_delivery','completed','closed'))
);
CREATE UNIQUE INDEX "research_orders_code_unique" ON "research_orders" ("code");
CREATE UNIQUE INDEX "research_orders_create_key_unique" ON "research_orders" ("create_key");
CREATE INDEX "research_orders_person" ON "research_orders" ("researcher_id","updated_at");
CREATE INDEX "research_orders_responsibility" ON "research_orders" ("current_position_id","scope_type","scope_id","status","follow_up_date");
CREATE UNIQUE INDEX "research_people_create_key_unique" ON "research_people" ("create_key");
CREATE TABLE "workflow_position_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"position_id" text NOT NULL,
	"scope_type" text DEFAULT 'institute' NOT NULL,
	"scope_id" text DEFAULT '' NOT NULL,
	"primary_member_id" text DEFAULT '' NOT NULL,
	"substitute_member_id" text DEFAULT '' NOT NULL,
	"use_substitute" bigint DEFAULT 0 NOT NULL,
	"active" bigint DEFAULT 1 NOT NULL,
	"revision" bigint DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	FOREIGN KEY ("position_id") REFERENCES "workflow_positions"("id") ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "workflow_assignment_scope" CHECK("workflow_position_assignments"."scope_type" IN ('institute','laboratory') AND ("workflow_position_assignments"."scope_type"!='institute' OR "workflow_position_assignments"."scope_id"='') AND ("workflow_position_assignments"."scope_type"!='laboratory' OR length("workflow_position_assignments"."scope_id")>0)),
	CONSTRAINT "workflow_assignment_members" CHECK(("workflow_position_assignments"."primary_member_id"='' OR "workflow_position_assignments"."primary_member_id"!="workflow_position_assignments"."substitute_member_id") AND ("workflow_position_assignments"."use_substitute"=0 OR "workflow_position_assignments"."substitute_member_id"!='')),
	CONSTRAINT "workflow_assignment_flags" CHECK("workflow_position_assignments"."active" IN (0,1) AND "workflow_position_assignments"."use_substitute" IN (0,1))
);
CREATE UNIQUE INDEX "workflow_position_scope_unique" ON "workflow_position_assignments" ("position_id","scope_type","scope_id");
CREATE TABLE "workflow_order_links" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"revision" bigint DEFAULT 0 NOT NULL,
	"retired_at" text DEFAULT '' NOT NULL,
	"retired_by" text DEFAULT '' NOT NULL,
	"retirement_reason" text DEFAULT '' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	FOREIGN KEY ("order_id") REFERENCES "research_orders"("id") ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "workflow_link_reason" CHECK(length(trim("workflow_order_links"."reason"))>0),
	CONSTRAINT "workflow_link_type" CHECK("workflow_order_links"."target_type" IN ('operation','finance_document','finance_version','payment','lab_job','sample','lab_result','project','task','correspondence','science_case','science_result'))
);
CREATE UNIQUE INDEX "workflow_link_active_unique" ON "workflow_order_links" ("target_type","target_id") WHERE "workflow_order_links"."retired_at"='' AND "workflow_order_links"."target_type"!='project';
CREATE UNIQUE INDEX "workflow_order_link_unique" ON "workflow_order_links" ("order_id","target_type","target_id") WHERE "workflow_order_links"."retired_at"='';
CREATE INDEX "workflow_links_order" ON "workflow_order_links" ("order_id","retired_at");
CREATE UNIQUE INDEX "workflow_positions_code_unique" ON "workflow_positions" ("code");
-- Organizational slots, never personal assignments; no staff account is changed.
INSERT INTO workflow_positions(id,code,title,permission,created_by,created_at,updated_at) VALUES
 ('intake','intake','پذیرش','operations','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z'),
 ('customer_support','customer_support','پشتیبانی مشتری','operations','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z'),
 ('scientific_design','scientific_design','طراحی علمی و پیش‌فاکتور تخصصی','results_ops','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z'),
 ('quotation','quotation','صدور پیش‌فاکتور','finance_ops','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z'),
 ('finance','finance','امور مالی','finance_ops','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z'),
 ('technical_director','technical_director','مسئول فنی','science_approve','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z'),
 ('execution_coordination','execution_coordination','هماهنگی اجرا و مستندسازی','lab_operations','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z'),
 ('lab_executor','lab_executor','مجری آزمایشگاه','lab_portal','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z'),
 ('scientific_control','scientific_control','کنترل علمی و تأیید نتایج','science_approve','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z'),
 ('result_delivery','result_delivery','تحویل نتایج و پشتیبانی پس از تحویل','results_ops','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z'),
 ('management','management','مدیریت','institute_admin','migration-0018','2026-11-15T00:00:00Z','2026-11-15T00:00:00Z');
CREATE FUNCTION workflow_link_target_exists() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF NEW.target_type='operation' AND NOT EXISTS(SELECT 1 FROM ops_items WHERE id=NEW.target_id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='finance_document' AND NOT EXISTS(SELECT 1 FROM finance_documents WHERE id=NEW.target_id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='finance_version' AND NOT EXISTS(SELECT 1 FROM finance_versions WHERE id=NEW.target_id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='payment' AND NOT EXISTS(SELECT 1 FROM finance_transactions WHERE id=NEW.target_id AND kind IN ('receipt','refund')) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='lab_job' AND NOT EXISTS(SELECT 1 FROM laboratory_jobs WHERE id=NEW.target_id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='sample' AND NOT EXISTS(SELECT 1 FROM laboratory_records WHERE id=NEW.target_id AND kind='sample') THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='lab_result' AND NOT EXISTS(SELECT 1 FROM laboratory_records WHERE id=NEW.target_id AND kind='result') THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='project' AND NOT EXISTS(SELECT 1 FROM staff_records WHERE id=NEW.target_id AND kind='project') THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='task' AND NOT EXISTS(SELECT 1 FROM staff_records WHERE id=NEW.target_id AND kind IN ('task','plan','decision','scientific')) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='correspondence' AND NOT EXISTS(SELECT 1 FROM staff_records WHERE id=NEW.target_id AND kind='correspondence') THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='science_case' AND NOT EXISTS(SELECT 1 FROM science_cases WHERE id=NEW.target_id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;
 IF NEW.target_type='science_result' AND NOT EXISTS(SELECT 1 FROM science_entries WHERE id=NEW.target_id AND kind IN ('data','report')) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow target does not exist'; END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER workflow_link_target_exists BEFORE INSERT ON workflow_order_links FOR EACH ROW EXECUTE FUNCTION workflow_link_target_exists();
CREATE FUNCTION workflow_link_identity_immutable() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF NEW.order_id!=OLD.order_id OR NEW.target_type!=OLD.target_type OR NEW.target_id!=OLD.target_id THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'retire link and add a new audited link'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER workflow_link_identity_immutable BEFORE UPDATE OF order_id,target_type,target_id ON workflow_order_links FOR EACH ROW EXECUTE FUNCTION workflow_link_identity_immutable();
CREATE FUNCTION research_people_preserve_history() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow history cannot be deleted';
  RETURN OLD;
END;
$$;
CREATE TRIGGER research_people_preserve_history BEFORE DELETE ON research_people FOR EACH ROW EXECUTE FUNCTION research_people_preserve_history();
CREATE FUNCTION research_orders_preserve_history() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow history cannot be deleted';
  RETURN OLD;
END;
$$;
CREATE TRIGGER research_orders_preserve_history BEFORE DELETE ON research_orders FOR EACH ROW EXECUTE FUNCTION research_orders_preserve_history();
CREATE FUNCTION workflow_positions_preserve_history() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow history cannot be deleted';
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_positions_preserve_history BEFORE DELETE ON workflow_positions FOR EACH ROW EXECUTE FUNCTION workflow_positions_preserve_history();
CREATE FUNCTION workflow_position_assignments_preserve_history() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow history cannot be deleted';
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_position_assignments_preserve_history BEFORE DELETE ON workflow_position_assignments FOR EACH ROW EXECUTE FUNCTION workflow_position_assignments_preserve_history();
CREATE FUNCTION workflow_order_links_preserve_history() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'workflow history cannot be deleted';
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_order_links_preserve_history BEFORE DELETE ON workflow_order_links FOR EACH ROW EXECUTE FUNCTION workflow_order_links_preserve_history();
CREATE FUNCTION workflow_preserve_finance_documents() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM workflow_order_links WHERE target_type IN ('finance_document') AND target_id=OLD.id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'existing workflow reference prevents deletion'; END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_preserve_finance_documents BEFORE DELETE ON finance_documents FOR EACH ROW EXECUTE FUNCTION workflow_preserve_finance_documents();
CREATE FUNCTION workflow_preserve_finance_transactions() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM workflow_order_links WHERE target_type IN ('payment') AND target_id=OLD.id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'existing workflow reference prevents deletion'; END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_preserve_finance_transactions BEFORE DELETE ON finance_transactions FOR EACH ROW EXECUTE FUNCTION workflow_preserve_finance_transactions();
CREATE FUNCTION workflow_preserve_finance_versions() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM workflow_order_links WHERE target_type IN ('finance_version') AND target_id=OLD.id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'existing workflow reference prevents deletion'; END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_preserve_finance_versions BEFORE DELETE ON finance_versions FOR EACH ROW EXECUTE FUNCTION workflow_preserve_finance_versions();
CREATE FUNCTION workflow_preserve_laboratory_jobs() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM workflow_order_links WHERE target_type IN ('lab_job') AND target_id=OLD.id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'existing workflow reference prevents deletion'; END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_preserve_laboratory_jobs BEFORE DELETE ON laboratory_jobs FOR EACH ROW EXECUTE FUNCTION workflow_preserve_laboratory_jobs();
CREATE FUNCTION workflow_preserve_laboratory_records() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM workflow_order_links WHERE target_type IN ('sample','lab_result') AND target_id=OLD.id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'existing workflow reference prevents deletion'; END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_preserve_laboratory_records BEFORE DELETE ON laboratory_records FOR EACH ROW EXECUTE FUNCTION workflow_preserve_laboratory_records();
CREATE FUNCTION workflow_preserve_ops_items() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM workflow_order_links WHERE target_type IN ('operation') AND target_id=OLD.id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'existing workflow reference prevents deletion'; END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_preserve_ops_items BEFORE DELETE ON ops_items FOR EACH ROW EXECUTE FUNCTION workflow_preserve_ops_items();
CREATE FUNCTION workflow_preserve_science_cases() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM workflow_order_links WHERE target_type IN ('science_case') AND target_id=OLD.id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'existing workflow reference prevents deletion'; END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_preserve_science_cases BEFORE DELETE ON science_cases FOR EACH ROW EXECUTE FUNCTION workflow_preserve_science_cases();
CREATE FUNCTION workflow_preserve_science_entries() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM workflow_order_links WHERE target_type IN ('science_result') AND target_id=OLD.id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'existing workflow reference prevents deletion'; END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_preserve_science_entries BEFORE DELETE ON science_entries FOR EACH ROW EXECUTE FUNCTION workflow_preserve_science_entries();
CREATE FUNCTION workflow_preserve_staff_records() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM workflow_order_links WHERE target_type IN ('project','task','correspondence') AND target_id=OLD.id) THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'existing workflow reference prevents deletion'; END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER workflow_preserve_staff_records BEFORE DELETE ON staff_records FOR EACH ROW EXECUTE FUNCTION workflow_preserve_staff_records();
CREATE FUNCTION research_order_identity_immutable() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF NEW.id!=OLD.id OR NEW.code!=OLD.code OR NEW.researcher_id!=OLD.researcher_id OR NEW.create_key!=OLD.create_key THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'stable order identity cannot change'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER research_order_identity_immutable BEFORE UPDATE OF id,code,researcher_id,create_key ON research_orders FOR EACH ROW EXECUTE FUNCTION research_order_identity_immutable();
CREATE FUNCTION research_person_identity_immutable() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF NEW.id!=OLD.id OR NEW.create_key!=OLD.create_key THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'stable researcher identity cannot change'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER research_person_identity_immutable BEFORE UPDATE OF id,create_key ON research_people FOR EACH ROW EXECUTE FUNCTION research_person_identity_immutable();
CREATE FUNCTION workflow_position_identity_immutable() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, synapse AS $$
BEGIN
  IF NEW.id!=OLD.id OR NEW.code!=OLD.code THEN RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'stable position identity cannot change'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER workflow_position_identity_immutable BEFORE UPDATE OF id,code ON workflow_positions FOR EACH ROW EXECUTE FUNCTION workflow_position_identity_immutable();
