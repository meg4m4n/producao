/*
  # Create tipos_peca table

  1. New Tables
    - `tipos_peca`
      - `id` (uuid, primary key)
      - `nome` (text, required)
      - `descricao` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `tipos_peca` table
    - Add policies for public access (read, insert, update, delete)

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS public.tipos_peca (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    descricao text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.tipos_peca ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access on tipos_peca"
  ON public.tipos_peca
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on tipos_peca"
  ON public.tipos_peca
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on tipos_peca"
  ON public.tipos_peca
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on tipos_peca"
  ON public.tipos_peca
  FOR DELETE
  TO public
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_tipos_peca_updated_at
  BEFORE UPDATE ON public.tipos_peca
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tipos_peca_nome ON public.tipos_peca(nome);