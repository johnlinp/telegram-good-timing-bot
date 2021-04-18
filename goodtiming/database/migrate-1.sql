CREATE TABLE IF NOT EXISTS doer (
    doer_id VARCHAR(50) NOT NULL,
    current_timing VARCHAR(500),
    PRIMARY KEY(doer_id)
);

CREATE TABLE IF NOT EXISTS todo (
    doer_id VARCHAR(50) NOT NULL,
    timing VARCHAR(500) NOT NULL,
    plan VARCHAR(500) NOT NULL,
    CONSTRAINT fk_doer_id FOREIGN KEY (doer_id) REFERENCES doer(doer_id),
    UNIQUE (doer_id, timing, plan)
);
