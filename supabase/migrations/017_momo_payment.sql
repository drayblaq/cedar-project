ALTER TABLE payments ADD COLUMN IF NOT EXISTS momo_reference text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'momo'
  CHECK (payment_method IN ('momo', 'cash', 'bank_transfer', 'other'));
