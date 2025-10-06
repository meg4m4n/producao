/*
  # Criar tabelas base do sistema

  1. Novas Tabelas
    - `locais_producao` - Locais de produção
    - `tipos_peca` - Tipos de peças
    
  2. Segurança
    - Ativar RLS em todas as tabelas
    - Políticas públicas para facilitar desenvolvimento
*/

-- Criar tabela de locais de produção
CREATE TABLE IF NOT EXISTS locais_producao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('interno', 'externo')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de tipos de peça
CREATE TABLE IF NOT EXISTS tipos_peca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ativar RLS
ALTER TABLE locais_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_peca ENABLE ROW LEVEL SECURITY;

-- Políticas RLS públicas para locais_producao
DROP POLICY IF EXISTS "Allow public read access on locais_producao" ON locais_producao;
CREATE POLICY "Allow public read access on locais_producao"
  ON locais_producao FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on locais_producao" ON locais_producao;
CREATE POLICY "Allow public insert on locais_producao"
  ON locais_producao FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on locais_producao" ON locais_producao;
CREATE POLICY "Allow public update on locais_producao"
  ON locais_producao FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on locais_producao" ON locais_producao;
CREATE POLICY "Allow public delete on locais_producao"
  ON locais_producao FOR DELETE TO public USING (true);

-- Políticas RLS públicas para tipos_peca
DROP POLICY IF EXISTS "Allow public read access on tipos_peca" ON tipos_peca;
CREATE POLICY "Allow public read access on tipos_peca"
  ON tipos_peca FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on tipos_peca" ON tipos_peca;
CREATE POLICY "Allow public insert on tipos_peca"
  ON tipos_peca FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on tipos_peca" ON tipos_peca;
CREATE POLICY "Allow public update on tipos_peca"
  ON tipos_peca FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on tipos_peca" ON tipos_peca;
CREATE POLICY "Allow public delete on tipos_peca"
  ON tipos_peca FOR DELETE TO public USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_marcas_cliente_id ON marcas(cliente_id);