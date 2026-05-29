-- Add receipt number as a readable reference
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_number text;

-- Generate receipt numbers for existing payments
UPDATE payments
SET receipt_number = 'PAY-' || UPPER(SUBSTRING(id::text, 1, 8))
WHERE receipt_number IS NULL;

-- Auto-generate for new payments
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.receipt_number := 'PAY-' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_receipt_number ON payments;
CREATE TRIGGER set_receipt_number
  BEFORE INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION generate_receipt_number();
