CREATE TABLE IF NOT EXISTS daily_insight_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_email text NOT NULL,
  sent_date date NOT NULL,
  theme_used text NOT NULL,
  insight_preview text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(subscriber_email, sent_date)
);

CREATE INDEX IF NOT EXISTS idx_insight_logs_email
  ON daily_insight_logs(subscriber_email);

CREATE INDEX IF NOT EXISTS idx_insight_logs_date
  ON daily_insight_logs(sent_date);
