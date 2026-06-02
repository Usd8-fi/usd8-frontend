CREATE TABLE IF NOT EXISTS score_checkpoints (
  holder TEXT NOT NULL,
  asset_key TEXT NOT NULL,
  token_address TEXT NOT NULL,
  from_block TEXT NOT NULL,
  processed_until_block TEXT NOT NULL,
  balance_raw TEXT NOT NULL,
  raw_token_block_integral TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (holder, asset_key)
);

CREATE INDEX IF NOT EXISTS idx_score_checkpoints_holder
  ON score_checkpoints(holder);
