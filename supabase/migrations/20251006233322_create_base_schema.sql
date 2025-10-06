/*
  # Create Productions Management Schema

  1. New Tables
    - `clientes` - Client information
    - `marcas` - Brand information linked to clients
    - `producoes` - Production records
    - `producao_variantes` - Color and size variants
    - `bom_files` - BOM file attachments

  2. Security
    - Enable RLS on all tables
    - Add public policies for all operations
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE genero_type AS ENUM ('Masculino', 'Feminino', 'Unissexo');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE etapa_type AS ENUM ('Desenvolvimento', '1º proto', '2º proto', 'Size-Set', 'PPS', 'Produção', 'Pronto', 'Enviado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_type AS ENUM ('Modelagem', 'Aguarda Componentes', 'FALTA COMPONENTES', 'Aguarda Malha', 'Com Defeito', 'Aguarda Comentários', 'Corte', 'Confecção', 'Transfers', 'Serviços Externos', 'Embalamento');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE local_producao_type AS ENUM ('Interno', 'Externo');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create clientes table
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create marcas table
CREATE TABLE IF NOT EXISTS marcas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(nome, cliente_id)
);

-- Create producoes table
CREATE TABLE IF NOT EXISTS producoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_op text UNIQUE,
  marca_id uuid NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  referencia_interna text UNIQUE NOT NULL,
  referencia_cliente text NOT NULL DEFAULT '',
  descricao text NOT NULL DEFAULT '',
  tipo_peca text NOT NULL DEFAULT '',
  genero genero_type DEFAULT 'Unissexo',
  etapa etapa_type DEFAULT 'Desenvolvimento',
  estado estado_type DEFAULT 'Modelagem',
  data_inicio date NOT NULL,
  data_previsao date NOT NULL,
  data_final date,
  tempo_producao_estimado integer DEFAULT 0,
  tempo_producao_real integer DEFAULT 0,
  tem_molde boolean DEFAULT false,
  em_producao boolean DEFAULT false,
  problemas boolean DEFAULT false,
  local_producao local_producao_type DEFAULT 'Interno',
  local_producao_id uuid,
  empresa_externa text DEFAULT '',
  link_odoo text DEFAULT '',
  comments text DEFAULT '',
  pago boolean DEFAULT false,
  fastprod boolean DEFAULT false,
  pago_parcial boolean DEFAULT false,
  pagamentos jsonb DEFAULT '[]'::jsonb,
  valor_pago numeric(10, 2) DEFAULT 0,
  valor_restante numeric(10, 2) DEFAULT 0,
  observacoes_financeiras text DEFAULT '',
  numero_fatura text,
  data_fatura date,
  valor_fatura numeric(10, 2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create producao_variantes table
CREATE TABLE IF NOT EXISTS producao_variantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producao_id uuid NOT NULL REFERENCES producoes(id) ON DELETE CASCADE,
  cor text NOT NULL,
  tamanho text NOT NULL,
  quantidade integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(producao_id, cor, tamanho)
);

-- Create bom_files table
CREATE TABLE IF NOT EXISTS bom_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producao_id uuid NOT NULL REFERENCES producoes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  url text NOT NULL,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE producoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE producao_variantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_files ENABLE ROW LEVEL SECURITY;

-- Policies for clientes
DROP POLICY IF EXISTS "Allow public read access on clientes" ON clientes;
CREATE POLICY "Allow public read access on clientes"
  ON clientes FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on clientes" ON clientes;
CREATE POLICY "Allow public insert on clientes"
  ON clientes FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on clientes" ON clientes;
CREATE POLICY "Allow public update on clientes"
  ON clientes FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on clientes" ON clientes;
CREATE POLICY "Allow public delete on clientes"
  ON clientes FOR DELETE TO public USING (true);

-- Policies for marcas
DROP POLICY IF EXISTS "Allow public read access on marcas" ON marcas;
CREATE POLICY "Allow public read access on marcas"
  ON marcas FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on marcas" ON marcas;
CREATE POLICY "Allow public insert on marcas"
  ON marcas FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on marcas" ON marcas;
CREATE POLICY "Allow public update on marcas"
  ON marcas FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on marcas" ON marcas;
CREATE POLICY "Allow public delete on marcas"
  ON marcas FOR DELETE TO public USING (true);

-- Policies for producoes
DROP POLICY IF EXISTS "Allow public read access on producoes" ON producoes;
CREATE POLICY "Allow public read access on producoes"
  ON producoes FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on producoes" ON producoes;
CREATE POLICY "Allow public insert on producoes"
  ON producoes FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on producoes" ON producoes;
CREATE POLICY "Allow public update on producoes"
  ON producoes FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on producoes" ON producoes;
CREATE POLICY "Allow public delete on producoes"
  ON producoes FOR DELETE TO public USING (true);

-- Policies for producao_variantes
DROP POLICY IF EXISTS "Allow public read access on producao_variantes" ON producao_variantes;
CREATE POLICY "Allow public read access on producao_variantes"
  ON producao_variantes FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on producao_variantes" ON producao_variantes;
CREATE POLICY "Allow public insert on producao_variantes"
  ON producao_variantes FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on producao_variantes" ON producao_variantes;
CREATE POLICY "Allow public update on producao_variantes"
  ON producao_variantes FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on producao_variantes" ON producao_variantes;
CREATE POLICY "Allow public delete on producao_variantes"
  ON producao_variantes FOR DELETE TO public USING (true);

-- Policies for bom_files
DROP POLICY IF EXISTS "Allow public read access on bom_files" ON bom_files;
CREATE POLICY "Allow public read access on bom_files"
  ON bom_files FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on bom_files" ON bom_files;
CREATE POLICY "Allow public insert on bom_files"
  ON bom_files FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on bom_files" ON bom_files;
CREATE POLICY "Allow public update on bom_files"
  ON bom_files FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on bom_files" ON bom_files;
CREATE POLICY "Allow public delete on bom_files"
  ON bom_files FOR DELETE TO public USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marcas_cliente_id ON marcas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_producoes_marca_id ON producoes(marca_id);
CREATE INDEX IF NOT EXISTS idx_producoes_cliente_id ON producoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_producoes_etapa ON producoes(etapa);
CREATE INDEX IF NOT EXISTS idx_producoes_estado ON producoes(estado);
CREATE INDEX IF NOT EXISTS idx_producoes_data_inicio ON producoes(data_inicio);
CREATE INDEX IF NOT EXISTS idx_producao_variantes_producao_id ON producao_variantes(producao_id);
CREATE INDEX IF NOT EXISTS idx_bom_files_producao_id ON bom_files(producao_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at 
  BEFORE UPDATE ON clientes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marcas_updated_at ON marcas;
CREATE TRIGGER update_marcas_updated_at 
  BEFORE UPDATE ON marcas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_producoes_updated_at ON producoes;
CREATE TRIGGER update_producoes_updated_at 
  BEFORE UPDATE ON producoes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_producao_variantes_updated_at ON producao_variantes;
CREATE TRIGGER update_producao_variantes_updated_at 
  BEFORE UPDATE ON producao_variantes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
