/*
  # Production System Improvements

  1. New Tables
    - `tipos_peca` - CRUD for piece types
    - `locais_producao` - Production locations management
  
  2. New Columns
    - `codigo_op` (unique production order code)
    - `data_final` (final delivery date, renamed from data_estimada_entrega)
    - `tempo_producao_estimado` (estimated production time in days)
    - `tempo_producao_real` (actual production time in days)
    - `tem_molde` (has mold boolean)
    - `local_producao_id` (foreign key to locais_producao)
  
  3. New Estado
    - Add 'Pronto' to estado_type enum
  
  4. Security
    - Enable RLS on new tables
    - Add policies for public access
*/

-- Add new estado 'Pronto' to existing enum
ALTER TYPE estado_type ADD VALUE IF NOT EXISTS 'Pronto';

-- Create tipos_peca table
CREATE TABLE IF NOT EXISTS tipos_peca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  descricao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create locais_producao table
CREATE TABLE IF NOT EXISTS locais_producao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  tipo local_producao_type DEFAULT 'Interno',
  endereco text,
  contacto text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to producoes table
DO $$
BEGIN
  -- Add codigo_op column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'codigo_op'
  ) THEN
    ALTER TABLE producoes ADD COLUMN codigo_op text UNIQUE;
  END IF;

  -- Add data_final column (rename from data_estimada_entrega)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'data_final'
  ) THEN
    ALTER TABLE producoes ADD COLUMN data_final date;
    -- Copy existing data_estimada_entrega to data_final
    UPDATE producoes SET data_final = data_estimada_entrega WHERE data_final IS NULL;
  END IF;

  -- Add tempo_producao_estimado column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'tempo_producao_estimado'
  ) THEN
    ALTER TABLE producoes ADD COLUMN tempo_producao_estimado integer DEFAULT 0;
  END IF;

  -- Add tempo_producao_real column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'tempo_producao_real'
  ) THEN
    ALTER TABLE producoes ADD COLUMN tempo_producao_real integer DEFAULT 0;
  END IF;

  -- Add tem_molde column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'tem_molde'
  ) THEN
    ALTER TABLE producoes ADD COLUMN tem_molde boolean DEFAULT false;
  END IF;

  -- Add local_producao_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'local_producao_id'
  ) THEN
    ALTER TABLE producoes ADD COLUMN local_producao_id uuid;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE tipos_peca ENABLE ROW LEVEL SECURITY;
ALTER TABLE locais_producao ENABLE ROW LEVEL SECURITY;

-- Create policies for tipos_peca
CREATE POLICY "Allow public read access on tipos_peca"
  ON tipos_peca
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on tipos_peca"
  ON tipos_peca
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on tipos_peca"
  ON tipos_peca
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on tipos_peca"
  ON tipos_peca
  FOR DELETE
  TO public
  USING (true);

-- Create policies for locais_producao
CREATE POLICY "Allow public read access on locais_producao"
  ON locais_producao
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on locais_producao"
  ON locais_producao
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on locais_producao"
  ON locais_producao
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on locais_producao"
  ON locais_producao
  FOR DELETE
  TO public
  USING (true);

-- Create foreign key constraint for local_producao_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'producoes_local_producao_id_fkey'
  ) THEN
    ALTER TABLE producoes 
    ADD CONSTRAINT producoes_local_producao_id_fkey 
    FOREIGN KEY (local_producao_id) REFERENCES locais_producao(id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_producoes_codigo_op ON producoes(codigo_op);
CREATE INDEX IF NOT EXISTS idx_producoes_data_final ON producoes(data_final);
CREATE INDEX IF NOT EXISTS idx_producoes_local_producao_id ON producoes(local_producao_id);
CREATE INDEX IF NOT EXISTS idx_tipos_peca_nome ON tipos_peca(nome);
CREATE INDEX IF NOT EXISTS idx_locais_producao_nome ON locais_producao(nome);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_tipos_peca_updated_at
  BEFORE UPDATE ON tipos_peca
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_locais_producao_updated_at
  BEFORE UPDATE ON locais_producao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default tipos_peca
INSERT INTO tipos_peca (nome, descricao) VALUES
  ('T-Shirt', 'T-shirt básica'),
  ('Hoodie', 'Sweatshirt com capuz'),
  ('Polo', 'Camisa polo'),
  ('Jacket', 'Casaco/Jaqueta'),
  ('Sweatshirt', 'Sweatshirt sem capuz'),
  ('Calças', 'Calças diversas'),
  ('Shorts', 'Calções'),
  ('Vestido', 'Vestidos'),
  ('Saia', 'Saias'),
  ('Blazer', 'Blazers e casacos formais')
ON CONFLICT (nome) DO NOTHING;

-- Insert default locais_producao
INSERT INTO locais_producao (nome, tipo, endereco, contacto) VALUES
  ('Lomartex - Sede', 'Interno', 'Rua Principal, 123', 'info@lomartex.pt'),
  ('Lomartex - Unidade 2', 'Interno', 'Rua Secundária, 456', 'unidade2@lomartex.pt'),
  ('TextilPro Lda', 'Externo', 'Zona Industrial, Lote 10', 'geral@textilpro.pt'),
  ('Fashion Works', 'Externo', 'Rua da Indústria, 789', 'producao@fashionworks.pt'),
  ('Premium Textiles', 'Externo', 'Avenida Têxtil, 321', 'contacto@premiumtextiles.pt')
ON CONFLICT (nome) DO NOTHING;

-- Generate codigo_op for existing producoes that don't have one
UPDATE producoes 
SET codigo_op = 'OP-' || LPAD(EXTRACT(YEAR FROM created_at)::text, 4, '0') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 4, '0')
WHERE codigo_op IS NULL;