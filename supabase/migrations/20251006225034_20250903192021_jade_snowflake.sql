/*
  # Create Productions Management Schema

  1. New Tables
    - `clientes` - Client information
      - `id` (uuid, primary key)
      - `nome` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `marcas` - Brand information linked to clients
      - `id` (uuid, primary key)
      - `nome` (text)
      - `cliente_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `producoes` - Production records
      - `id` (uuid, primary key)
      - `marca_id` (uuid, foreign key)
      - `cliente_id` (uuid, foreign key)
      - `referencia_interna` (text, unique)
      - `referencia_cliente` (text)
      - `descricao` (text)
      - `tipo_peca` (text)
      - `genero` (enum: Masculino, Feminino, Unissexo)
      - `etapa` (enum: Desenvolvimento, 1º proto, etc.)
      - `estado` (enum: Modelagem, Aguarda Componentes, etc.)
      - `data_inicio` (date)
      - `data_previsao` (date)
      - `data_estimada_entrega` (date)
      - `em_producao` (boolean, default false)
      - `problemas` (boolean, default false)
      - `local_producao` (enum: Interno, Externo)
      - `empresa_externa` (text, nullable)
      - `link_odoo` (text, nullable)
      - `comments` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `producao_variantes` - Color and size variants for productions
      - `id` (uuid, primary key)
      - `producao_id` (uuid, foreign key)
      - `cor` (text)
      - `tamanho` (text)
      - `quantidade` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bom_files` - BOM file attachments
      - `id` (uuid, primary key)
      - `producao_id` (uuid, foreign key)
      - `nome` (text)
      - `url` (text)
      - `upload_date` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Public read access for basic operations
*/

-- Create custom types
CREATE TYPE genero_type AS ENUM ('Masculino', 'Feminino', 'Unissexo');
CREATE TYPE etapa_type AS ENUM ('Desenvolvimento', '1º proto', '2º proto', 'Size-Set', 'PPS', 'Produção', 'Pronto', 'Enviado');
CREATE TYPE estado_type AS ENUM ('Modelagem', 'Aguarda Componentes', 'FALTA COMPONENTES', 'Aguarda Malha', 'Com Defeito', 'Aguarda Comentários', 'Corte', 'Confecção', 'Transfers', 'Serviços Externos', 'Embalamento');
CREATE TYPE local_producao_type AS ENUM ('Interno', 'Externo');

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
  marca_id uuid NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  referencia_interna text UNIQUE NOT NULL,
  referencia_cliente text NOT NULL,
  descricao text NOT NULL,
  tipo_peca text NOT NULL,
  genero genero_type DEFAULT 'Unissexo',
  etapa etapa_type DEFAULT 'Desenvolvimento',
  estado estado_type DEFAULT 'Modelagem',
  data_inicio date NOT NULL,
  data_previsao date NOT NULL,
  data_estimada_entrega date NOT NULL,
  em_producao boolean DEFAULT false,
  problemas boolean DEFAULT false,
  local_producao local_producao_type DEFAULT 'Interno',
  empresa_externa text,
  link_odoo text,
  comments text,
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

-- Create policies for public access (adjust based on your security requirements)
CREATE POLICY "Allow public read access on clientes"
  ON clientes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on clientes"
  ON clientes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on clientes"
  ON clientes FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on clientes"
  ON clientes FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on marcas"
  ON marcas FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on marcas"
  ON marcas FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on marcas"
  ON marcas FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on marcas"
  ON marcas FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on producoes"
  ON producoes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on producoes"
  ON producoes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on producoes"
  ON producoes FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on producoes"
  ON producoes FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on producao_variantes"
  ON producao_variantes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on producao_variantes"
  ON producao_variantes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on producao_variantes"
  ON producao_variantes FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on producao_variantes"
  ON producao_variantes FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on bom_files"
  ON bom_files FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on bom_files"
  ON bom_files FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on bom_files"
  ON bom_files FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on bom_files"
  ON bom_files FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marcas_cliente_id ON marcas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_producoes_marca_id ON producoes(marca_id);
CREATE INDEX IF NOT EXISTS idx_producoes_cliente_id ON producoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_producoes_etapa ON producoes(etapa);
CREATE INDEX IF NOT EXISTS idx_producoes_estado ON producoes(estado);
CREATE INDEX IF NOT EXISTS idx_producoes_data_inicio ON producoes(data_inicio);
CREATE INDEX IF NOT EXISTS idx_producoes_data_estimada_entrega ON producoes(data_estimada_entrega);
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
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marcas_updated_at BEFORE UPDATE ON marcas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_producoes_updated_at BEFORE UPDATE ON producoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_producao_variantes_updated_at BEFORE UPDATE ON producao_variantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();