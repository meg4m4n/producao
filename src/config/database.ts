import mysql from 'mysql2/promise';

const dbConfig = {
  host: '94.46.180.1',
  port: 3306,
  database: 'lomarte1_lomproducao_mysql',
  user: 'lomarte1_lomprodadm',
  password: 'Mega$237343509',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const pool = mysql.createPool(dbConfig);

export const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Criar tabela de clientes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de marcas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS marcas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cliente_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_marca_cliente (nome, cliente_id)
      )
    `);

    // Criar tabela de produções
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS producoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        marca_id INT NOT NULL,
        cliente_id INT NOT NULL,
        referencia_interna VARCHAR(255) NOT NULL UNIQUE,
        referencia_cliente VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        tipo_peca VARCHAR(255) NOT NULL,
        genero ENUM('Masculino', 'Feminino', 'Unissexo') NOT NULL DEFAULT 'Unissexo',
        etapa ENUM('Desenvolvimento', '1º proto', '2º proto', 'Size-Set', 'PPS', 'Produção', 'Pronto', 'Enviado') NOT NULL DEFAULT 'Desenvolvimento',
        estado ENUM('Modelagem', 'Aguarda Componentes', 'Aguarda Malha', 'Com Defeito', 'Aguarda Comentários', 'Corte', 'Confecção', 'Transfers', 'Serviços Externos', 'Embalamento') NOT NULL DEFAULT 'Modelagem',
        data_inicio DATE NOT NULL,
        data_previsao DATE NOT NULL,
        data_estimada_entrega DATE NOT NULL,
        em_producao BOOLEAN DEFAULT FALSE,
        local_producao ENUM('Interno', 'Externo') NOT NULL DEFAULT 'Interno',
        empresa_externa VARCHAR(255) NULL,
        link_odoo TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE CASCADE,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      )
    `);

    // Criar tabela de variantes (cores e tamanhos)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS producao_variantes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producao_id INT NOT NULL,
        cor VARCHAR(255) NOT NULL,
        tamanho VARCHAR(10) NOT NULL,
        quantidade INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (producao_id) REFERENCES producoes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_producao_cor_tamanho (producao_id, cor, tamanho)
      )
    `);

    connection.release();
    console.log('Database initialized successfully');
    
    // Inserir dados demo
    await insertDemoData();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

const insertDemoData = async () => {
  try {
    const connection = await pool.getConnection();

    // Verificar se já existem dados
    const [existingClientes] = await connection.execute('SELECT COUNT(*) as count FROM clientes');
    if ((existingClientes as any)[0].count > 0) {
      connection.release();
      return; // Dados já existem
    }

    // Inserir clientes demo
    await connection.execute(`
      INSERT INTO clientes (nome) VALUES 
      ('Cliente A'),
      ('Cliente B')
    `);

    // Obter IDs dos clientes
    const [clienteA] = await connection.execute('SELECT id FROM clientes WHERE nome = ?', ['Cliente A']);
    const [clienteB] = await connection.execute('SELECT id FROM clientes WHERE nome = ?', ['Cliente B']);
    
    const clienteAId = (clienteA as any)[0].id;
    const clienteBId = (clienteB as any)[0].id;

    // Inserir marcas demo
    await connection.execute(`
      INSERT INTO marcas (nome, cliente_id) VALUES 
      ('Marca X', ?),
      ('Marca Y', ?)
    `, [clienteAId, clienteBId]);

    // Obter IDs das marcas
    const [marcaX] = await connection.execute('SELECT id FROM marcas WHERE nome = ?', ['Marca X']);
    const [marcaY] = await connection.execute('SELECT id FROM marcas WHERE nome = ?', ['Marca Y']);
    
    const marcaXId = (marcaX as any)[0].id;
    const marcaYId = (marcaY as any)[0].id;

    // Inserir produções demo
    await connection.execute(`
      INSERT INTO producoes (
        marca_id, cliente_id, referencia_interna, referencia_cliente, 
        descricao, tipo_peca, genero, etapa, estado,
        data_inicio, data_previsao, data_estimada_entrega,
        em_producao, local_producao, link_odoo
      ) VALUES 
      (?, ?, 'REF001', 'CLI-A-001', 'Hoodie Modelo A', 'Hoodie', 'Unissexo', 'Produção', 'Confecção', '2025-09-01', '2025-09-10', '2025-09-10', TRUE, 'Externo', 'https://odoo.example.com/production/1'),
      (?, ?, 'REF002', 'CLI-B-002', 'T-Shirt Modelo B', 'T-Shirt', 'Unissexo', 'Desenvolvimento', 'Modelagem', '2025-09-02', '2025-09-12', '2025-09-12', FALSE, 'Interno', 'https://odoo.example.com/production/2')
    `, [marcaXId, clienteAId, marcaYId, clienteBId]);

    // Obter IDs das produções
    const [producao1] = await connection.execute('SELECT id FROM producoes WHERE referencia_interna = ?', ['REF001']);
    const [producao2] = await connection.execute('SELECT id FROM producoes WHERE referencia_interna = ?', ['REF002']);
    
    const producao1Id = (producao1 as any)[0].id;
    const producao2Id = (producao2 as any)[0].id;

    // Inserir variantes demo
    await connection.execute(`
      INSERT INTO producao_variantes (producao_id, cor, tamanho, quantidade) VALUES 
      (?, 'Preto', 'M', 40),
      (?, 'Preto', 'L', 50),
      (?, 'Preto', 'XL', 30),
      (?, 'Branco', 'S', 30),
      (?, 'Branco', 'M', 30),
      (?, 'Branco', 'L', 20)
    `, [producao1Id, producao1Id, producao1Id, producao2Id, producao2Id, producao2Id]);

    connection.release();
    console.log('Demo data inserted successfully');
    
  } catch (error) {
    console.error('Error inserting demo data:', error);
  }
};