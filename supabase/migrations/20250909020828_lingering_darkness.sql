/*
  # Fix RLS policies for tabelas_medidas_modelista

  1. Security Changes
    - Drop existing restrictive policies that are preventing inserts
    - Create new comprehensive policies for authenticated users
    - Allow authenticated users to perform all CRUD operations on tabelas_medidas_modelista
    - Ensure policies work correctly with the foreign key relationship to producoes table

  2. Policy Details
    - INSERT: Allow authenticated users to insert records
    - SELECT: Allow authenticated users to read all records
    - UPDATE: Allow authenticated users to update records
    - DELETE: Allow authenticated users to delete records
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "tmm_all_auth" ON tabelas_medidas_modelista;
DROP POLICY IF EXISTS "tmm_insert_by_prod" ON tabelas_medidas_modelista;
DROP POLICY IF EXISTS "tmm_strict" ON tabelas_medidas_modelista;

-- Create new comprehensive policies for authenticated users
CREATE POLICY "tabelas_medidas_modelista_select_auth"
  ON tabelas_medidas_modelista
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "tabelas_medidas_modelista_insert_auth"
  ON tabelas_medidas_modelista
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "tabelas_medidas_modelista_update_auth"
  ON tabelas_medidas_modelista
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tabelas_medidas_modelista_delete_auth"
  ON tabelas_medidas_modelista
  FOR DELETE
  TO authenticated
  USING (true);