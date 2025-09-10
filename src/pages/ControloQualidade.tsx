import React, { useMemo, useState, useEffect } from 'react';
import { 
  Search, Ruler, Save, AlertTriangle, CheckCircle2, Plus, Copy, Trash2, 
  MessageSquare, Edit, X, Eye, ClipboardCheck, FileText 
} from 'lucide-react';
import { useProducoes } from '../hooks/useSupabaseData';
import { Producao, MedidaModelistaDetalhe, QCMedida, QCComentario, QCControloAdicional } from '../types';
import {
  getModelistaSpecFor,
  createQCRegisto,
  insertQCMedidas,
  getQCRegistosByProducao,
  getQCMedidasByRegisto,
  getQCControloAdicional,
  upsertQCControloAdicional,
  getQCComentarios,
  createQCComentario,
  updateQCComentario,
  deleteQCComentario,
} from '../services/supabaseApi';

const ControloQualidade: React.FC = () => {
  const { producoes, loading, error } = useProducoes();

  // Seleção atual
  const [query, setQuery] = useState('');
  const [selectedProducao, setSelectedProducao] = useState<Producao | null>(null);
  const [selectedCor, setSelectedCor] = useState<string>('');
  const [selectedTamanho, setSelectedTamanho] = useState<string>('');

  // Especificação da modelista (se existir)
  const [spec, setSpec] = useState<MedidaModelistaDetalhe[] | null>(null);

  // Linhas para registo (com base na spec ou ad-hoc)
  const [linhasQC, setLinhasQC] = useState<QCMedida[]>([]);

  // Controlos adicionais (checkboxes)
  const [controlosAdicionais, setControlosAdicionais] = useState<QCControloAdicional>({
    id: '',
    registo_id: '',
    linhas: false,
    borboto: false,
    sujidade: false,
    defeito_transfer: false,
    peca_torta: false,
    problemas_ferro: false,
    outros_controlos: {}
  });

  // Comentários
  const [comentarios, setComentarios] = useState<QCComentario[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [editandoComentario, setEditandoComentario] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');

  // Histórico
  const [registos, setRegistos] = useState<any[]>([]);
  const [registoSelecionado, setRegistoSelecionado] = useState<string | null>(null);

  /* ------------------------------- Helpers --------------------------------- */

  const producoesFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return producoes;
    return producoes.filter(p =>
      p.codigoOP?.toLowerCase().includes(q) ||
      p.referenciaInterna?.toLowerCase().includes(q) ||
      p.cliente?.toLowerCase().includes(q) ||
      p.marca?.toLowerCase().includes(q)
    );
  }, [producoes, query]);

  const coresDisponiveis = useMemo(() => {
    if (!selectedProducao) return [];
    return Array.from(new Set(selectedProducao.variantes.map(v => v.cor)));
  }, [selectedProducao]);

  const tamanhosDisponiveis = useMemo(() => {
    if (!selectedProducao || !selectedCor) return [];
    const tamanhos = selectedProducao.variantes
      .filter(v => v.cor === selectedCor)
      .flatMap(v => Object.keys(v.tamanhos));
    return Array.from(new Set(tamanhos)).sort();
  }, [selectedProducao, selectedCor]);

  /* ----------------------------- Carregar dados ----------------------------- */

  const carregarHistorico = async () => {
    if (!selectedProducao) return;
    try {
      const lista = await getQCRegistosByProducao(selectedProducao.id);
      setRegistos(lista);
    } catch (e) {
      console.error('Erro ao carregar histórico:', e);
    }
  };

  const carregarRegistoDetalhes = async (registoId: string) => {
    try {
      // Carregar medidas
      const medidas = await getQCMedidasByRegisto(registoId);
      setLinhasQC(medidas);

      // Carregar controlos adicionais
      const controlos = await getQCControloAdicional(registoId);
      if (controlos) {
        setControlosAdicionais(controlos);
      } else {
        setControlosAdicionais({
          id: '',
          registo_id: registoId,
          linhas: false,
          borboto: false,
          sujidade: false,
          defeito_transfer: false,
          peca_torta: false,
          problemas_ferro: false,
          outros_controlos: {}
        });
      }

      // Carregar comentários
      const comentariosData = await getQCComentarios(registoId);
      setComentarios(comentariosData);
      
      setRegistoSelecionado(registoId);
    } catch (e) {
      console.error('Erro ao carregar detalhes do registo:', e);
    }
  };

  const carregarSpec = async () => {
    if (!selectedProducao || !selectedCor || !selectedTamanho) return;
    
    try {
      const linhas = await getModelistaSpecFor(selectedProducao.id, selectedCor, selectedTamanho);
      setSpec(linhas.length ? linhas : null);

      if (linhas.length) {
        // Construir linhas QC já com meta info (sem medida_registada ainda)
        setLinhasQC(linhas.map((l) => ({
          id: 'tmp-' + l.id,
          registo_id: '',
          letra_medida: l.letra_medida,
          descricao_medida: l.descricao_medida,
          medida_pedida_modelista: l.medida_pedida,
          tolerancia_modelista: l.tolerancia,
          medida_registada: 0,
          desvio: null,
          passou_controlo: null,
        })));
      } else {
        // Sem spec -> linhas vazias ad-hoc
        setLinhasQC([
          {
            id: 'tmp-1',
            registo_id: '',
            letra_medida: '',
            descricao_medida: '',
            medida_pedida_modelista: null,
            tolerancia_modelista: null,
            medida_registada: 0,
            desvio: null,
            passou_controlo: null,
          },
        ]);
      }

      // Reset controlos adicionais
      setControlosAdicionais({
        id: '',
        registo_id: '',
        linhas: false,
        borboto: false,
        sujidade: false,
        defeito_transfer: false,
        peca_torta: false,
        problemas_ferro: false,
        outros_controlos: {}
      });

      setComentarios([]);
      setRegistoSelecionado(null);
    } catch (e) {
      console.error('Erro ao carregar especificação:', e);
    }
  };

  /* ----------------------------- Guardar Registo ---------------------------- */

  const guardarRegisto = async () => {
    if (!selectedProducao || !selectedCor || !selectedTamanho) {
      alert('Seleciona produção, cor e tamanho.');
      return;
    }

    try {
      // Criar registo (cabeçalho)
      const reg = await createQCRegisto({
        producao_id: selectedProducao.id,
        data_controlo: new Date().toISOString(),
        cor_controlada: selectedCor,
        tamanho_controlado: selectedTamanho,
        responsavel: 'Utilizador Atual', // TODO: get from auth context
        resultado_geral: null,
        observacoes: null,
      });

      // Inserir medidas
      const rows: Omit<QCMedida, 'id' | 'created_at' | 'updated_at'>[] = linhasQC
        .filter(l => l.letra_medida.trim())
        .map((l) => ({
          registo_id: reg.id,
          letra_medida: l.letra_medida,
          descricao_medida: l.descricao_medida,
          medida_pedida_modelista: l.medida_pedida_modelista ?? null,
          tolerancia_modelista: l.tolerancia_modelista ?? null,
          medida_registada: Number(l.medida_registada),
          desvio: null,
          passou_controlo: null,
        }));

      if (rows.length > 0) {
        await insertQCMedidas(rows);
      }

      // Guardar controlos adicionais
      await upsertQCControloAdicional({
        registo_id: reg.id,
        linhas: controlosAdicionais.linhas,
        borboto: controlosAdicionais.borboto,
        sujidade: controlosAdicionais.sujidade,
        defeito_transfer: controlosAdicionais.defeito_transfer,
        peca_torta: controlosAdicionais.peca_torta,
        problemas_ferro: controlosAdicionais.problemas_ferro,
        outros_controlos: controlosAdicionais.outros_controlos
      });

      alert('Registo de controlo guardado com sucesso!');
      
      // Limpar e recarregar
      setLinhasQC([]);
      setControlosAdicionais({
        id: '',
        registo_id: '',
        linhas: false,
        borboto: false,
        sujidade: false,
        defeito_transfer: false,
        peca_torta: false,
        problemas_ferro: false,
        outros_controlos: {}
      });
      setComentarios([]);
      setRegistoSelecionado(null);
      
      await carregarHistorico();
    } catch (e) {
      console.error('Erro ao guardar registo:', e);
      alert('Erro ao guardar registo de controlo.');
    }
  };

  /* ----------------------------- Comentários ----------------------------- */

  const adicionarComentario = async () => {
    if (!novoComentario.trim() || !registoSelecionado) return;
    
    try {
      const novoComent = await createQCComentario({
        registo_id: registoSelecionado,
        comentario: novoComentario.trim(),
        usuario: 'Utilizador Atual' // TODO: get from auth context
      });
      
      setComentarios(prev => [...prev, novoComent]);
      setNovoComentario('');
    } catch (e) {
      console.error('Erro ao adicionar comentário:', e);
      alert('Erro ao adicionar comentário.');
    }
  };

  const editarComentario = async (id: string) => {
    if (!textoEdicao.trim()) return;
    
    try {
      const comentarioAtualizado = await updateQCComentario(id, textoEdicao.trim());
      setComentarios(prev => prev.map(c => c.id === id ? comentarioAtualizado : c));
      setEditandoComentario(null);
      setTextoEdicao('');
    } catch (e) {
      console.error('Erro ao editar comentário:', e);
      alert('Erro ao editar comentário.');
    }
  };

  const removerComentario = async (id: string) => {
    if (!confirm('Remover este comentário?')) return;
    
    try {
      await deleteQCComentario(id);
      setComentarios(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Erro ao remover comentário:', e);
      alert('Erro ao remover comentário.');
    }
  };

  /* ----------------------------- Effects ----------------------------- */

  useEffect(() => {
    if (selectedProducao) {
      carregarHistorico();
    }
  }, [selectedProducao]);

  /* --------------------------------- UI ----------------------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando controlo de qualidade...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Ruler className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Erro ao carregar dados</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Ruler className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Controlo de Qualidade</h1>
            <p className="text-gray-600">Registo de medidas e controlo de qualidade completo</p>
          </div>
        </div>
      </div>

      {/* Seleção de Produção */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Produção para Controlo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              placeholder="Pesquisar por OP, cliente, marca, ref..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Selecionar Produção */}
          <select
            value={selectedProducao?.id || ''}
            onChange={(e) => {
              const p = producoes.find(pp => pp.id === e.target.value) || null;
              setSelectedProducao(p);
              setSelectedCor('');
              setSelectedTamanho('');
              setSpec(null);
              setLinhasQC([]);
              setRegistoSelecionado(null);
              if (p) carregarHistorico();
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecionar produção</option>
            {producoesFiltradas.map(p => (
              <option key={p.id} value={p.id}>
                {p.codigoOP || 'OP'} — {p.referenciaInterna} — {p.cliente}
              </option>
            ))}
          </select>

          {/* Selecionar Cor */}
          <select
            value={selectedCor}
            onChange={(e) => { 
              setSelectedCor(e.target.value); 
              setSelectedTamanho('');
              setSpec(null); 
              setLinhasQC([]);
              setRegistoSelecionado(null);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedProducao}
          >
            <option value="">Selecionar cor</option>
            {coresDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Selecionar Tamanho */}
          <select
            value={selectedTamanho}
            onChange={(e) => { 
              setSelectedTamanho(e.target.value); 
              setSpec(null); 
              setLinhasQC([]);
              setRegistoSelecionado(null);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedProducao || !selectedCor}
          >
            <option value="">Selecionar tamanho</option>
            {tamanhosDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Botão para iniciar controlo */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={carregarSpec}
            disabled={!selectedProducao || !selectedCor || !selectedTamanho}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>Iniciar Controlo de Qualidade</span>
          </button>
        </div>

        {/* Info sobre produção selecionada */}
        {selectedProducao && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <span className="text-blue-700 font-medium">OP:</span>
                <span className="ml-1 text-blue-900">{selectedProducao.codigoOP}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Cliente:</span>
                <span className="ml-1 text-blue-900">{selectedProducao.cliente}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Etapa:</span>
                <span className="ml-1 text-blue-900">{selectedProducao.etapa}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Estado:</span>
                <span className="ml-1 text-blue-900">{selectedProducao.estado}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Área de Controlo Ativo */}
      {linhasQC.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Ruler className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Controlo Ativo: {selectedCor} • {selectedTamanho}
              </h2>
            </div>
            <button
              onClick={guardarRegisto}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Controlo</span>
            </button>
          </div>

          {/* Tabela de Medidas */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Medidas</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 w-16">Letra</th>
                    <th className="text-left px-3 py-2">Descrição</th>
                    <th className="text-center px-3 py-2 w-24">Pedida (cm)</th>
                    <th className="text-center px-3 py-2 w-24">Tol. (±cm)</th>
                    <th className="text-center px-3 py-2 w-24">Registada (cm)</th>
                    <th className="text-center px-3 py-2 w-20">Desvio</th>
                    <th className="text-center px-3 py-2 w-20">Passou</th>
                    {spec === null && <th className="px-3 py-2 w-20">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {linhasQC.map((l, idx) => {
                    const desvio =
                      l.medida_pedida_modelista != null
                        ? (Number(l.medida_registada || 0) - Number(l.medida_pedida_modelista))
                        : null;
                    const passou =
                      l.tolerancia_modelista != null && desvio != null
                        ? Math.abs(desvio) <= Number(l.tolerancia_modelista)
                        : null;

                    return (
                      <tr key={l.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input
                            disabled={!!spec}
                            value={l.letra_medida}
                            onChange={(e) => {
                              const v = e.target.value;
                              setLinhasQC(prev => prev.map((row, i) => i === idx ? { ...row, letra_medida: v } : row));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center font-mono disabled:bg-gray-50"
                            placeholder="A"
                            maxLength={3}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            disabled={!!spec}
                            value={l.descricao_medida}
                            onChange={(e) => {
                              const v = e.target.value;
                              setLinhasQC(prev => prev.map((row, i) => i === idx ? { ...row, descricao_medida: v } : row));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-50"
                            placeholder="Ex.: Peito 1/2, Comprimento..."
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-sm text-gray-700 font-medium">
                            {l.medida_pedida_modelista ?? '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-sm text-gray-700">
                            {l.tolerancia_modelista ?? '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={l.medida_registada ?? 0}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setLinhasQC(prev => prev.map((row, i) => i === idx ? { ...row, medida_registada: v } : row));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-sm font-medium ${
                            desvio === null ? 'text-gray-500' :
                            Math.abs(desvio) <= (l.tolerancia_modelista || 0) ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {desvio != null ? desvio.toFixed(1) : '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {passou == null ? (
                            <span className="text-gray-500">-</span>
                          ) : passou ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mx-auto" />
                          )}
                        </td>
                        {spec === null && (
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => {
                                  const linhaToDuplicate = linhasQC[idx];
                                  const novaLinha = {
                                    ...linhaToDuplicate,
                                    id: 'tmp-' + Date.now(),
                                    letra_medida: linhaToDuplicate.letra_medida + "'",
                                  };
                                  setLinhasQC(prev => [...prev.slice(0, idx + 1), novaLinha, ...prev.slice(idx + 1)]);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Duplicar linha"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setLinhasQC(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Remover linha"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {spec === null && (
              <div className="mt-2 flex justify-start">
                <button
                  onClick={() => setLinhasQC(prev => [...prev, {
                    id: 'tmp-' + Date.now(),
                    registo_id: '',
                    letra_medida: '',
                    descricao_medida: '',
                    medida_pedida_modelista: null,
                    tolerancia_modelista: null,
                    medida_registada: 0,
                    desvio: null,
                    passou_controlo: null,
                  }])}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar Medida</span>
                </button>
              </div>
            )}
          </div>

          {/* Controlos Adicionais */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Controlos de Qualidade Adicionais</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="linhas"
                  checked={controlosAdicionais.linhas}
                  onChange={(e) => setControlosAdicionais(prev => ({ ...prev, linhas: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="linhas" className="text-sm font-medium text-gray-700">Linhas</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="borboto"
                  checked={controlosAdicionais.borboto}
                  onChange={(e) => setControlosAdicionais(prev => ({ ...prev, borboto: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="borboto" className="text-sm font-medium text-gray-700">Borboto</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sujidade"
                  checked={controlosAdicionais.sujidade}
                  onChange={(e) => setControlosAdicionais(prev => ({ ...prev, sujidade: e.target.checked }))}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <label htmlFor="sujidade" className="text-sm font-medium text-gray-700">Sujidade</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="defeito_transfer"
                  checked={controlosAdicionais.defeito_transfer}
                  onChange={(e) => setControlosAdicionais(prev => ({ ...prev, defeito_transfer: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="defeito_transfer" className="text-sm font-medium text-gray-700">Defeito Transfer</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="peca_torta"
                  checked={controlosAdicionais.peca_torta}
                  onChange={(e) => setControlosAdicionais(prev => ({ ...prev, peca_torta: e.target.checked }))}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="peca_torta" className="text-sm font-medium text-gray-700">Peça Torta</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="problemas_ferro"
                  checked={controlosAdicionais.problemas_ferro}
                  onChange={(e) => setControlosAdicionais(prev => ({ ...prev, problemas_ferro: e.target.checked }))}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="problemas_ferro" className="text-sm font-medium text-gray-700">Problemas Ferro</label>
              </div>
            </div>
          </div>

          {/* Comentários do Controlo */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-md font-medium text-gray-900">Comentários do Controlo</h3>
              </div>
            </div>

            {/* Lista de comentários */}
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {comentarios.map((comentario) => (
                <div key={comentario.id} className="flex items-start justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex-1">
                    {editandoComentario === comentario.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={textoEdicao}
                          onChange={(e) => setTextoEdicao(e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editarComentario(comentario.id)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditandoComentario(null);
                              setTextoEdicao('');
                            }}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-900">{comentario.comentario}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {comentario.usuario} • {new Date(comentario.created_at).toLocaleString('pt-PT')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {editandoComentario !== comentario.id && (
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => {
                          setEditandoComentario(comentario.id);
                          setTextoEdicao(comentario.comentario);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar comentário"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removerComentario(comentario.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remover comentário"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Adicionar novo comentário */}
            <div className="flex space-x-2">
              <textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                rows={2}
                placeholder="Adicionar comentário sobre este controlo..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <button
                onClick={adicionarComentario}
                disabled={!novoComentario.trim() || !registoSelecionado}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Histórico de Controlos */}
      {selectedProducao && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Histórico de Controlos — {selectedProducao.codigoOP || selectedProducao.referenciaInterna}
            </h2>
          </div>
          
          {registos.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sem registos de controlo</h3>
              <p className="text-gray-500">Os controlos realizados aparecerão aqui</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Data/Hora</th>
                    <th className="text-left px-4 py-3">Cor</th>
                    <th className="text-left px-4 py-3">Tamanho</th>
                    <th className="text-left px-4 py-3">Responsável</th>
                    <th className="text-center px-4 py-3">Medidas</th>
                    <th className="text-center px-4 py-3">Controlos</th>
                    <th className="text-center px-4 py-3">Comentários</th>
                    <th className="text-center px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registos.map((registo) => (
                    <tr key={registo.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {new Date(registo.data_controlo).toLocaleDateString('pt-PT')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(registo.data_controlo).toLocaleTimeString('pt-PT')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {registo.cor_controlada}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {registo.tamanho_controlado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {registo.responsavel || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => carregarRegistoDetalhes(registo.id)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Ver Medidas
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => carregarRegistoDetalhes(registo.id)}
                          className="text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          Ver Controlos
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => carregarRegistoDetalhes(registo.id)}
                          className="text-green-600 hover:text-green-800 hover:underline"
                        >
                          Ver Comentários
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => carregarRegistoDetalhes(registo.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalhes do Registo */}
      {registoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <ClipboardCheck className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Detalhes do Controlo</h3>
              </div>
              <button
                onClick={() => {
                  setRegistoSelecionado(null);
                  setLinhasQC([]);
                  setControlosAdicionais({
                    id: '',
                    registo_id: '',
                    linhas: false,
                    borboto: false,
                    sujidade: false,
                    defeito_transfer: false,
                    peca_torta: false,
                    problemas_ferro: false,
                    outros_controlos: {}
                  });
                  setComentarios([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Medidas */}
              {linhasQC.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Medidas Registadas</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2">Letra</th>
                          <th className="text-left px-3 py-2">Descrição</th>
                          <th className="text-center px-3 py-2">Pedida</th>
                          <th className="text-center px-3 py-2">Tolerância</th>
                          <th className="text-center px-3 py-2">Registada</th>
                          <th className="text-center px-3 py-2">Desvio</th>
                          <th className="text-center px-3 py-2">Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linhasQC.map((linha) => (
                          <tr key={linha.id} className="border-t">
                            <td className="px-3 py-2 font-mono font-bold">{linha.letra_medida}</td>
                            <td className="px-3 py-2">{linha.descricao_medida}</td>
                            <td className="px-3 py-2 text-center">{linha.medida_pedida_modelista ?? '-'}</td>
                            <td className="px-3 py-2 text-center">{linha.tolerancia_modelista ?? '-'}</td>
                            <td className="px-3 py-2 text-center font-medium">{linha.medida_registada}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`font-medium ${
                                linha.desvio === null ? 'text-gray-500' :
                                Math.abs(linha.desvio) <= (linha.tolerancia_modelista || 0) ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {linha.desvio != null ? linha.desvio.toFixed(1) : '-'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {linha.passou_controlo === null ? (
                                <span className="text-gray-500">-</span>
                              ) : linha.passou_controlo ? (
                                <span className="inline-flex items-center text-green-700">
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  OK
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-red-700">
                                  <AlertTriangle className="w-4 h-4 mr-1" />
                                  NOK
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Controlos Adicionais (readonly) */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Controlos de Qualidade</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${controlosAdicionais.linhas ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">Linhas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${controlosAdicionais.borboto ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">Borboto</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${controlosAdicionais.sujidade ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">Sujidade</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${controlosAdicionais.defeito_transfer ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">Defeito Transfer</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${controlosAdicionais.peca_torta ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">Peça Torta</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${controlosAdicionais.problemas_ferro ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">Problemas Ferro</span>
                  </div>
                </div>
              </div>

              {/* Comentários (readonly) */}
              {comentarios.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Comentários</h4>
                  <div className="space-y-2">
                    {comentarios.map((comentario) => (
                      <div key={comentario.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-900">{comentario.comentario}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {comentario.usuario} • {new Date(comentario.created_at).toLocaleString('pt-PT')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControloQualidade;  