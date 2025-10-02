/*
  # Criar tabela de Envios

  1. Nova Tabela
    - `envios`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `cliente_id` (uuid, foreign key → clientes.id)
      - `descricao` (text) - Descrição do envio
      - `responsavel` (text) - Nome do responsável pelo envio
      - `pedido_por` (text) - Quem pediu o envio (cliente/lomartex)
      - `pago_por` (text) - Quem paga o envio (cliente/lomartex)
      - `transportadora` (text) - Nome da transportadora
      - `tracking` (text) - Código de tracking
      - `valor_custo` (numeric) - Valor de custo do envio
      - `valor_cobrar` (numeric) - Valor a cobrar ao cliente
      - `carta_porte_url` (text, nullable) - URL da carta de porte no storage
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Segurança
    - Ativar RLS na tabela `envios`
    - Políticas para utilizadores autenticados poderem:
      - Visualizar todos os envios
      - Criar novos envios
      - Atualizar envios existentes
      - Eliminar envios

  3. Notas Importantes
    - A tabela tem relação com `clientes` via `cliente_id`
    - O campo `carta_porte_url` guarda o link público do storage
    - Os valores monetários usam tipo NUMERIC para precisão
    - Trigger automático para atualizar `updated_at`
*/

-- Criar tabela de envios
CREATE TABLE IF NOT EXISTS envios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid,
  descricao text NOT NULL DEFAULT '',
  responsavel text NOT NULL DEFAULT '',
  pedido_por text NOT NULL DEFAULT 'cliente' CHECK (pedido_por IN ('cliente', 'lomartex')),
  pago_por text NOT NULL DEFAULT 'cliente' CHECK (pago_por IN ('cliente', 'lomartex')),
  transportadora text NOT NULL DEFAULT '',
  tracking text DEFAULT '',
  valor_custo numeric(10, 2) NOT NULL DEFAULT 0,
  valor_cobrar numeric(10, 2) NOT NULL DEFAULT 0,
  carta_porte_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adicionar foreign key se a tabela clientes existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clientes') THEN
    ALTER TABLE envios ADD CONSTRAINT fk_envios_cliente 
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ativar RLS
ALTER TABLE envios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para utilizadores autenticados
CREATE POLICY "Utilizadores autenticados podem ver envios"
  ON envios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilizadores autenticados podem criar envios"
  ON envios
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Utilizadores autenticados podem atualizar envios"
  ON envios
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Utilizadores autenticados podem eliminar envios"
  ON envios
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_envios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER envios_updated_at
  BEFORE UPDATE ON envios
  FOR EACH ROW
  EXECUTE FUNCTION update_envios_updated_at();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_envios_cliente_id ON envios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_envios_created_at ON envios(created_at DESC);