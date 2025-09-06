/*
  # Add password field to users and financial fields to producoes

  1. User Management Updates
    - Add `password` field to `users` table for admin-assigned passwords
    - Update existing user with default password

  2. Financial Management Updates
    - Add `pago_parcial` boolean field to track partial payments
    - Add `pagamentos` JSONB field to store payment history
    - Add `valor_pago` numeric field for total paid amount
    - Add `valor_restante` numeric field for remaining amount
    - Add `observacoes_financeiras` text field for financial notes

  3. Security
    - Maintain existing RLS policies
*/

-- Add password field to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password text NOT NULL DEFAULT 'temp123';
  END IF;
END $$;

-- Add financial fields to producoes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'pago_parcial'
  ) THEN
    ALTER TABLE producoes ADD COLUMN pago_parcial boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'pagamentos'
  ) THEN
    ALTER TABLE producoes ADD COLUMN pagamentos jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'valor_pago'
  ) THEN
    ALTER TABLE producoes ADD COLUMN valor_pago numeric(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'valor_restante'
  ) THEN
    ALTER TABLE producoes ADD COLUMN valor_restante numeric(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producoes' AND column_name = 'observacoes_financeiras'
  ) THEN
    ALTER TABLE producoes ADD COLUMN observacoes_financeiras text;
  END IF;
END $$;

-- Update existing admin user with proper password
UPDATE users 
SET password = 'mega$3311225' 
WHERE email = 'rmegaguimaraes@gmail.com';

-- Create users table if it doesn't exist (for new installations)
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

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Allow public read access on users'
  ) THEN
    CREATE POLICY "Allow public read access on users"
      ON users
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Allow public insert on users'
  ) THEN
    CREATE POLICY "Allow public insert on users"
      ON users
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Allow public update on users'
  ) THEN
    CREATE POLICY "Allow public update on users"
      ON users
      FOR UPDATE
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Allow public delete on users'
  ) THEN
    CREATE POLICY "Allow public delete on users"
      ON users
      FOR DELETE
      TO public
      USING (true);
  END IF;
END $$;

-- Insert default admin user if not exists
INSERT INTO users (email, name, password, role, permissions)
SELECT 'rmegaguimaraes@gmail.com', 'Rui Guimarães', 'mega$3311225', 'admin', '[]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'rmegaguimaraes@gmail.com'
);

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