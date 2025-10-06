/*
  # Adicionar número de fatura aos envios

  1. Alterações
    - Adicionar coluna `numero_fatura` (text) à tabela envios
    - Campo opcional para registar o número da fatura associada ao envio

  2. Segurança
    - Manter políticas RLS existentes
*/

-- Adicionar campo numero_fatura
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'envios' AND column_name = 'numero_fatura'
  ) THEN
    ALTER TABLE envios ADD COLUMN numero_fatura text;
  END IF;
END $$;

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_envios_numero_fatura ON envios(numero_fatura);