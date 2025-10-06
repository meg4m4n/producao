/*
  # Criar tabelas de Controlo de Qualidade

  1. Novas Tabelas
    - `tabelas_medidas_modelista` - Tabelas de medidas da modelista
    - `medidas_modelista_detalhes` - Detalhes das medidas
    - `controlo_qualidade_registos` - Registos de controlo de qualidade
    - `controlo_qualidade_medidas` - Medidas registadas no controlo
    - `controlo_qualidade_adicional` - Controlos adicionais (checkboxes)
    - `controlo_qualidade_comentarios` - Comentários do controlo

  2. Segurança
    - Ativar RLS em todas as tabelas
    - Políticas públicas para acesso
*/

-- Tabelas de medidas da modelista
CREATE TABLE IF NOT EXISTS tabelas_medidas_modelista (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producao_id uuid NOT NULL REFERENCES producoes(id) ON DELETE CASCADE,
  nome_tabela text NOT NULL,
  data_registo timestamptz DEFAULT now(),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medidas_modelista_detalhes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela_id uuid NOT NULL REFERENCES tabelas_medidas_modelista(id) ON DELETE CASCADE,
  cor text NOT NULL,
  tamanho text NOT NULL,
  letra_medida text NOT NULL,
  descricao_medida text NOT NULL,
  medida_pedida numeric(10,2) NOT NULL,
  tolerancia numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabelas de controlo de qualidade
CREATE TABLE IF NOT EXISTS controlo_qualidade_registos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producao_id uuid NOT NULL REFERENCES producoes(id) ON DELETE CASCADE,
  data_controlo timestamptz DEFAULT now(),
  cor_controlada text NOT NULL,
  tamanho_controlado text NOT NULL,
  responsavel text,
  resultado_geral text CHECK (resultado_geral IN ('Aprovado', 'Reprovado', 'Parcial')),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS controlo_qualidade_medidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registo_id uuid NOT NULL REFERENCES controlo_qualidade_registos(id) ON DELETE CASCADE,
  letra_medida text NOT NULL,
  descricao_medida text NOT NULL,
  medida_pedida_modelista numeric(10,2),
  tolerancia_modelista numeric(10,2),
  medida_registada numeric(10,2) NOT NULL,
  desvio numeric(10,2),
  passou_controlo boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS controlo_qualidade_comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registo_id uuid NOT NULL REFERENCES controlo_qualidade_registos(id) ON DELETE CASCADE,
  comentario text NOT NULL,
  usuario text NOT NULL DEFAULT 'Sistema',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ativar RLS
ALTER TABLE tabelas_medidas_modelista ENABLE ROW LEVEL SECURITY;
ALTER TABLE medidas_modelista_detalhes ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlo_qualidade_registos ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlo_qualidade_medidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlo_qualidade_adicional ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlo_qualidade_comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para tabelas_medidas_modelista
DROP POLICY IF EXISTS "Allow public read access on tabelas_medidas_modelista" ON tabelas_medidas_modelista;
CREATE POLICY "Allow public read access on tabelas_medidas_modelista"
  ON tabelas_medidas_modelista FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on tabelas_medidas_modelista" ON tabelas_medidas_modelista;
CREATE POLICY "Allow public insert on tabelas_medidas_modelista"
  ON tabelas_medidas_modelista FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on tabelas_medidas_modelista" ON tabelas_medidas_modelista;
CREATE POLICY "Allow public update on tabelas_medidas_modelista"
  ON tabelas_medidas_modelista FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on tabelas_medidas_modelista" ON tabelas_medidas_modelista;
CREATE POLICY "Allow public delete on tabelas_medidas_modelista"
  ON tabelas_medidas_modelista FOR DELETE TO public USING (true);

-- Políticas públicas para medidas_modelista_detalhes
DROP POLICY IF EXISTS "Allow public read access on medidas_modelista_detalhes" ON medidas_modelista_detalhes;
CREATE POLICY "Allow public read access on medidas_modelista_detalhes"
  ON medidas_modelista_detalhes FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on medidas_modelista_detalhes" ON medidas_modelista_detalhes;
CREATE POLICY "Allow public insert on medidas_modelista_detalhes"
  ON medidas_modelista_detalhes FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on medidas_modelista_detalhes" ON medidas_modelista_detalhes;
CREATE POLICY "Allow public update on medidas_modelista_detalhes"
  ON medidas_modelista_detalhes FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on medidas_modelista_detalhes" ON medidas_modelista_detalhes;
CREATE POLICY "Allow public delete on medidas_modelista_detalhes"
  ON medidas_modelista_detalhes FOR DELETE TO public USING (true);

-- Políticas públicas para controlo_qualidade_registos
DROP POLICY IF EXISTS "Allow public read access on controlo_qualidade_registos" ON controlo_qualidade_registos;
CREATE POLICY "Allow public read access on controlo_qualidade_registos"
  ON controlo_qualidade_registos FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on controlo_qualidade_registos" ON controlo_qualidade_registos;
CREATE POLICY "Allow public insert on controlo_qualidade_registos"
  ON controlo_qualidade_registos FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on controlo_qualidade_registos" ON controlo_qualidade_registos;
CREATE POLICY "Allow public update on controlo_qualidade_registos"
  ON controlo_qualidade_registos FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on controlo_qualidade_registos" ON controlo_qualidade_registos;
CREATE POLICY "Allow public delete on controlo_qualidade_registos"
  ON controlo_qualidade_registos FOR DELETE TO public USING (true);

-- Políticas públicas para controlo_qualidade_medidas
DROP POLICY IF EXISTS "Allow public read access on controlo_qualidade_medidas" ON controlo_qualidade_medidas;
CREATE POLICY "Allow public read access on controlo_qualidade_medidas"
  ON controlo_qualidade_medidas FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on controlo_qualidade_medidas" ON controlo_qualidade_medidas;
CREATE POLICY "Allow public insert on controlo_qualidade_medidas"
  ON controlo_qualidade_medidas FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on controlo_qualidade_medidas" ON controlo_qualidade_medidas;
CREATE POLICY "Allow public update on controlo_qualidade_medidas"
  ON controlo_qualidade_medidas FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on controlo_qualidade_medidas" ON controlo_qualidade_medidas;
CREATE POLICY "Allow public delete on controlo_qualidade_medidas"
  ON controlo_qualidade_medidas FOR DELETE TO public USING (true);

-- Políticas públicas para controlo_qualidade_adicional
DROP POLICY IF EXISTS "Allow public read access on controlo_qualidade_adicional" ON controlo_qualidade_adicional;
CREATE POLICY "Allow public read access on controlo_qualidade_adicional"
  ON controlo_qualidade_adicional FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on controlo_qualidade_adicional" ON controlo_qualidade_adicional;
CREATE POLICY "Allow public insert on controlo_qualidade_adicional"
  ON controlo_qualidade_adicional FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on controlo_qualidade_adicional" ON controlo_qualidade_adicional;
CREATE POLICY "Allow public update on controlo_qualidade_adicional"
  ON controlo_qualidade_adicional FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on controlo_qualidade_adicional" ON controlo_qualidade_adicional;
CREATE POLICY "Allow public delete on controlo_qualidade_adicional"
  ON controlo_qualidade_adicional FOR DELETE TO public USING (true);

-- Políticas públicas para controlo_qualidade_comentarios
DROP POLICY IF EXISTS "Allow public read access on controlo_qualidade_comentarios" ON controlo_qualidade_comentarios;
CREATE POLICY "Allow public read access on controlo_qualidade_comentarios"
  ON controlo_qualidade_comentarios FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on controlo_qualidade_comentarios" ON controlo_qualidade_comentarios;
CREATE POLICY "Allow public insert on controlo_qualidade_comentarios"
  ON controlo_qualidade_comentarios FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on controlo_qualidade_comentarios" ON controlo_qualidade_comentarios;
CREATE POLICY "Allow public update on controlo_qualidade_comentarios"
  ON controlo_qualidade_comentarios FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on controlo_qualidade_comentarios" ON controlo_qualidade_comentarios;
CREATE POLICY "Allow public delete on controlo_qualidade_comentarios"
  ON controlo_qualidade_comentarios FOR DELETE TO public USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tmm_producao ON tabelas_medidas_modelista(producao_id);
CREATE INDEX IF NOT EXISTS idx_mmd_tabela ON medidas_modelista_detalhes(tabela_id);
CREATE INDEX IF NOT EXISTS idx_cqr_producao ON controlo_qualidade_registos(producao_id);
CREATE INDEX IF NOT EXISTS idx_cqm_registo ON controlo_qualidade_medidas(registo_id);
CREATE INDEX IF NOT EXISTS idx_cqa_registo ON controlo_qualidade_adicional(registo_id);
CREATE INDEX IF NOT EXISTS idx_cqc_registo ON controlo_qualidade_comentarios(registo_id);