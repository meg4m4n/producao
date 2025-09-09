import React, { useMemo, useState } from 'react';
import { Search, Ruler, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useProducoes } from '../hooks/useSupabaseData';
import { Producao, MedidaModelistaDetalhe, QCMedida } from '../types';
import {
  getModelistaSpecFor,
  createQCRegisto,
  insertQCMedidas,
  getQCRegistosByProducao,
  getQCMedidasByRegisto,
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

  // Histórico
  const [registos, setRegistos] = useState<any[]>([]);
  const [registoDetalhe, setRegistoDetalhe] = useState<{ id: string, medidas: QCMedida[] } | null>(null);

  /* ------------------------------- Helpers --------------------------------- */

  const producoesFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return producoes;
    return producoes.filter(p =>
      p.codigoOP?.toLowerCase().includes(q) ||
      p.referenciaInterna?.toLowerCase().includes(q) ||
      p.cliente?.toLowerCase().includes(q)
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

  /* ----------------------------- Carregar SPEC ----------------------------- */

  const carregarSpec = async () => {
    if (!selectedProducao || !selectedCor || !selectedTamanho) return;
    const linhas = await getModelistaSpecFor(selectedProducao.id, selectedCor, selectedTamanho);
    setSpec(linhas.length ? linhas : null);

    if (linhas.length) {
      // Construir linhas QC já com meta info (sem medida_registada ainda)
      setLinhasQC(linhas.map((l) => ({
        id: 'tmp-' + l.id,
        registo_id: '', // definido após criar o registo
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
  };

  /* ----------------------------- Guardar Registo ---------------------------- */

  const guardarRegisto = async () => {
    if (!selectedProducao || !selectedCor || !selectedTamanho) {
      alert('Seleciona produção, cor e tamanho.');
      return;
    }
    // Criar registo (cabeçalho)
    const reg = await createQCRegisto({
      producao_id: selectedProducao.id,
      data_controlo: new Date().toISOString(),
      cor_controlada: selectedCor,
      tamanho_controlado: selectedTamanho,
      responsavel: null,
      resultado_geral: null,
      observacoes: null,
    });

    // Inserir medidas
    const rows: Omit<QCMedida, 'id' | 'created_at' | 'updated_at'>[] = linhasQC.map((l) => ({
      registo_id: reg.id,
      letra_medida: l.letra_medida,
      descricao_medida: l.descricao_medida,
      medida_pedida_modelista: l.medida_pedida_modelista ?? null,
      tolerancia_modelista: l.tolerancia_modelista ?? null,
      medida_registada: Number(l.medida_registada),
      desvio: null,
      passou_controlo: null,
    }));

    await insertQCMedidas(rows);
    alert('Registo de controlo guardado!');
    // Limpar inputs
    setLinhasQC([]);
    // Atualizar histórico
    if (selectedProducao) {
      const lista = await getQCRegistosByProducao(selectedProducao.id);
      setRegistos(lista);
    }
  };

  /* --------------------------------- UI ----------------------------------- */

  if (loading) {
    return (
      <div className="p-6">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-red-700 bg-red-50 border border-red-200 rounded">
        {error}
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
            <p className="text-gray-600">Registo de medidas e comparação com tabela da modelista</p>
          </div>
        </div>
      </div>

      {/* Seleção / Pesquisa */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              placeholder="Pesquisar por OP / Ref. Interna / Cliente"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedProducao?.id || ''}
            onChange={(e) => {
              const p = producoes.find(pp => pp.id === e.target.value) || null;
              setSelectedProducao(p);
              setSelectedCor('');
              setSelectedTamanho('');
              setSpec(null);
              setLinhasQC([]);
              if (p) getQCRegistosByProducao(p.id).then(setRegistos);
            }}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Seleciona uma produção</option>
            {producoesFiltradas.map(p => (
              <option key={p.id} value={p.id}>
                {p.codigoOP || 'OP'} — {p.referenciaInterna} — {p.cliente}
              </option>
            ))}
          </select>

          <button
            onClick={carregarSpec}
            disabled={!selectedProducao || !selectedCor || !selectedTamanho}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Carregar Tabela / Iniciar Controlo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedCor}
            onChange={(e) => { setSelectedCor(e.target.value); setSpec(null); setLinhasQC([]); }}
            className="border rounded-lg px-3 py-2"
            disabled={!selectedProducao}
          >
            <option value="">Seleciona a cor</option>
            {coresDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedTamanho}
            onChange={(e) => { setSelectedTamanho(e.target.value); setSpec(null); setLinhasQC([]); }}
            className="border rounded-lg px-3 py-2"
            disabled={!selectedProducao || !selectedCor}
          >
            <option value="">Seleciona o tamanho</option>
            {tamanhosDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {spec === null && selectedProducao && selectedCor && selectedTamanho && (
            <div className="flex items-center text-amber-700 bg-amber-50 border border-amber-200 rounded px-3">
              <AlertTriangle className="w-4 h-4 mr-2" />
              SEM TABELA DE MEDIDAS INTERNA — podes registar ad-hoc abaixo
            </div>
          )}
        </div>
      </div>

      {/* Grid de Medidas */}
      {linhasQC.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Medidas</h2>
            <button
              onClick={guardarRegisto}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Registo</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="px-3 py-2">Letra</th>
                  <th className="px-3 py-2">Descrição</th>
                  <th className="px-3 py-2">Pedida (cm)</th>
                  <th className="px-3 py-2">Tol. (cm)</th>
                  <th className="px-3 py-2">Registada (cm)</th>
                  <th className="px-3 py-2">Desvio</th>
                  <th className="px-3 py-2">Passou</th>
                  {spec === null && <th className="px-3 py-2"></th>}
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
                    <tr key={l.id} className="border-t">
                      <td className="px-3 py-2">
                        <input
                          disabled={!!spec}
                          value={l.letra_medida}
                          onChange={(e) => {
                            const v = e.target.value;
                            setLinhasQC(prev => prev.map((row, i) => i === idx ? { ...row, letra_medida: v } : row));
                          }}
                          className="w-20 border rounded px-2 py-1"
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
                          className="w-64 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          disabled
                          value={l.medida_pedida_modelista ?? ''}
                          className="w-24 border rounded px-2 py-1 bg-gray-50"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          disabled
                          value={l.tolerancia_modelista ?? ''}
                          className="w-20 border rounded px-2 py-1 bg-gray-50"
                        />
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
                          className="w-24 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        {desvio != null ? desvio.toFixed(1) : '-'}
                      </td>
                      <td className="px-3 py-2">
                        {passou == null ? '-' : (
                          passou
                            ? <span className="inline-flex items-center text-green-700"><CheckCircle2 className="w-4 h-4 mr-1" />OK</span>
                            : <span className="inline-flex items-center text-red-700"><AlertTriangle className="w-4 h-4 mr-1" />NOK</span>
                        )}
                      </td>
                      {spec === null && (
                        <td className="px-3 py-2">
                          <button
                            onClick={() => setLinhasQC(prev => prev.filter((_, i) => i !== idx))}
                            className="text-red-600 hover:underline"
                          >
                            Remover
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {spec === null && (
            <div className="pt-3">
              <button
                onClick={() =>
                  setLinhasQC(prev => [
                    ...prev,
                    {
                      id: 'tmp-' + (prev.length + 1),
                      registo_id: '',
                      letra_medida: '',
                      descricao_medida: '',
                      medida_pedida_modelista: null,
                      tolerancia_modelista: null,
                      medida_registada: 0,
                      desvio: null,
                      passou_controlo: null,
                    },
                  ])
                }
                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
              >
                + Adicionar linha
              </button>
            </div>
          )}
        </div>
      )}

      {/* Histórico */}
      {selectedProducao && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Histórico de Controlo — {selectedProducao.codigoOP || selectedProducao.referenciaInterna}</h2>
          {registos.length === 0 ? (
            <p className="text-gray-500">Sem registos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-3 py-2">Data</th>
                    <th className="px-3 py-2">Cor</th>
                    <th className="px-3 py-2">Tamanho</th>
                    <th className="px-3 py-2">Resultado</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {registos.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2">{new Date(r.data_controlo).toLocaleString('pt-PT')}</td>
                      <td className="px-3 py-2">{r.cor_controlada}</td>
                      <td className="px-3 py-2">{r.tamanho_controlado}</td>
                      <td className="px-3 py-2">{r.resultado_geral || '-'}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={async () => {
                            const medidas = await getQCMedidasByRegisto(r.id);
                            setRegistoDetalhe({ id: r.id, medidas });
                            alert(`Registo ${r.id}\nLinhas: ${medidas.length}`);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Ver detalhes
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

    </div>
  );
};

export default ControloQualidade;