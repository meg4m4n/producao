/*
  # Insert Demo Data for Productions System

  1. Demo Data
    - Insert sample clients with their brands
    - Insert sample productions with variants
    - Insert sample BOM files

  2. Data Structure
    - Maintains the existing demo data structure
    - Preserves all relationships between entities
*/

-- Insert demo clients
INSERT INTO clientes (nome) VALUES 
  ('SportZone'),
  ('Decathlon'),
  ('JD Sports'),
  ('Intersport'),
  ('El Corte Inglés'),
  ('Zalando'),
  ('Amazon'),
  ('Fnac')
ON CONFLICT (nome) DO NOTHING;

-- Get client IDs for reference
DO $$
DECLARE
  sportzone_id uuid;
  decathlon_id uuid;
  jdsports_id uuid;
  intersport_id uuid;
  elcorte_id uuid;
  zalando_id uuid;
  amazon_id uuid;
  fnac_id uuid;
  
  nike_id uuid;
  adidas_id uuid;
  puma_id uuid;
  underarmour_id uuid;
  lacoste_id uuid;
  ralphlauren_id uuid;
  tommyhilfiger_id uuid;
  calvinklein_id uuid;
  
  prod1_id uuid;
  prod2_id uuid;
  prod3_id uuid;
  prod4_id uuid;
  prod5_id uuid;
  prod6_id uuid;
  prod7_id uuid;
  prod8_id uuid;
  prod9_id uuid;
BEGIN
  -- Get client IDs
  SELECT id INTO sportzone_id FROM clientes WHERE nome = 'SportZone';
  SELECT id INTO decathlon_id FROM clientes WHERE nome = 'Decathlon';
  SELECT id INTO jdsports_id FROM clientes WHERE nome = 'JD Sports';
  SELECT id INTO intersport_id FROM clientes WHERE nome = 'Intersport';
  SELECT id INTO elcorte_id FROM clientes WHERE nome = 'El Corte Inglés';
  SELECT id INTO zalando_id FROM clientes WHERE nome = 'Zalando';
  SELECT id INTO amazon_id FROM clientes WHERE nome = 'Amazon';
  SELECT id INTO fnac_id FROM clientes WHERE nome = 'Fnac';

  -- Insert brands
  INSERT INTO marcas (nome, cliente_id) VALUES 
    ('Nike', sportzone_id),
    ('Adidas', sportzone_id),
    ('Puma', sportzone_id),
    ('Adidas', decathlon_id),
    ('Under Armour', decathlon_id),
    ('Quechua', decathlon_id),
    ('Puma', jdsports_id),
    ('Nike', jdsports_id),
    ('Jordan', jdsports_id),
    ('Under Armour', intersport_id),
    ('Nike', intersport_id),
    ('Adidas', intersport_id),
    ('Lacoste', elcorte_id),
    ('Ralph Lauren', elcorte_id),
    ('Tommy Hilfiger', elcorte_id),
    ('Ralph Lauren', zalando_id),
    ('Calvin Klein', zalando_id),
    ('Tommy Hilfiger', zalando_id),
    ('Tommy Hilfiger', amazon_id),
    ('Calvin Klein', amazon_id),
    ('Lacoste', amazon_id),
    ('Calvin Klein', fnac_id),
    ('Nike', fnac_id),
    ('Adidas', fnac_id)
  ON CONFLICT (nome, cliente_id) DO NOTHING;

  -- Get brand IDs
  SELECT id INTO nike_id FROM marcas WHERE nome = 'Nike' AND cliente_id = sportzone_id;
  SELECT id INTO adidas_id FROM marcas WHERE nome = 'Adidas' AND cliente_id = decathlon_id;
  SELECT id INTO puma_id FROM marcas WHERE nome = 'Puma' AND cliente_id = jdsports_id;
  SELECT id INTO underarmour_id FROM marcas WHERE nome = 'Under Armour' AND cliente_id = intersport_id;
  SELECT id INTO lacoste_id FROM marcas WHERE nome = 'Lacoste' AND cliente_id = elcorte_id;
  SELECT id INTO ralphlauren_id FROM marcas WHERE nome = 'Ralph Lauren' AND cliente_id = zalando_id;
  SELECT id INTO tommyhilfiger_id FROM marcas WHERE nome = 'Tommy Hilfiger' AND cliente_id = amazon_id;
  SELECT id INTO calvinklein_id FROM marcas WHERE nome = 'Calvin Klein' AND cliente_id = fnac_id;

  -- Insert productions
  INSERT INTO producoes (
    marca_id, cliente_id, referencia_interna, referencia_cliente,
    descricao, tipo_peca, genero, etapa, estado,
    data_inicio, data_previsao, data_estimada_entrega,
    em_producao, problemas, local_producao, link_odoo, comments
  ) VALUES 
    (nike_id, sportzone_id, 'NK-001-2025', 'SZ-NIKE-TT-01', 'T-shirt básica com logotipo Nike', 'T-Shirt', 'Unissexo', 'Desenvolvimento', 'Modelagem', '2025-01-15', '2025-02-28', '2025-03-05', true, false, 'Interno', 'https://odoo.example.com/production/1', 'Aguardando aprovação do protótipo pelo cliente antes de prosseguir com os componentes.'),
    (adidas_id, decathlon_id, 'AD-002-2025', 'DEC-AD-HD-02', 'Hoodie com capuz e bolso frontal', 'Hoodie', 'Masculino', '1º proto', 'Aguarda Componentes', '2025-01-10', '2025-03-15', '2025-03-20', true, true, 'Externo', null, 'Falta confirmação do fornecedor de zíperes. Componente principal em atraso de 5 dias.'),
    (puma_id, jdsports_id, 'PM-003-2025', 'JD-PM-PL-03', 'Polo com gola em contraste', 'Polo', 'Feminino', '2º proto', 'Confecção', '2025-01-05', '2025-02-20', '2025-02-25', true, false, 'Interno', null, null),
    (underarmour_id, intersport_id, 'UA-004-2025', 'INT-UA-JK-04', 'Jacket técnica com detalhes refletivos', 'Jacket', 'Masculino', 'PPS', 'Transfers', '2025-01-01', '2025-03-01', '2025-01-28', false, false, 'Externo', null, null),
    (lacoste_id, elcorte_id, 'LC-005-2025', 'ECI-LC-PL-05', 'Polo clássico com crocodilo bordado', 'Polo', 'Unissexo', 'Produção', 'Embalamento', '2024-12-20', '2025-02-10', '2025-02-15', true, false, 'Interno', null, null),
    (ralphlauren_id, zalando_id, 'RL-006-2025', 'ZAL-RL-TT-06', 'T-shirt premium com logo bordado', 'T-Shirt', 'Feminino', 'Pronto', 'Embalamento', '2024-12-15', '2025-01-30', '2025-01-30', false, false, 'Interno', null, null),
    (tommyhilfiger_id, amazon_id, 'TH-007-2025', 'AMZ-TH-HD-07', 'Hoodie com forro interior suave', 'Hoodie', 'Masculino', 'Enviado', 'Embalamento', '2024-12-01', '2025-01-15', '2025-01-15', false, false, 'Interno', null, null),
    (calvinklein_id, fnac_id, 'CK-008-2025', 'FNC-CK-TT-08', 'T-shirt minimalista com etiqueta lateral', 'T-Shirt', 'Unissexo', 'Size-Set', 'Aguarda Comentários', '2025-01-12', '2025-03-05', '2025-01-27', true, true, 'Externo', null, null)
  ON CONFLICT (referencia_interna) DO NOTHING;

  -- Get production IDs for variants
  SELECT id INTO prod1_id FROM producoes WHERE referencia_interna = 'NK-001-2025';
  SELECT id INTO prod2_id FROM producoes WHERE referencia_interna = 'AD-002-2025';
  SELECT id INTO prod3_id FROM producoes WHERE referencia_interna = 'PM-003-2025';
  SELECT id INTO prod4_id FROM producoes WHERE referencia_interna = 'UA-004-2025';
  SELECT id INTO prod5_id FROM producoes WHERE referencia_interna = 'LC-005-2025';
  SELECT id INTO prod6_id FROM producoes WHERE referencia_interna = 'RL-006-2025';
  SELECT id INTO prod7_id FROM producoes WHERE referencia_interna = 'TH-007-2025';
  SELECT id INTO prod8_id FROM producoes WHERE referencia_interna = 'CK-008-2025';

  -- Insert production variants
  INSERT INTO producao_variantes (producao_id, cor, tamanho, quantidade) VALUES 
    -- NK-001-2025 variants
    (prod1_id, 'Preto', 'S', 30),
    (prod1_id, 'Preto', 'M', 50),
    (prod1_id, 'Preto', 'L', 40),
    (prod1_id, 'Preto', 'XL', 30),
    (prod1_id, 'Branco', 'S', 25),
    (prod1_id, 'Branco', 'M', 45),
    (prod1_id, 'Branco', 'L', 35),
    (prod1_id, 'Branco', 'XL', 25),
    
    -- AD-002-2025 variants
    (prod2_id, 'Azul Marinho', 'M', 20),
    (prod2_id, 'Azul Marinho', 'L', 30),
    (prod2_id, 'Azul Marinho', 'XL', 30),
    
    -- PM-003-2025 variants
    (prod3_id, 'Rosa', 'XS', 40),
    (prod3_id, 'Rosa', 'S', 60),
    (prod3_id, 'Rosa', 'M', 50),
    (prod3_id, 'Rosa', 'L', 30),
    (prod3_id, 'Branco', 'XS', 20),
    (prod3_id, 'Branco', 'S', 40),
    (prod3_id, 'Branco', 'M', 30),
    (prod3_id, 'Branco', 'L', 20),
    
    -- UA-004-2025 variants
    (prod4_id, 'Preto', 'L', 25),
    (prod4_id, 'Preto', 'XL', 25),
    
    -- LC-005-2025 variants
    (prod5_id, 'Branco', 'S', 50),
    (prod5_id, 'Branco', 'M', 100),
    (prod5_id, 'Branco', 'L', 75),
    (prod5_id, 'Branco', 'XL', 50),
    (prod5_id, 'Azul Marinho', 'S', 25),
    (prod5_id, 'Azul Marinho', 'M', 50),
    (prod5_id, 'Azul Marinho', 'L', 40),
    (prod5_id, 'Azul Marinho', 'XL', 25),
    
    -- RL-006-2025 variants
    (prod6_id, 'Rosa Claro', 'XS', 30),
    (prod6_id, 'Rosa Claro', 'S', 40),
    (prod6_id, 'Rosa Claro', 'M', 30),
    (prod6_id, 'Rosa Claro', 'L', 20),
    
    -- TH-007-2025 variants
    (prod7_id, 'Cinzento', 'M', 30),
    (prod7_id, 'Cinzento', 'L', 35),
    (prod7_id, 'Cinzento', 'XL', 25),
    
    -- CK-008-2025 variants
    (prod8_id, 'Preto', 'S', 45),
    (prod8_id, 'Preto', 'M', 60),
    (prod8_id, 'Preto', 'L', 45),
    (prod8_id, 'Preto', 'XL', 30)
  ON CONFLICT (producao_id, cor, tamanho) DO NOTHING;

  -- Insert sample BOM files
  INSERT INTO bom_files (producao_id, nome, url, upload_date) VALUES 
    (prod2_id, 'BOM_Hoodie_Adidas_v1.pdf', 'https://storage.example.com/bom/BOM_Hoodie_Adidas_v1.pdf', '2025-01-20T10:30:00Z')
  ON CONFLICT DO NOTHING;

  -- Add one more production for Nike SportZone
  SELECT id INTO nike_id FROM marcas WHERE nome = 'Nike' AND cliente_id = sportzone_id;
  
  INSERT INTO producoes (
    marca_id, cliente_id, referencia_interna, referencia_cliente,
    descricao, tipo_peca, genero, etapa, estado,
    data_inicio, data_previsao, data_estimada_entrega,
    em_producao, problemas, local_producao, comments
  ) VALUES 
    (nike_id, sportzone_id, 'NK-009-2025', 'SZ-NIKE-SW-09', 'Sweatshirt com capuz e cordões', 'Sweatshirt', 'Unissexo', 'Desenvolvimento', 'FALTA COMPONENTES', '2025-01-18', '2025-03-10', '2025-03-15', false, true, 'Interno', 'Fornecedor de cordões não consegue entregar a tempo. Procurando alternativas.')
  ON CONFLICT (referencia_interna) DO NOTHING;

  -- Get the new production ID and add variants
  SELECT id INTO prod9_id FROM producoes WHERE referencia_interna = 'NK-009-2025';
  
  IF prod9_id IS NOT NULL THEN
    INSERT INTO producao_variantes (producao_id, cor, tamanho, quantidade) VALUES 
      (prod9_id, 'Cinzento', 'M', 40),
      (prod9_id, 'Cinzento', 'L', 50),
      (prod9_id, 'Cinzento', 'XL', 30)
    ON CONFLICT (producao_id, cor, tamanho) DO NOTHING;
  END IF;

  -- Update empresa_externa for external productions
  UPDATE producoes SET empresa_externa = 'TextilPro Lda' WHERE referencia_interna = 'AD-002-2025';
  UPDATE producoes SET empresa_externa = 'Fashion Works' WHERE referencia_interna = 'UA-004-2025';
  UPDATE producoes SET empresa_externa = 'Premium Textiles' WHERE referencia_interna = 'CK-008-2025';
END $$;