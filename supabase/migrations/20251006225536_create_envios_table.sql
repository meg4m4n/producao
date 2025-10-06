/*
  # Criar tabela de Envios

  1. Nova Tabela
    - `envios`
      - `id` (uuid, primary key)
      - `cliente_id` (uuid, foreign key → clientes.id)
      - `descricao` (text) - Descrição do envio
      - `responsavel` (text) - Nome do responsável
      - `pedido_por` (text) - Quem pediu (cliente/lomartex)
      - `pago_por` (text) - Quem paga (cliente/lomartex)
      - `transportadora` (text) - Nome da transportadora
      - `tracking` (text) - Código de tracking
      - `valor_custo` (numeric) - Valor de custo
      - `valor_cobrar` (numeric) - Valor a cobrar
      - `carta_porte_url` (text) - URL da carta de porte
      - `pago` (boolean) - Se foi pago
      - `pago_at` (timestamptz) - Data do pagamento
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Ativar RLS com políticas públicas
*/

-- Criar tabela de envios
CREATE TABLE IF NOT EXISTS envios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  descricao text NOT NULL DEFAULT '',
  responsavel text NOT NULL DEFAULT '',
  pedido_por text NOT NULL DEFAULT 'cliente' CHECK (pedido_por IN ('cliente', 'lomartex')),
  pago_por text NOT NULL DEFAULT 'cliente' CHECK (pago_por IN ('cliente', 'lomartex')),
  transportadora text NOT NULL DEFAULT '',
  tracking text DEFAULT '',
  valor_custo numeric(10, 2) NOT NULL DEFAULT 0,
  valor_cobrar numeric(10, 2) NOT NULL DEFAULT 0,
  carta_porte_url text,
  pago boolean DEFAULT false NOT NULL,
  pago_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ativar RLS
ALTER TABLE envios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS públicas
DROP POLICY IF EXISTS "Allow public read access on envios" ON envios;
CREATE POLICY "Allow public read access on envios"
  ON envios FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public insert on envios" ON envios;
CREATE POLICY "Allow public insert on envios"
  ON envios FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on envios" ON envios;
CREATE POLICY "Allow public update on envios"
  ON envios FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow public delete on envios" ON envios;
CREATE POLICY "Allow public delete on envios"
  ON envios FOR DELETE TO public USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_envios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS envios_updated_at ON envios;
CREATE TRIGGER envios_updated_at
  BEFORE UPDATE ON envios
  FOR EACH ROW
  EXECUTE FUNCTION update_envios_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS idx_envios_cliente_id ON envios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_envios_created_at ON envios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_envios_pago ON envios(pago);