/*
  # Create users and authentication system

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (enum: admin, user)
      - `permissions` (jsonb)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for user management
    - Only admins can manage users
    - Users can read their own data

  3. Initial Data
    - Create admin user
*/

-- Create role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  permissions jsonb DEFAULT '[]'::jsonb,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Only admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Only admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Only admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin'
  ));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert admin user
INSERT INTO users (id, email, name, role, permissions) 
VALUES (
  gen_random_uuid(),
  'rmegaguimaraes@gmail.com',
  'Rui Guimarães',
  'admin',
  '[
    {"page": "producoes", "canView": true, "canEdit": true},
    {"page": "preparar-componentes", "canView": true, "canEdit": true},
    {"page": "gantt", "canView": true, "canEdit": true},
    {"page": "registos", "canView": true, "canEdit": true},
    {"page": "historico", "canView": true, "canEdit": true},
    {"page": "apps-lomartex", "canView": true, "canEdit": true},
    {"page": "controlo-qualidade", "canView": true, "canEdit": true},
    {"page": "financeiro", "canView": true, "canEdit": true},
    {"page": "users", "canView": true, "canEdit": true}
  ]'::jsonb
) ON CONFLICT (email) DO NOTHING;