-- FIN-05 extends the canonical payable; legacy rows retain their existing behavior.
ALTER TABLE finance_payables ADD COLUMN request_meta TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE INDEX finance_payment_request_applicant ON finance_payables(json_extract(NULLIF(request_meta,''),'$.applicant')) WHERE request_meta <> '';
