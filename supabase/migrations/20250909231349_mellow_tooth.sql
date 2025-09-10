/*
  # Expand Quality Control System

  1. New Tables
    - `controlo_qualidade_adicional`
      - `id` (uuid, primary key)
      - `registo_id` (uuid, foreign key to controlo_qualidade_registos)
      - `linhas` (boolean)
      - `borboto` (boolean)
      - `sujidade` (boolean)
      - `defeito_transfer` (boolean)
      - `peca_torta` (boolean)
      - `problemas_ferro` (boolean)
      - `outros_controlos` (jsonb for additional controls)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `controlo_qualidade_comentarios`
      - `id` (uuid, primary key)
      - `registo_id` (uuid, foreign key to controlo_qualidade_registos)
      - `comentario` (text)
      - `usuario` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (matching existing pattern)
*/

-- Controlo Qualidade Adicional (checkboxes)
CREATE TABLE IF NOT EXISTS controlo_qualidade_adicional (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registo_id uuid NOT NULL REFERENCES controlo_qualidade_registos(id) ON DELETE CASCADE,
  linhas boolean DEFAULT false,
  borboto boolean DEFAULT false,
  sujidade boolean DEFAULT false,
  defeito_transfer boolean DEFAULT false,
  peca_torta boolean DEFAULT false,
  problemas_ferro boolean DEFAULT false,
  outros_controlos jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comentários do Controlo de Qualidade
CREATE TABLE IF NOT EXISTS controlo_qualidade_comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registo_id uuid NOT NULL REFERENCES controlo_qualidade_registos(id) ON DELETE CASCADE,
  comentario text NOT NULL,
  usuario text NOT NULL DEFAULT 'Sistema',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qca_registo ON controlo_qualidade_adicional(registo_id);
CREATE INDEX IF NOT EXISTS idx_qcc_registo ON controlo_qualidade_comentarios(registo_id);
CREATE INDEX IF NOT EXISTS idx_qcc_created ON controlo_qualidade_comentarios(created_at);

-- Enable RLS
ALTER TABLE controlo_qualidade_adicional ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlo_qualidade_comentarios ENABLE ROW LEVEL SECURITY;

-- Policies for controlo_qualidade_adicional
CREATE POLICY "qca_select_public" ON controlo_qualidade_adicional
  FOR SELECT TO public USING (true);

CREATE POLICY "qca_insert_public" ON controlo_qualidade_adicional
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "qca_update_public" ON controlo_qualidade_adicional
  FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "qca_delete_public" ON controlo_qualidade_adicional
  FOR DELETE TO public USING (true);

-- Policies for controlo_qualidade_comentarios
CREATE POLICY "qcc_select_public" ON controlo_qualidade_comentarios
  FOR SELECT TO public USING (true);

CREATE POLICY "qcc_insert_public" ON controlo_qualidade_comentarios
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "qcc_update_public" ON controlo_qualidade_comentarios
  FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "qcc_delete_public" ON controlo_qualidade_comentarios
  FOR DELETE TO public USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER qca_set_updated_at
  BEFORE UPDATE ON controlo_qualidade_adicional
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER qcc_set_updated_at
  BEFORE UPDATE ON controlo_qualidade_comentarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();