import { supabase } from '../lib/supabase';
import { Producao, Cliente, BOMFile } from '../types';

// Helper function to transform database row to Producao type
const transformProducaoFromDB = (row: any, variantes: any[], bomFiles: any[] = []): Producao => {
  // Group variants by color
  const variantesAgrupadas = variantes.reduce((acc, v) => {
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
    id: row.id,
    marca: row.marcas?.nome || '',
    cliente: row.clientes?.nome || '',
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
    emProducao: row.em_producao,
    problemas: row.problemas,
    localProducao: row.local_producao,
    empresaExterna: row.empresa_externa,
    linkOdoo: row.link_odoo,
    comments: row.comments,
    pago: row.pago,
    fastprod: row.fastprod,
    numeroFatura: row.numero_fatura,
    dataFatura: row.data_fatura,
    valorFatura: row.valor_fatura,
    bomFiles: bomFiles.map(bf => ({
      id: bf.id,
      name: bf.nome,
      url: bf.url,
      uploadDate: bf.upload_date
    }))
  };
};

// Clientes
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');

    if (clientesError) throw clientesError;

    const { data: marcas, error: marcasError } = await supabase
      .from('marcas')
      .select('*');

    if (marcasError) throw marcasError;

    return clientes.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome,
      marcas: marcas
        .filter(marca => marca.cliente_id === cliente.id)
        .map(marca => marca.nome)
    }));
  } catch (error) {
    console.error('Error fetching clientes:', error);
    return [];
  }
};

export const createCliente = async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  try {
    // Insert client
    const { data: novoCliente, error: clienteError } = await supabase
      .from('clientes')
      .insert({ nome: cliente.nome })
      .select()
      .single();

    if (clienteError) throw clienteError;

    // Insert brands
    const marcasData = cliente.marcas.map(marca => ({
      nome: marca,
      cliente_id: novoCliente.id
    }));

    const { error: marcasError } = await supabase
      .from('marcas')
      .insert(marcasData);

    if (marcasError) throw marcasError;

    return {
      id: novoCliente.id,
      nome: novoCliente.nome,
      marcas: cliente.marcas
    };
  } catch (error) {
    console.error('Error creating cliente:', error);
    throw error;
  }
};

export const updateCliente = async (id: string, cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  try {
    // Update client
    const { error: clienteError } = await supabase
      .from('clientes')
      .update({ nome: cliente.nome })
      .eq('id', id);

    if (clienteError) throw clienteError;

    // Delete existing brands
    const { error: deleteError } = await supabase
      .from('marcas')
      .delete()
      .eq('cliente_id', id);

    if (deleteError) throw deleteError;

    // Insert new brands
    const marcasData = cliente.marcas.map(marca => ({
      nome: marca,
      cliente_id: id
    }));

    const { error: marcasError } = await supabase
      .from('marcas')
      .insert(marcasData);

    if (marcasError) throw marcasError;

    return {
      id,
      nome: cliente.nome,
      marcas: cliente.marcas
    };
  } catch (error) {
    console.error('Error updating cliente:', error);
    throw error;
  }
};

export const deleteCliente = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting cliente:', error);
    throw error;
  }
};

// Produções
export const getProducoes = async (): Promise<Producao[]> => {
  try {
    const { data: producoes, error: producoesError } = await supabase
      .from('producoes')
      .select(`
        *,
        clientes:cliente_id(nome),
        marcas:marca_id(nome)
      `)
      .order('data_inicio', { ascending: false });

    if (producoesError) throw producoesError;

    // Get all variants
    const { data: variantes, error: variantesError } = await supabase
      .from('producao_variantes')
      .select('*');

    if (variantesError) throw variantesError;

    // Get all BOM files
    const { data: bomFiles, error: bomError } = await supabase
      .from('bom_files')
      .select('*');

    if (bomError) throw bomError;

    return producoes.map(producao => {
      const producaoVariantes = variantes.filter(v => v.producao_id === producao.id);
      const producaoBomFiles = bomFiles.filter(bf => bf.producao_id === producao.id);
      return transformProducaoFromDB(producao, producaoVariantes, producaoBomFiles);
    });
  } catch (error) {
    console.error('Error fetching producoes:', error);
    return [];
  }
};

export const createProducao = async (producao: Omit<Producao, 'id'>): Promise<Producao> => {
  try {
    // Get marca ID by name and client name
    const { data: marcas, error: marcaError } = await supabase
      .from('marcas')
      .select('id, cliente_id, clientes!inner(nome)')
      .eq('nome', producao.marca)
      .eq('clientes.nome', producao.cliente);

    if (marcaError || !marcas || marcas.length === 0) {
      throw new Error(`Marca "${producao.marca}" não encontrada para o cliente "${producao.cliente}"`);
    }

    const marca = marcas[0];

    // Insert production
    const { data: novaProducao, error: producaoError } = await supabase
      .from('producoes')
      .insert({
        marca_id: marca.id,
        cliente_id: marca.cliente_id,
        referencia_interna: producao.referenciaInterna,
        referencia_cliente: producao.referenciaCliente,
        descricao: producao.descricao,
        tipo_peca: producao.tipoPeca,
        genero: producao.genero,
        etapa: producao.etapa,
        estado: producao.estado,
        data_inicio: producao.dataInicio,
        data_previsao: producao.dataPrevisao,
        data_estimada_entrega: producao.dataEstimadaEntrega,
        em_producao: producao.emProducao,
        problemas: producao.problemas,
        local_producao: producao.localProducao,
        empresa_externa: producao.empresaExterna,
        link_odoo: producao.linkOdoo,
        comments: producao.comments
      })
      .select()
      .single();

    if (producaoError) throw producaoError;

    // Insert variants
    const variantesData: any[] = [];
    producao.variantes.forEach(variante => {
      Object.entries(variante.tamanhos).forEach(([tamanho, quantidade]) => {
        if (quantidade > 0) {
          variantesData.push({
            producao_id: novaProducao.id,
            cor: variante.cor,
            tamanho,
            quantidade
          });
        }
      });
    });

    if (variantesData.length > 0) {
      const { error: variantesError } = await supabase
        .from('producao_variantes')
        .insert(variantesData);

      if (variantesError) throw variantesError;
    }

    return {
      ...producao,
      id: novaProducao.id
    };
  } catch (error) {
    console.error('Error creating producao:', error);
    throw error;
  }
};

export const updateProducao = async (id: string, producao: Omit<Producao, 'id'>): Promise<Producao> => {
  try {
    // Get marca ID by name and client name
    const { data: marcas, error: marcaError } = await supabase
      .from('marcas')
      .select('id, cliente_id, clientes!inner(nome)')
      .eq('nome', producao.marca)
      .eq('clientes.nome', producao.cliente);

    if (marcaError || !marcas || marcas.length === 0) {
      throw new Error(`Marca "${producao.marca}" não encontrada para o cliente "${producao.cliente}"`);
    }

    const marca = marcas[0];

    // Update production
    const { error: producaoError } = await supabase
      .from('producoes')
      .update({
        marca_id: marca.id,
        cliente_id: marca.cliente_id,
        referencia_interna: producao.referenciaInterna,
        referencia_cliente: producao.referenciaCliente,
        descricao: producao.descricao,
        tipo_peca: producao.tipoPeca,
        genero: producao.genero,
        etapa: producao.etapa,
        estado: producao.estado,
        data_inicio: producao.dataInicio,
        data_previsao: producao.dataPrevisao,
        data_estimada_entrega: producao.dataEstimadaEntrega,
        em_producao: producao.emProducao,
        problemas: producao.problemas,
        local_producao: producao.localProducao,
        empresa_externa: producao.empresaExterna,
        link_odoo: producao.linkOdoo,
        comments: producao.comments
      })
      .eq('id', id);

    if (producaoError) throw producaoError;

    // Delete existing variants
    const { error: deleteVariantesError } = await supabase
      .from('producao_variantes')
      .delete()
      .eq('producao_id', id);

    if (deleteVariantesError) throw deleteVariantesError;

    // Insert new variants
    const variantesData: any[] = [];
    producao.variantes.forEach(variante => {
      Object.entries(variante.tamanhos).forEach(([tamanho, quantidade]) => {
        if (quantidade > 0) {
          variantesData.push({
            producao_id: id,
            cor: variante.cor,
            tamanho,
            quantidade
          });
        }
      });
    });

    if (variantesData.length > 0) {
      const { error: variantesError } = await supabase
        .from('producao_variantes')
        .insert(variantesData);

      if (variantesError) throw variantesError;
    }

    return {
      ...producao,
      id
    };
  } catch (error) {
    console.error('Error updating producao:', error);
    throw error;
  }
};

export const deleteProducao = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('producoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting producao:', error);
    throw error;
  }
};
export const updateProducaoFlags = async (id: string, flags: { problemas?: boolean; emProducao?: boolean; faltaComponentes?: boolean; pago?: boolean }): Promise<void> => {
  try {
    const updateData: any = {};
    if (flags.problemas !== undefined) updateData.problemas = flags.problemas;
    if (flags.emProducao !== undefined) updateData.em_producao = flags.emProducao;
    if (flags.pago !== undefined) updateData.pago = flags.pago;
    if (flags.faltaComponentes !== undefined) {
      updateData.estado = flags.faltaComponentes ? 'FALTA COMPONENTES' : 'Aguarda Componentes';
    }

    const { error } = await supabase
      .from('producoes')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating producao flags:', error);
    throw error;
  }
};

export const updateProducaoComments = async (id: string, comments: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('producoes')
      .update({ comments })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating producao comments:', error);
    throw error;
  }
};

// BOM Files
export const createBOMFiles = async (producaoId: string, files: Omit<BOMFile, 'id'>[]): Promise<BOMFile[]> => {
  try {
    const bomData = files.map(file => ({
      producao_id: producaoId,
      nome: file.name,
      url: file.url,
      upload_date: file.uploadDate
    }));

    const { data, error } = await supabase
      .from('bom_files')
      .insert(bomData)
      .select();

    if (error) throw error;

    return data.map(bf => ({
      id: bf.id,
      name: bf.nome,
      url: bf.url,
      uploadDate: bf.upload_date
    }));
  } catch (error) {
    console.error('Error creating BOM files:', error);
    throw error;
  }
};

export const deleteBOMFile = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bom_files')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting BOM file:', error);
    throw error;
  }
};

// Get available brands for a client
export const getMarcasByCliente = async (clienteNome: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('marcas')
      .select('nome, clientes!inner(nome)')
      .eq('clientes.nome', clienteNome);

    if (error) throw error;

    return data.map(marca => marca.nome);
  } catch (error) {
    console.error('Error fetching marcas by cliente:', error);
    return [];
  }
};