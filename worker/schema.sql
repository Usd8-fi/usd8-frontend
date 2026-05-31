CREATE TABLE IF NOT EXISTS score_checkpoints (
  holder TEXT NOT NULL,
  asset_key TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  decimals INTEGER NOT NULL,
  score_per_token_per_block REAL NOT NULL,
  from_block TEXT NOT NULL,
  processed_until_block TEXT NOT NULL,
  target_block TEXT NOT NULL,
  balance_raw TEXT NOT NULL,
  raw_token_block_integral TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (holder, asset_key)
);

CREATE INDEX IF NOT EXISTS idx_score_checkpoints_holder
  ON score_checkpoints(holder);
