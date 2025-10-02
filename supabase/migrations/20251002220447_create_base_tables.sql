/*
  # Criar tabelas base do sistema

  1. Novas Tabelas
    - `clientes` - Informação de clientes
    - `marcas` - Marcas vinculadas aos clientes
    - `locais_producao` - Locais de produção
    - `tipos_peca` - Tipos de peças
    
  2. Segurança
    - Ativar RLS em todas as tabelas
    - Políticas para utilizadores autenticados
*/

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de marcas
CREATE TABLE IF NOT EXISTS marcas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE locais_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_peca ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clientes
DROP POLICY IF EXISTS "Utilizadores autenticados podem ver clientes" ON clientes;
CREATE POLICY "Utilizadores autenticados podem ver clientes"
  ON clientes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem criar clientes" ON clientes;
CREATE POLICY "Utilizadores autenticados podem criar clientes"
  ON clientes FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem atualizar clientes" ON clientes;
CREATE POLICY "Utilizadores autenticados podem atualizar clientes"
  ON clientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem eliminar clientes" ON clientes;
CREATE POLICY "Utilizadores autenticados podem eliminar clientes"
  ON clientes FOR DELETE TO authenticated USING (true);

-- Políticas RLS para marcas
DROP POLICY IF EXISTS "Utilizadores autenticados podem ver marcas" ON marcas;
CREATE POLICY "Utilizadores autenticados podem ver marcas"
  ON marcas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem criar marcas" ON marcas;
CREATE POLICY "Utilizadores autenticados podem criar marcas"
  ON marcas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem atualizar marcas" ON marcas;
CREATE POLICY "Utilizadores autenticados podem atualizar marcas"
  ON marcas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem eliminar marcas" ON marcas;
CREATE POLICY "Utilizadores autenticados podem eliminar marcas"
  ON marcas FOR DELETE TO authenticated USING (true);

-- Políticas RLS para locais_producao
DROP POLICY IF EXISTS "Utilizadores autenticados podem ver locais" ON locais_producao;
CREATE POLICY "Utilizadores autenticados podem ver locais"
  ON locais_producao FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem criar locais" ON locais_producao;
CREATE POLICY "Utilizadores autenticados podem criar locais"
  ON locais_producao FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem atualizar locais" ON locais_producao;
CREATE POLICY "Utilizadores autenticados podem atualizar locais"
  ON locais_producao FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem eliminar locais" ON locais_producao;
CREATE POLICY "Utilizadores autenticados podem eliminar locais"
  ON locais_producao FOR DELETE TO authenticated USING (true);

-- Políticas RLS para tipos_peca
DROP POLICY IF EXISTS "Utilizadores autenticados podem ver tipos" ON tipos_peca;
CREATE POLICY "Utilizadores autenticados podem ver tipos"
  ON tipos_peca FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem criar tipos" ON tipos_peca;
CREATE POLICY "Utilizadores autenticados podem criar tipos"
  ON tipos_peca FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem atualizar tipos" ON tipos_peca;
CREATE POLICY "Utilizadores autenticados podem atualizar tipos"
  ON tipos_peca FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Utilizadores autenticados podem eliminar tipos" ON tipos_peca;
CREATE POLICY "Utilizadores autenticados podem eliminar tipos"
  ON tipos_peca FOR DELETE TO authenticated USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_marcas_cliente_id ON marcas(cliente_id);

-- Agora adicionar a foreign key na tabela envios
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'envios') THEN
    ALTER TABLE envios DROP CONSTRAINT IF EXISTS fk_envios_cliente;
    ALTER TABLE envios ADD CONSTRAINT fk_envios_cliente 
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL;
  END IF;
END $$;