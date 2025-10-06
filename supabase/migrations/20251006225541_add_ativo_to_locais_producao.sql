/*
  # Adicionar campo ativo a locais_producao

  1. Alterações
    - Adicionar coluna `ativo` (boolean, default true) à tabela locais_producao
*/

-- Adicionar campo ativo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locais_producao' AND column_name = 'ativo'
  ) THEN
    ALTER TABLE locais_producao ADD COLUMN ativo boolean DEFAULT true;
  END IF;
END $$;

-- Atualizar registos existentes para ativo = true
UPDATE locais_producao SET ativo = true WHERE ativo IS NULL;