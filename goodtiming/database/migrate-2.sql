ALTER TABLE todo DROP CONSTRAINT todo_doer_id_timing_plan_key;
CREATE UNIQUE INDEX todo_doer_id_timing_plan_index ON todo (doer_id, LOWER(timing), LOWER(plan));
