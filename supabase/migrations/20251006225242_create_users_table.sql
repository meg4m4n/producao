/*
  # Create users table and authentication system

  1. New Tables
    - `users` - User management table
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `password` (text)
      - `role` (enum: admin, user)
      - `permissions` (jsonb)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add public policies for user management

  3. Initial Data
    - Create admin user with default password
*/

-- Create role enum if not exists
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
  password text NOT NULL DEFAULT 'temp123',
  role user_role DEFAULT 'user',
  permissions jsonb DEFAULT '[]'::jsonb,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on users" ON users;
DROP POLICY IF EXISTS "Allow public insert on users" ON users;
DROP POLICY IF EXISTS "Allow public update on users" ON users;
DROP POLICY IF EXISTS "Allow public delete on users" ON users;

-- Create policies for users table
CREATE POLICY "Allow public read access on users"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on users"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on users"
  ON users
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on users"
  ON users
  FOR DELETE
  TO public
  USING (true);

-- Create trigger for updated_at if not exists
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

-- Insert default admin user
INSERT INTO users (email, name, password, role, permissions)
VALUES (
  'rmegaguimaraes@gmail.com',
  'Rui Guimarães',
  'mega$3311225',
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
    {"page": "envios", "canView": true, "canEdit": true},
    {"page": "users", "canView": true, "canEdit": true}
  ]'::jsonb
) ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  permissions = EXCLUDED.permissions;