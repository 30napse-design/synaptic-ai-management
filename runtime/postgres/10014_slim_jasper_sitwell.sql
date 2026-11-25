CREATE UNIQUE INDEX "science_source_operation_unique" ON "science_cases" ("source_operation_id") WHERE "science_cases"."source_operation_id" <> '';
