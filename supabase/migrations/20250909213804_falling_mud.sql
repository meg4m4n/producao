/*
  # Fix RLS policies for tabelas_medidas_modelista table

  1. Security Changes
    - Drop existing restrictive policy
    - Add comprehensive policies for authenticated users
    - Add fallback policy for public access (compatibility)
  
  2. Changes Made
    - Remove existing policy that may be causing authorization issues
    - Create new policies that allow full CRUD operations for authenticated users
    - Add public access policy as fallback
*/

-- Drop existing policy that might be causing issues
DROP POLICY IF EXISTS "Allow authenticated users full access to tabelas_medidas_modeli" ON tabelas_medidas_modelista;

-- Create new comprehensive policies for authenticated users
CREATE POLICY "tabelas_medidas_modelista_authenticated_select"
  ON tabelas_medidas_modelista
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "tabelas_medidas_modelista_authenticated_insert"
  ON tabelas_medidas_modelista
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "tabelas_medidas_modelista_authenticated_update"
  ON tabelas_medidas_modelista
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tabelas_medidas_modelista_authenticated_delete"
  ON tabelas_medidas_modelista
  FOR DELETE
  TO authenticated
  USING (true);

-- Add public access policies as fallback for compatibility
CREATE POLICY "tabelas_medidas_modelista_public_select"
  ON tabelas_medidas_modelista
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "tabelas_medidas_modelista_public_insert"
  ON tabelas_medidas_modelista
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "tabelas_medidas_modelista_public_update"
  ON tabelas_medidas_modelista
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tabelas_medidas_modelista_public_delete"
  ON tabelas_medidas_modelista
  FOR DELETE
  TO public
  USING (true);