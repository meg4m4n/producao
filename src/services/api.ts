import { pool } from '../config/database';
import { Producao, Cliente, Marca } from '../types';

// Clientes
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, GROUP_CONCAT(m.nome) as marcas
      FROM clientes c
      LEFT JOIN marcas m ON c.id = m.cliente_id
      GROUP BY c.id, c.nome
      ORDER BY c.nome
    `);
    
    return (rows as any[]).map(row => ({
      id: row.id.toString(),
      nome: row.nome,
      marcas: row.marcas ? row.marcas.split(',') : []
    }));
  } catch (error) {
    console.error('Error fetching clientes:', error);
    return [];
  }
};

export const createCliente = async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Inserir cliente
    const [result] = await connection.execute(
      'INSERT INTO clientes (nome) VALUES (?)',
      [cliente.nome]
    );
    
    const clienteId = (result as any).insertId;
    
    // Inserir marcas
    for (const marca of cliente.marcas) {
      await connection.execute(
        'INSERT INTO marcas (nome, cliente_id) VALUES (?, ?)',
        [marca, clienteId]
      );
    }
    
    await connection.commit();
    
    return {
      id: clienteId.toString(),
      nome: cliente.nome,
      marcas: cliente.marcas
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateCliente = async (id: string, cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Atualizar cliente
    await connection.execute(
      'UPDATE clientes SET nome = ? WHERE id = ?',
      [cliente.nome, id]
    );
    
    // Remover marcas antigas
    await connection.execute('DELETE FROM marcas WHERE cliente_id = ?', [id]);
    
    // Inserir novas marcas
    for (const marca of cliente.marcas) {
      await connection.execute(
        'INSERT INTO marcas (nome, cliente_id) VALUES (?, ?)',
        [marca, id]
      );
    }
    
    await connection.commit();
    
    return {
      id,
      nome: cliente.nome,
      marcas: cliente.marcas
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteCliente = async (id: string): Promise<void> => {
  try {
    await pool.execute('DELETE FROM clientes WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting cliente:', error);
    throw error;
  }
};

// Marcas
export const getMarcas = async (): Promise<Marca[]> => {
  try {
    const [rows] = await pool.execute(`
      SELECT m.*, c.nome as cliente_nome
      FROM marcas m
      JOIN clientes c ON m.cliente_id = c.id
      ORDER BY c.nome, m.nome
    `);
    
    return (rows as any[]).map(row => ({
      id: row.id.toString(),
      nome: row.nome,
      clienteId: row.cliente_id.toString(),
      clienteNome: row.cliente_nome
    }));
  } catch (error) {
    console.error('Error fetching marcas:', error);
    return [];
  }
};

export const createMarca = async (marca: Omit<Marca, 'id' | 'clienteNome'>): Promise<Marca> => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO marcas (nome, cliente_id) VALUES (?, ?)',
      [marca.nome, marca.clienteId]
    );
    
    const [cliente] = await pool.execute('SELECT nome FROM clientes WHERE id = ?', [marca.clienteId]);
    
    return {
      id: (result as any).insertId.toString(),
      nome: marca.nome,
      clienteId: marca.clienteId,
      clienteNome: (cliente as any)[0].nome
    };
  } catch (error) {
    console.error('Error creating marca:', error);
    throw error;
  }
};

export const updateMarca = async (id: string, marca: Omit<Marca, 'id' | 'clienteNome'>): Promise<Marca> => {
  try {
    await pool.execute(
      'UPDATE marcas SET nome = ?, cliente_id = ? WHERE id = ?',
      [marca.nome, marca.clienteId, id]
    );
    
    const [cliente] = await pool.execute('SELECT nome FROM clientes WHERE id = ?', [marca.clienteId]);
    
    return {
      id,
      nome: marca.nome,
      clienteId: marca.clienteId,
      clienteNome: (cliente as any)[0].nome
    };
  } catch (error) {
    console.error('Error updating marca:', error);
    throw error;
  }
};

export const deleteMarca = async (id: string): Promise<void> => {
  try {
    await pool.execute('DELETE FROM marcas WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting marca:', error);
    throw error;
  }
};

// Produções
export const getProducoes = async (): Promise<Producao[]> => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.*,
        c.nome as cliente_nome,
        m.nome as marca_nome
      FROM producoes p
      JOIN clientes c ON p.cliente_id = c.id
      JOIN marcas m ON p.marca_id = m.id
      ORDER BY p.data_inicio DESC
    `);
    
    const producoes = await Promise.all((rows as any[]).map(async (row) => {
      // Buscar variantes
      const [variantes] = await pool.execute(`
        SELECT cor, tamanho, quantidade
        FROM producao_variantes
        WHERE producao_id = ?
        ORDER BY cor, tamanho
      `, [row.id]);
      
      // Agrupar por cor
      const variantesAgrupadas = (variantes as any[]).reduce((acc, v) => {
        const existing = acc.find((item: any) => item.cor === v.cor);
        if (existing) {
          existing.tamanhos[v.tamanho] = v.quantidade;
        } else {
          acc.push({
            cor: v.cor,
            tamanhos: { [v.tamanho]: v.quantidade }
          });
        }
        return acc;
      }, []);
      
      return {
        id: row.id.toString(),
        marca: row.marca_nome,
        cliente: row.cliente_nome,
        referenciaInterna: row.referencia_interna,
        referenciaCliente: row.referencia_cliente,
        descricao: row.descricao,
        tipoPeca: row.tipo_peca,
        genero: row.genero,
        variantes: variantesAgrupadas,
        etapa: row.etapa,
        estado: row.estado,
        dataInicio: row.data_inicio,
        dataPrevisao: row.data_previsao,
        dataEstimadaEntrega: row.data_estimada_entrega,
        emProducao: Boolean(row.em_producao),
        localProducao: row.local_producao,
        empresaExterna: row.empresa_externa,
        linkOdoo: row.link_odoo
      };
    }));
    
    return producoes;
  } catch (error) {
    console.error('Error fetching producoes:', error);
    return [];
  }
};

export const createProducao = async (producao: Omit<Producao, 'id'>): Promise<Producao> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Buscar IDs de marca e cliente
    const [marca] = await connection.execute('SELECT id FROM marcas WHERE nome = ?', [producao.marca]);
    const [cliente] = await connection.execute('SELECT id FROM clientes WHERE nome = ?', [producao.cliente]);
    
    const marcaId = (marca as any)[0].id;
    const clienteId = (cliente as any)[0].id;
    
    // Inserir produção
    const [result] = await connection.execute(`
      INSERT INTO producoes (
        marca_id, cliente_id, referencia_interna, referencia_cliente,
        descricao, tipo_peca, genero, etapa, estado,
        data_inicio, data_previsao, data_estimada_entrega,
        em_producao, local_producao, empresa_externa, link_odoo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      marcaId, clienteId, producao.referenciaInterna, producao.referenciaCliente,
      producao.descricao, producao.tipoPeca, producao.genero, producao.etapa, producao.estado,
      producao.dataInicio, producao.dataPrevisao, producao.dataEstimadaEntrega,
      producao.emProducao, producao.localProducao, producao.empresaExterna, producao.linkOdoo
    ]);
    
    const producaoId = (result as any).insertId;
    
    // Inserir variantes
    for (const variante of producao.variantes) {
      for (const [tamanho, quantidade] of Object.entries(variante.tamanhos)) {
        if (quantidade > 0) {
          await connection.execute(`
            INSERT INTO producao_variantes (producao_id, cor, tamanho, quantidade)
            VALUES (?, ?, ?, ?)
          `, [producaoId, variante.cor, tamanho, quantidade]);
        }
      }
    }
    
    await connection.commit();
    
    return {
      ...producao,
      id: producaoId.toString()
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateProducao = async (id: string, producao: Omit<Producao, 'id'>): Promise<Producao> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Buscar IDs de marca e cliente
    const [marca] = await connection.execute('SELECT id FROM marcas WHERE nome = ?', [producao.marca]);
    const [cliente] = await connection.execute('SELECT id FROM clientes WHERE nome = ?', [producao.cliente]);
    
    const marcaId = (marca as any)[0].id;
    const clienteId = (cliente as any)[0].id;
    
    // Atualizar produção
    await connection.execute(`
      UPDATE producoes SET
        marca_id = ?, cliente_id = ?, referencia_interna = ?, referencia_cliente = ?,
        descricao = ?, tipo_peca = ?, genero = ?, etapa = ?, estado = ?,
        data_inicio = ?, data_previsao = ?, data_estimada_entrega = ?,
        em_producao = ?, local_producao = ?, empresa_externa = ?, link_odoo = ?
      WHERE id = ?
    `, [
      marcaId, clienteId, producao.referenciaInterna, producao.referenciaCliente,
      producao.descricao, producao.tipoPeca, producao.genero, producao.etapa, producao.estado,
      producao.dataInicio, producao.dataPrevisao, producao.dataEstimadaEntrega,
      producao.emProducao, producao.localProducao, producao.empresaExterna, producao.linkOdoo,
      id
    ]);
    
    // Remover variantes antigas
    await connection.execute('DELETE FROM producao_variantes WHERE producao_id = ?', [id]);
    
    // Inserir novas variantes
    for (const variante of producao.variantes) {
      for (const [tamanho, quantidade] of Object.entries(variante.tamanhos)) {
        if (quantidade > 0) {
          await connection.execute(`
            INSERT INTO producao_variantes (producao_id, cor, tamanho, quantidade)
            VALUES (?, ?, ?, ?)
          `, [id, variante.cor, tamanho, quantidade]);
        }
      }
    }
    
    await connection.commit();
    
    return {
      ...producao,
      id
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteProducao = async (id: string): Promise<void> => {
  try {
    await pool.execute('DELETE FROM producoes WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting producao:', error);
    throw error;
  }
};