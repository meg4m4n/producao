/*
  # Create locais_producao table

  1. New Tables
    - `locais_producao`
      - `id` (uuid, primary key)
      - `nome` (text, required)
      - `tipo` (text, check constraint for 'Interno'/'Externo')
      - `endereco` (text, optional)
      - `contacto` (text, optional)
      - `ativo` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `locais_producao` table
    - Add policies for public access (read, insert, update, delete)

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS public.locais_producao (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    tipo text CHECK (tipo IN ('Interno', 'Externo')) DEFAULT 'Interno' NOT NULL,
    endereco text,
    contacto text,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.locais_producao ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access on locais_producao"
  ON public.locais_producao
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on locais_producao"
  ON public.locais_producao
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on locais_producao"
  ON public.locais_producao
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on locais_producao"
  ON public.locais_producao
  FOR DELETE
  TO public
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_locais_producao_updated_at
  BEFORE UPDATE ON public.locais_producao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_locais_producao_ativo ON public.locais_producao(ativo);
CREATE INDEX IF NOT EXISTS idx_locais_producao_tipo ON public.locais_producao(tipo);