import { supabase } from '../lib/supabase';
import {
  Producao,
  Cliente,
  BOMFile,
  TabelaMedidasModelista,
  MedidaModelistaDetalhe,
  QCRegisto,
  QCMedida,
  QCControloAdicional,
  QCComentario,
} from '../types';

/* ----------------------------- TRANSFORM HELPERS ---------------------------- */

const transformProducaoFromDB = (row: any, variantes: any[], bomFiles: any[] = []): Producao => {
  // Agrupar variantes por cor
  const variantesAgrupadas = variantes.reduce((acc: any[], v: any) => {
    const existing = acc.find((item) => item.cor === v.cor);
    if (existing) {
      existing.tamanhos[v.tamanho] = v.quantidade;
    } else {
      acc.push({
        cor: v.cor,
        tamanhos: { [v.tamanho]: v.quantidade },
      });
    }
    return acc;
  }, []);

  return {
    id: row.id,
    codigoOP: row.codigo_op, // gerado no DB
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
    dataFinal: row.data_final,

    tempoProducaoEstimado: row.tempo_producao_estimado || 0,
    tempoProducaoReal: row.tempo_producao_real || 0,
    temMolde: row.tem_molde || false,

    emProducao: row.em_producao,
    problemas: row.problemas,

    localProducao: row.local_producao,
    localProducaoId: row.local_producao_id,
    empresaExterna: row.empresa_externa,

    linkOdoo: row.link_odoo,
    comments: row.comments,

    // financeiro
    pago: row.pago,
    fastprod: row.fastprod,
    pagoParcial: row.pago_parcial,
    pagamentos: row.pagamentos || [],
    valorPago: row.valor_pago,
    valorRestante: row.valor_restante,
    observacoesFinanceiras: row.observacoes_financeiras,
    numeroFatura: row.numero_fatura,
    dataFatura: row.data_fatura,
    valorFatura: row.valor_fatura,

    bomFiles: bomFiles.map((bf) => ({
      id: bf.id,
      name: bf.nome,
      url: bf.url,
      uploadDate: bf.upload_date,
    })),
  };
};

/* --------------------------------- CLIENTES -------------------------------- */

export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');

    if (clientesError) throw clientesError;

    const { data: marcas, error: marcasError } = await supabase.from('marcas').select('*');
    if (marcasError) throw marcasError;

    return clientes.map((cliente) => ({
      id: cliente.id,
      nome: cliente.nome,
      marcas: marcas
        .filter((marca) => marca.cliente_id === cliente.id)
        .map((marca) => marca.nome),
    }));
  } catch (error) {
    console.error('Error fetching clientes:', error);
    return [];
  }
};

export const createCliente = async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  try {
    const { data: novoCliente, error: clienteError } = await supabase
      .from('clientes')
      .insert({ nome: cliente.nome })
      .select()
      .single();
    if (clienteError) throw clienteError;

    const marcasData = cliente.marcas.map((marca) => ({
      nome: marca,
      cliente_id: novoCliente.id,
    }));
    const { error: marcasError } = await supabase.from('marcas').insert(marcasData);
    if (marcasError) throw marcasError;

    return { id: novoCliente.id, nome: novoCliente.nome, marcas: cliente.marcas };
  } catch (error) {
    console.error('Error creating cliente:', error);
    throw error;
  }
};

export const updateCliente = async (id: string, cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  try {
    const { error: clienteError } = await supabase.from('clientes').update({ nome: cliente.nome }).eq('id', id);
    if (clienteError) throw clienteError;

    const { error: deleteError } = await supabase.from('marcas').delete().eq('cliente_id', id);
    if (deleteError) throw deleteError;

    const marcasData = cliente.marcas.map((marca) => ({ nome: marca, cliente_id: id }));
    const { error: marcasError } = await supabase.from('marcas').insert(marcasData);
    if (marcasError) throw marcasError;

    return { id, nome: cliente.nome, marcas: cliente.marcas };
  } catch (error) {
    console.error('Error updating cliente:', error);
    throw error;
  }
};

export const deleteCliente = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting cliente:', error);
    throw error;
  }
};

/* -------------------------------- PRODUÇÕES -------------------------------- */

export const getProducoes = async (): Promise<Producao[]> => {
  try {
    const { data: producoes, error: producoesError } = await supabase
      .from('producoes')
      .select(
        `
        *,
        clientes:cliente_id(nome),
        marcas:marca_id(nome)
      `
      )
      .order('data_inicio', { ascending: false });
    if (producoesError) throw producoesError;

    const { data: variantes, error: variantesError } = await supabase.from('producao_variantes').select('*');
    if (variantesError) throw variantesError;

    const { data: bomFiles, error: bomError } = await supabase.from('bom_files').select('*');
    if (bomError) throw bomError;

    return producoes.map((producao) => {
      const producaoVariantes = variantes.filter((v) => v.producao_id === producao.id);
      const producaoBomFiles = bomFiles.filter((bf) => bf.producao_id === producao.id);
      return transformProducaoFromDB(producao, producaoVariantes, producaoBomFiles);
    });
  } catch (error) {
    console.error('Error fetching producoes:', error);
    return [];
  }
};

export const createProducao = async (producao: Omit<Producao, 'id'>): Promise<Producao> => {
  try {
    // Obter marca por nome + cliente
    const { data: marcas, error: marcaError } = await supabase
      .from('marcas')
      .select('id, cliente_id, clientes!inner(nome)')
      .eq('nome', producao.marca)
      .eq('clientes.nome', producao.cliente);
    if (marcaError || !marcas || marcas.length === 0) {
      throw new Error(`Marca "${producao.marca}" não encontrada para o cliente "${producao.cliente}"`);
    }
    const marca = marcas[0];

    // INSERT sem enviar codigo_op (DB gera)
    const { data: novaProducao, error: producaoError } = await supabase
      .from('producoes')
      .insert({
        // codigo_op: (NÃO enviar) – gerado por trigger/DB
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
        data_final: (producao as any).dataFinal || (producao as any).dataEstimadaEntrega || null,
        em_producao: producao.emProducao,
        problemas: producao.problemas,
        local_producao: producao.local_producao,
        local_producao_id: (producao as any).localProducaoId && (producao as any).localProducaoId.trim() !== '' ? (producao as any).localProducaoId : null,
        empresa_externa: producao.empresaExterna,
        link_odoo: producao.linkOdoo,
        comments: producao.comments,
        // financeiro
        pago: producao.pago,
        pago_parcial: producao.pago_parcial,
        pagamentos: producao.pagamentos,
        valor_pago: producao.valorPago,
        valor_restante: producao.valorRestante,
        fastprod: producao.fastprod,
        observacoes_financeiras: producao.observacoesFinanceiras,
        numero_fatura: producao.numero_fatura,
        data_fatura: producao.data_fatura,
        valor_fatura: producao.valor_fatura,
      })
      .select('*')
      .single();
    if (producaoError) throw producaoError;

    // Variantes
    const variantesData: any[] = [];
    producao.variantes.forEach((variante) => {
      Object.entries(variante.tamanhos).forEach(([tamanho, quantidade]) => {
        if (quantidade > 0) {
          variantesData.push({
            producao_id: novaProducao.id,
            cor: variante.cor,
            tamanho,
            quantidade,
          });
        }
      });
    });

    if (variantesData.length > 0) {
      const { error: variantesError } = await supabase.from('producao_variantes').insert(variantesData);
      if (variantesError) throw variantesError;
    }

    // devolve coerente com o front
    return {
      ...producao,
      id: novaProducao.id,
      codigoOP: novaProducao.codigo_op, // veio do DB
      dataFinal: (producao as any).dataFinal || (producao as any).dataEstimadaEntrega || '',
    };
  } catch (error) {
    console.error('Error creating producao:', error);
    throw error;
  }
};

export const updateProducao = async (id: string, producao: Omit<Producao, 'id'>): Promise<Producao> => {
  try {
    if (!id || id.trim() === '') {
      throw new Error('Invalid production ID: ID cannot be empty');
    }

    // Obter marca por nome + cliente
    const { data: marcas, error: marcaError } = await supabase
      .from('marcas')
      .select('id, cliente_id, clientes!inner(nome)')
      .eq('nome', producao.marca)
      .eq('clientes.nome', producao.cliente);
    if (marcaError || !marcas || marcas.length === 0) {
      throw new Error(`Marca "${producao.marca}" não encontrada para o cliente "${producao.cliente}"`);
    }
    const marca = marcas[0];

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
        data_final: (producao as any).dataFinal || (producao as any).dataEstimadaEntrega || null,
        em_producao: producao.emProducao,
        problemas: producao.problemas,
        local_producao: producao.local_producao,
        local_producao_id: (producao as any).localProducaoId && (producao as any).localProducaoId.trim() !== '' ? (producao as any).localProducaoId : null,
        empresa_externa: producao.empresaExterna,
        link_odoo: producao.linkOdoo,
        comments: producao.comments,
        // financeiro
        pago: producao.pago,
        pago_parcial: producao.pago_parcial,
        pagamentos: producao.pagamentos,
        valor_pago: producao.valorPago,
        valor_restante: producao.valorRestante,
        fastprod: producao.fastprod,
        observacoes_financeiras: producao.observacoesFinanceiras,
        numero_fatura: producao.numero_fatura,
        data_fatura: producao.data_fatura,
        valor_fatura: producao.valor_fatura,
      })
      .eq('id', id);
    if (producaoError) throw producaoError;

    const { error: deleteVariantesError } = await supabase.from('producao_variantes').delete().eq('producao_id', id);
    if (deleteVariantesError) throw deleteVariantesError;

    const variantesData: any[] = [];
    producao.variantes.forEach((variante) => {
      Object.entries(variante.tamanhos).forEach(([tamanho, quantidade]) => {
        if (quantidade > 0) {
          variantesData.push({
            producao_id: id,
            cor: variante.cor,
            tamanho,
            quantidade,
          });
        }
      });
    });

    if (variantesData.length > 0) {
      const { error: variantesError } = await supabase.from('producao_variantes').insert(variantesData);
      if (variantesError) throw variantesError;
    }

    return {
      ...producao,
      id,
      dataFinal: (producao as any).dataFinal || (producao as any).dataEstimadaEntrega || '',
    };
  } catch (error) {
    console.error('Error updating producao:', error);
    throw error;
  }
};

export const deleteProducao = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('producoes').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting producao:', error);
    throw error;
  }
};

export const updateProducaoFlags = async (
  id: string,
  flags: { problemas?: boolean; emProducao?: boolean; faltaComponentes?: boolean }
): Promise<void> => {
  try {
    const updateData: any = {};
    if (flags.problemas !== undefined) updateData.problemas = flags.problemas;
    if (flags.emProducao !== undefined) updateData.em_producao = flags.emProducao;
    if (flags.faltaComponentes !== undefined) {
      updateData.estado = flags.faltaComponentes ? 'FALTA COMPONENTES' : 'Aguarda Componentes';
    }

    const { error } = await supabase.from('producoes').update(updateData).eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating producao flags:', error);
    throw error;
  }
};

export const updateProducaoComments = async (id: string, comments: string): Promise<void> => {
  try {
    const { error } = await supabase.from('producoes').update({ comments }).eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating producao comments:', error);
    throw error;
  }
};

export const updateProducaoFinancialFlags = async (id: string, flags: { faturado?: boolean; pago?: boolean }): Promise<void> => {
  try {
    const updateData: any = {};
    if (flags.pago !== undefined) updateData.pago = flags.pago;

    if (flags.faturado !== undefined) {
      if (flags.faturado) {
        updateData.numero_fatura = `FAT-${Date.now()}`;
        updateData.data_fatura = new Date().toISOString().split('T')[0];
      } else {
        updateData.numero_fatura = null;
        updateData.data_fatura = null;
      }
    }

    const { error } = await supabase.from('producoes').update(updateData).eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating producao financial flags:', error);
    throw error;
  }
};

/* --------------------------------- BOM FILES -------------------------------- */

export const createBOMFiles = async (producaoId: string, files: Omit<BOMFile, 'id'>[]): Promise<BOMFile[]> => {
  try {
    const bomData = files.map((file) => ({
      producao_id: producaoId,
      nome: file.nome,
      url: file.url,
      upload_date: file.uploadDate,
    }));

    const { data, error } = await supabase.from('bom_files').insert(bomData).select();
    if (error) throw error;

    return data.map((bf) => ({
      id: bf.id,
      name: bf.nome,
      url: bf.url,
      uploadDate: bf.upload_date,
    }));
  } catch (error) {
    console.error('Error creating BOM files:', error);
    throw error;
  }
};

export const deleteBOMFile = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('bom_files').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting BOM file:', error);
    throw error;
  }
};

/* -------------------------- TABELAS MODELISTA ------------------------------- */

export const getTabelasMedidasModelista = async (producaoId: string): Promise<TabelaMedidasModelista[]> => {
  const { data, error } = await supabase
    .from('tabelas_medidas_modelista')
    .select('*')
    .eq('producao_id', producaoId)
    .order('data_registo', { ascending: false });
  if (error) throw error;
  return (data ?? []) as TabelaMedidasModelista[];
};

export const createTabelaMedidasModelista = async (
  payload: Omit<TabelaMedidasModelista, 'id' | 'created_at' | 'updated_at'>
): Promise<TabelaMedidasModelista> => {
  const { data, error } = await supabase
    .from('tabelas_medidas_modelista')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as TabelaMedidasModelista;
};

export const updateTabelaMedidasModelista = async (
  id: string,
  payload: Partial<TabelaMedidasModelista>
): Promise<TabelaMedidasModelista> => {
  const { data, error } = await supabase
    .from('tabelas_medidas_modelista')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as TabelaMedidasModelista;
};

export const deleteTabelaMedidasModelista = async (id: string): Promise<void> => {
  const { error } = await supabase.from('tabelas_medidas_modelista').delete().eq('id', id);
  if (error) throw error;
};

export const getMedidasModelistaDetalhes = async (tabelaId: string): Promise<MedidaModelistaDetalhe[]> => {
  const { data, error } = await supabase
    .from('medidas_modelista_detalhes')
    .select('*')
    .eq('tabela_id', tabelaId)
    .order('letra_medida', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MedidaModelistaDetalhe[];
};

export const upsertMedidasModelistaDetalhes = async (
  payload: Omit<MedidaModelistaDetalhe, 'id' | 'created_at' | 'updated_at'>[]
): Promise<MedidaModelistaDetalhe[]> => {
  // ⚠️ Removido o onConflict porque a tabela não tem UNIQUE/PK nestas colunas
  const { data, error } = await supabase
    .from('medidas_modelista_detalhes')
    .insert(payload)
    .select('*');
  if (error) throw error;
  return (data ?? []) as MedidaModelistaDetalhe[];
};

/* -------------------------- CONTROLO QUALIDADE ------------------------------ */

export const getModelistaSpecFor = async (
  producaoId: string,
  cor: string,
  tamanho: string
): Promise<MedidaModelistaDetalhe[]> => {
  const { data, error } = await supabase
    .from('medidas_modelista_detalhes')
    .select('*')
    .eq('tabela_id', producaoId)
    .eq('cor', cor)
    .eq('tamanho', tamanho)
    .order('letra_medida', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MedidaModelistaDetalhe[];
};

export const createQCRegisto = async (
  payload: Omit<QCRegisto, 'id' | 'created_at' | 'updated_at'>
): Promise<QCRegisto> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_registos')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as QCRegisto;
};

export const getQCRegistosByProducao = async (producaoId: string): Promise<QCRegisto[]> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_registos')
    .select('*')
    .eq('producao_id', producaoId)
    .order('data_controlo', { ascending: false });
  if (error) throw error;
  return (data ?? []) as QCRegisto[];
};

export const insertQCMedidas = async (
  payload: Omit<QCMedida, 'id' | 'created_at' | 'updated_at'>[]
): Promise<QCMedida[]> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_medidas')
    .insert(payload)
    .select('*');
  if (error) throw error;
  return (data ?? []) as QCMedida[];
};

export const getQCMedidasByRegisto = async (registoId: string): Promise<QCMedida[]> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_medidas')
    .select('*')
    .eq('registo_id', registoId)
    .order('letra_medida', { ascending: true });
  if (error) throw error;
  return (data ?? []) as QCMedida[];
};

/* ----------------------- CONTROLOS ADICIONAIS QC ----------------------------- */

export const getQCControloAdicional = async (registoId: string): Promise<QCControloAdicional | null> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_adicional')
    .select('*')
    .eq('registo_id', registoId)
    .maybeSingle();
  if (error) throw error;
  return data as QCControloAdicional | null;
};

export const upsertQCControloAdicional = async (
  payload: Omit<QCControloAdicional, 'id' | 'created_at' | 'updated_at'>
): Promise<QCControloAdicional> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_adicional')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as QCControloAdicional;
};

/* ----------------------------- COMENTÁRIOS QC ------------------------------- */

export const getQCComentarios = async (registoId: string): Promise<QCComentario[]> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_comentarios')
    .select('*')
    .eq('registo_id', registoId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as QCComentario[];
};

export const createQCComentario = async (
  payload: Omit<QCComentario, 'id' | 'created_at' | 'updated_at'>
): Promise<QCComentario> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_comentarios')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as QCComentario;
};

export const updateQCComentario = async (
  id: string,
  comentario: string
): Promise<QCComentario> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_comentarios')
    .update({ comentario })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as QCComentario;
};

export const deleteQCComentario = async (id: string): Promise<void> => {
  const { error } = await supabase.from('controlo_qualidade_comentarios').delete().eq('id', id);
  if (error) throw error;
};

/* --------------------------------- ENVIOS ---------------------------------- */

export interface Envio {
  id: string;
  cliente_id: string | null;
  cliente_nome?: string;
  descricao: string;
  responsavel: string;
  pedido_por: 'cliente' | 'lomartex';
  pago_por: 'cliente' | 'lomartex';
  transportadora: string;
  tracking: string;
  valor_custo: number;
  valor_cobrar: number;
  carta_porte_url: string | null;
  created_at: string;
  updated_at: string;
}

export const getEnvios = async (): Promise<Envio[]> => {
  try {
    const { data, error } = await supabase
      .from('envios')
      .select(`
        *,
        clientes:cliente_id(nome)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((envio: any) => ({
      id: envio.id,
      cliente_id: envio.cliente_id,
      cliente_nome: envio.clientes?.nome || '',
      descricao: envio.descricao,
      responsavel: envio.responsavel,
      pedido_por: envio.pedido_por,
      pago_por: envio.pago_por,
      transportadora: envio.transportadora,
      tracking: envio.tracking,
      valor_custo: parseFloat(envio.valor_custo || 0),
      valor_cobrar: parseFloat(envio.valor_cobrar || 0),
      carta_porte_url: envio.carta_porte_url,
      created_at: envio.created_at,
      updated_at: envio.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching envios:', error);
    return [];
  }
};

export const getEnvioById = async (id: string): Promise<Envio | null> => {
  try {
    const { data, error } = await supabase
      .from('envios')
      .select(`
        *,
        clientes:cliente_id(nome)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      cliente_id: data.cliente_id,
      cliente_nome: data.clientes?.nome || '',
      descricao: data.descricao,
      responsavel: data.responsavel,
      pedido_por: data.pedido_por,
      pago_por: data.pago_por,
      transportadora: data.transportadora,
      tracking: data.tracking,
      valor_custo: parseFloat(data.valor_custo || 0),
      valor_cobrar: parseFloat(data.valor_cobrar || 0),
      carta_porte_url: data.carta_porte_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching envio:', error);
    return null;
  }
};

export const createEnvio = async (envio: Omit<Envio, 'id' | 'created_at' | 'updated_at' | 'cliente_nome'>): Promise<Envio> => {
  try {
    const { data, error } = await supabase
      .from('envios')
      .insert({
        cliente_id: envio.cliente_id,
        descricao: envio.descricao,
        responsavel: envio.responsavel,
        pedido_por: envio.pedido_por,
        pago_por: envio.pago_por,
        transportadora: envio.transportadora,
        tracking: envio.tracking,
        valor_custo: envio.valor_custo,
        valor_cobrar: envio.valor_cobrar,
        carta_porte_url: envio.carta_porte_url,
      })
      .select(`
        *,
        clientes:cliente_id(nome)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      cliente_id: data.cliente_id,
      cliente_nome: data.clientes?.nome || '',
      descricao: data.descricao,
      responsavel: data.responsavel,
      pedido_por: data.pedido_por,
      pago_por: data.pago_por,
      transportadora: data.transportadora,
      tracking: data.tracking,
      valor_custo: parseFloat(data.valor_custo || 0),
      valor_cobrar: parseFloat(data.valor_cobrar || 0),
      carta_porte_url: data.carta_porte_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error creating envio:', error);
    throw error;
  }
};

export const updateEnvio = async (id: string, envio: Partial<Omit<Envio, 'id' | 'created_at' | 'updated_at' | 'cliente_nome'>>): Promise<Envio> => {
  try {
    const { data, error } = await supabase
      .from('envios')
      .update(envio)
      .eq('id', id)
      .select(`
        *,
        clientes:cliente_id(nome)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      cliente_id: data.cliente_id,
      cliente_nome: data.clientes?.nome || '',
      descricao: data.descricao,
      responsavel: data.responsavel,
      pedido_por: data.pedido_por,
      pago_por: data.pago_por,
      transportadora: data.transportadora,
      tracking: data.tracking,
      valor_custo: parseFloat(data.valor_custo || 0),
      valor_cobrar: parseFloat(data.valor_cobrar || 0),
      carta_porte_url: data.carta_porte_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error updating envio:', error);
    throw error;
  }
};

export const deleteEnvio = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('envios').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting envio:', error);
    throw error;
  }
};

export const uploadCartaPorte = async (file: File, envioId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${envioId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('cartas_porte')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('cartas_porte')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading carta de porte:', error);
    throw error;
  }
};