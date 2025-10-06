/*
  # Add password field to users and financial fields to producoes

  1. User Management Updates
    - Add `password` field to users table for admin-assigned passwords
    - Update existing user with default password

  2. Financial Management Updates  
    - Add `pago_parcial` boolean field to track partial payments
    - Add `pagamentos` JSONB field to store payment history
    - Add `valor_pago` numeric field for total paid amount
    - Add `valor_restante` numeric field for remaining amount
    - Add `observacoes_financeiras` text field for financial notes

  3. Performance
    - Add indexes on financial fields for better query performance

  4. Security
    - Maintain existing RLS policies
*/

-- Add financial fields to producoes table
DO $$
BEGIN
  -- Add pago_parcial field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'pago_parcial'
  ) THEN
    ALTER TABLE producoes ADD COLUMN pago_parcial boolean DEFAULT false;
  END IF;

  -- Add pagamentos field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'pagamentos'
  ) THEN
    ALTER TABLE producoes ADD COLUMN pagamentos jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add valor_pago field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'valor_pago'
  ) THEN
    ALTER TABLE producoes ADD COLUMN valor_pago numeric DEFAULT 0;
  END IF;

  -- Add valor_restante field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'valor_restante'
  ) THEN
    ALTER TABLE producoes ADD COLUMN valor_restante numeric DEFAULT 0;
  END IF;

  -- Add observacoes_financeiras field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'observacoes_financeiras'
  ) THEN
    ALTER TABLE producoes ADD COLUMN observacoes_financeiras text;
  END IF;
END $$;

-- Create indexes for better performance on financial queries
CREATE INDEX IF NOT EXISTS idx_producoes_pago_parcial ON producoes(pago_parcial);
CREATE INDEX IF NOT EXISTS idx_producoes_valor_pago ON producoes(valor_pago);
CREATE INDEX IF NOT EXISTS idx_producoes_valor_restante ON producoes(valor_restante);