CREATE TABLE doer (
    doer_id VARCHAR(50) NOT NULL,
    PRIMARY KEY(doer_id)
);

CREATE TABLE todo (
    doer_id VARCHAR(50) NOT NULL,
    timing VARCHAR(500) NOT NULL,
    plan VARCHAR(500) NOT NULL,
    CONSTRAINT fk_doer_id FOREIGN KEY (doer_id) REFERENCES doer(doer_id),
    UNIQUE (doer_id, timing, plan)
);
