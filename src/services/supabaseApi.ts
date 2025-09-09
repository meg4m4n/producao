import { supabase } from '../lib/supabase';
import {
  Producao,
  Cliente,
  BOMFile,
  // novos tipos
  TabelaMedidasModelista,
  MedidaModelistaDetalhe,
  QCRegisto,
  QCMedida,
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
        local_producao: producao.localProducao,
        local_producao_id: (producao as any).localProducaoId ?? null,
        empresa_externa: producao.empresaExterna,
        link_odoo: producao.linkOdoo,
        comments: producao.comments,
        // financeiro
        pago: producao.pago,
        pago_parcial: producao.pagoParcial,
        pagamentos: producao.pagamentos,
        valor_pago: producao.valorPago,
        valor_restante: producao.valorRestante,
        fastprod: producao.fastprod,
        observacoes_financeiras: producao.observacoesFinanceiras,
        numero_fatura: producao.numeroFatura,
        data_fatura: producao.dataFatura,
        valor_fatura: producao.valorFatura,
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

    // UPDATE sem tocar no codigo_op
    const { error: producaoError } = await supabase
      .from('producoes')
      .update({
        // codigo_op: (NÃO enviar)
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
        local_producao: producao.localProducao,
        local_producao_id: (producao as any).localProducaoId ?? null,
        empresa_externa: producao.empresaExterna,
        link_odoo: producao.linkOdoo,
        comments: producao.comments,
        // financeiro
        pago: producao.pago,
        pago_parcial: producao.pagoParcial,
        pagamentos: producao.pagamentos,
        valor_pago: producao.valorPago,
        valor_restante: producao.valorRestante,
        fastprod: producao.fastprod,
        observacoes_financeiras: producao.observacoesFinanceiras,
        numero_fatura: producao.numeroFatura,
        data_fatura: producao.dataFatura,
        valor_fatura: producao.valorFatura,
      })
      .eq('id', id);
    if (producaoError) throw producaoError;

    // Variantes: apaga e recria
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
      nome: file.name,
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

/* ------------------------------- MARCAS / AUX ------------------------------- */

export const getMarcasByCliente = async (clienteNome: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.from('marcas').select('nome, clientes!inner(nome)').eq('clientes.nome', clienteNome);
    if (error) throw error;
    return data.map((marca) => marca.nome);
  } catch (error) {
    console.error('Error fetching marcas by cliente:', error);
    return [];
  }
};

/* ====================== MODELISTA: TABELAS + DETALHES ====================== */

// Listar tabelas da modelista por produção
export const getTabelasMedidasModelista = async (producaoId: string): Promise<TabelaMedidasModelista[]> => {
  const { data, error } = await supabase
    .from('tabelas_medidas_modelista')
    .select('*')
    .eq('producao_id', producaoId)
    .order('data_registo', { ascending: false });
  if (error) throw error;
  return data as TabelaMedidasModelista[];
};

export const createTabelaMedidasModelista = async (payload: Omit<TabelaMedidasModelista, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('tabelas_medidas_modelista')
    .insert({
      producao_id: payload.producao_id,
      nome_tabela: payload.nome_tabela,
      data_registo: payload.data_registo,
      observacoes: payload.observacoes ?? null
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as TabelaMedidasModelista;
};

export const updateTabelaMedidasModelista = async (id: string, patch: Partial<TabelaMedidasModelista>) => {
  const { data, error } = await supabase
    .from('tabelas_medidas_modelista')
    .update({
      nome_tabela: patch.nome_tabela,
      data_registo: patch.data_registo,
      observacoes: patch.observacoes ?? null
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as TabelaMedidasModelista;
};

export const deleteTabelaMedidasModelista = async (id: string) => {
  const { error } = await supabase
    .from('tabelas_medidas_modelista')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Detalhes (linhas) de uma tabela
export const getMedidasModelistaDetalhes = async (tabelaId: string): Promise<MedidaModelistaDetalhe[]> => {
  const { data, error } = await supabase
    .from('medidas_modelista_detalhes')
    .select('*')
    .eq('tabela_id', tabelaId)
    .order('letra_medida', { ascending: true });
  if (error) throw error;
  return data as MedidaModelistaDetalhe[];
};

export const upsertMedidasModelistaDetalhes = async (rows: Omit<MedidaModelistaDetalhe, 'id' | 'created_at' | 'updated_at'>[]) => {
  if (!rows.length) return [];
  const { data, error } = await supabase
    .from('medidas_modelista_detalhes')
    .insert(rows) // simples: insert em massa
    .select('*');
  if (error) throw error;
  return data as MedidaModelistaDetalhe[];
};

// Obter especificação (linhas) para uma produção + cor + tamanho (independente da tabela)
export const getModelistaSpecFor = async (producaoId: string, cor: string, tamanho: string): Promise<MedidaModelistaDetalhe[]> => {
  // tabela mais recente para a produção
  const { data: tabelas, error: tabErr } = await supabase
    .from('tabelas_medidas_modelista')
    .select('*')
    .eq('producao_id', producaoId)
    .order('data_registo', { ascending: false })
    .limit(1);
  if (tabErr) throw tabErr;
  if (!tabelas || tabelas.length === 0) return [];

  const tabela = tabelas[0];
  const { data: detalhes, error: detErr } = await supabase
    .from('medidas_modelista_detalhes')
    .select('*')
    .eq('tabela_id', tabela.id)
    .eq('cor', cor)
    .eq('tamanho', tamanho)
    .order('letra_medida', { ascending: true });

  if (detErr) throw detErr;
  return (detalhes ?? []) as MedidaModelistaDetalhe[];
};

/* =========================== CONTROLO DE QUALIDADE ========================= */

export const getQCRegistosByProducao = async (producaoId: string): Promise<QCRegisto[]> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_registos')
    .select('*')
    .eq('producao_id', producaoId)
    .order('data_controlo', { ascending: false });
  if (error) throw error;
  return data as QCRegisto[];
};

export const getQCMedidasByRegisto = async (registoId: string): Promise<QCMedida[]> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_medidas')
    .select('*')
    .eq('registo_id', registoId)
    .order('letra_medida', { ascending: true });
  if (error) throw error;
  return data as QCMedida[];
};

export const createQCRegisto = async (payload: Omit<QCRegisto, 'id' | 'created_at' | 'updated_at'>): Promise<QCRegisto> => {
  const { data, error } = await supabase
    .from('controlo_qualidade_registos')
    .insert({
      producao_id: payload.producao_id,
      data_controlo: payload.data_controlo ?? new Date().toISOString(),
      cor_controlada: payload.cor_controlada,
      tamanho_controlado: payload.tamanho_controlado,
      responsavel: payload.responsavel ?? null,
      resultado_geral: payload.resultado_geral ?? null,
      observacoes: payload.observacoes ?? null
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as QCRegisto;
};

export const insertQCMedidas = async (rows: Omit<QCMedida, 'id' | 'created_at' | 'updated_at'>[]): Promise<QCMedida[]> => {
  if (!rows.length) return [];
  const payload = rows.map(r => {
    const hasPedida = r.medida_pedida_modelista !== undefined && r.medida_pedida_modelista !== null;
    const hasTol = r.tolerancia_modelista !== undefined && r.tolerancia_modelista !== null;
    const desvio = hasPedida ? (r.medida_registada - (r.medida_pedida_modelista as number)) : null;
    const passou = hasPedida && hasTol && desvio !== null
      ? Math.abs(desvio as number) <= (r.tolerancia_modelista as number)
      : null;
    return { ...r, desvio, passou_controlo: passou };
  });

  const { data, error } = await supabase
    .from('controlo_qualidade_medidas')
    .insert(payload)
    .select('*');

  if (error) throw error;
  return data as QCMedida[];
};
