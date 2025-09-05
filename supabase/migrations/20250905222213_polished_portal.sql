/*
  # Add Financial Fields to Productions

  1. New Columns
    - `pago` (boolean) - Whether the production is paid
    - `fastprod` (boolean) - FastProd indicator
    - `numero_fatura` (text) - Invoice number
    - `data_fatura` (date) - Invoice date
    - `valor_fatura` (numeric) - Invoice value

  2. Updates
    - Add default values for new fields
    - Maintain existing data integrity
*/

-- Add financial fields to producoes table
DO $$
BEGIN
  -- Add pago field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'pago'
  ) THEN
    ALTER TABLE producoes ADD COLUMN pago boolean DEFAULT false;
  END IF;

  -- Add fastprod field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'fastprod'
  ) THEN
    ALTER TABLE producoes ADD COLUMN fastprod boolean DEFAULT false;
  END IF;

  -- Add numero_fatura field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'numero_fatura'
  ) THEN
    ALTER TABLE producoes ADD COLUMN numero_fatura text;
  END IF;

  -- Add data_fatura field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'data_fatura'
  ) THEN
    ALTER TABLE producoes ADD COLUMN data_fatura date;
  END IF;

  -- Add valor_fatura field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'valor_fatura'
  ) THEN
    ALTER TABLE producoes ADD COLUMN valor_fatura numeric(10,2) DEFAULT 0;
  END IF;
END $$;