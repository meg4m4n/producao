import React, { useEffect, useMemo, useState } from "react";
import {
  getTabelasMedidasModelista,
  createTabelaMedidasModelista,
  updateTabelaMedidasModelista,
  deleteTabelaMedidasModelista,
  getMedidasModelistaDetalhes,
  upsertMedidasModelistaDetalhes,
} from "../../services/supabaseApi";
import { supabase } from "../../lib/supabase";
import { Producao } from "../../types";
import { Plus, Save, Trash2, Ruler, ClipboardList, Edit2, Copy } from "lucide-react";

/**
 * Secção de TABELAS DE MEDIDAS (Modelista) para uma Produção já gravada (com id).
 * - Listar/selecionar tabelas existentes
 * - Criar nova tabela
 * - Para a tabela ativa: escolher Cor e Tamanho e editar linhas (letra/descrição/pedida/tolerância)
 * - Guardar linhas (insert em massa)
 */

type LinhaEditavel = {
  id?: string;
  letra_medida: string;
  descricao_medida: string;
  medida_pedida?: number | null;
  tolerancia?: number | null;
};

interface Props {
  producao: Producao; // precisa ter producao.id definido
}

const ModelistaMedidasSection: React.FC<Props> = ({ producao }) => {
  const [loading, setLoading] = useState(false);
  const [tabelas, setTabelas] = useState<any[]>([]);
  const [tabelaAtivaId, setTabelaAtivaId] = useState<string | null>(null);

  const cores = useMemo(
    () => Array.from(new Set((producao.variantes || []).map(v => v.cor))).sort(),
    [producao.variantes]
  );
  const tamanhos = useMemo(
    () => Array.from(new Set(producao.variantes.flatMap(v => Object.keys(v.tamanhos)))).sort(),
    [producao.variantes]
  );

  const [corSel, setCorSel] = useState<string>("");
  const [tamSel, setTamSel] = useState<string>("");

  const [linhas, setLinhas] = useState<LinhaEditavel[]>([]);
  const [novoNomeTabela, setNovoNomeTabela] = useState<string>("Tabela de Medidas");
  const [isEditing, setIsEditing] = useState(false);

  /* ------------------------- inicializar cor/tamanho ------------------------- */
  useEffect(() => {
    if (cores.length > 0 && !corSel) {
      setCorSel(cores[0]);
    }
  }, [cores, corSel]);

  useEffect(() => {
    if (tamanhos.length > 0 && !tamSel) {
      setTamSel(tamanhos[0]);
    }
  }, [tamanhos, tamSel]);

  /* ------------------------------ carregar dados ------------------------------ */

  const loadTabelas = async () => {
    if (!producao.id) return;
    try {
      setLoading(true);
      const tabs = await getTabelasMedidasModelista(producao.id);
      setTabelas(tabs);
      if (!tabelaAtivaId && tabs.length > 0) {
        setTabelaAtivaId(tabs[0].id);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar tabelas de medidas da modelista.");
    } finally {
      setLoading(false);
    }
  };

  const loadLinhas = async () => {
    if (!tabelaAtivaId || !corSel || !tamSel) {
      setLinhas([]);
      return;
    }
    try {
      setLoading(true);
      const todas = await getMedidasModelistaDetalhes(tabelaAtivaId);
      const filtradas = todas
        .filter((l) => l.cor === corSel && l.tamanho === tamSel)
        .map((l) => ({
          id: l.id,
          letra_medida: l.letra_medida || "",
          descricao_medida: l.descricao_medida || "",
          medida_pedida: l.medida_pedida ?? null,
          tolerancia: l.tolerancia ?? null,
        }));
      setLinhas(filtradas);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar linhas da tabela da modelista.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabelas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producao.id]);

  useEffect(() => {
    loadLinhas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabelaAtivaId, corSel, tamSel]);

  /* ------------------------------- ações tabela ------------------------------ */

  const criarTabela = async () => {
    if (!producao.id) return;
    if (!novoNomeTabela.trim()) {
      alert("Indica um nome para a tabela.");
      return;
    }
    try {
      setLoading(true);
      const criada = await createTabelaMedidasModelista({
        producao_id: producao.id,
        nome_tabela: novoNomeTabela.trim(),
        data_registo: new Date().toISOString(),
        observacoes: null,
      } as any);
      await loadTabelas();
      setTabelaAtivaId(criada.id);
      setNovoNomeTabela("Tabela de Medidas");
      alert("Tabela criada com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao criar tabela.");
    } finally {
      setLoading(false);
    }
  };

  const renomearTabelaAtual = async () => {
    if (!tabelaAtivaId) return;
    const tabelaAtual = tabelas.find(t => t.id === tabelaAtivaId);
    const novoNome = prompt("Novo nome da tabela:", tabelaAtual?.nome_tabela || "");
    if (!novoNome || novoNome.trim() === tabelaAtual?.nome_tabela) return;
    try {
      setLoading(true);
      await updateTabelaMedidasModelista(tabelaAtivaId, { nome_tabela: novoNome.trim() });
      await loadTabelas();
      alert("Tabela renomeada com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao renomear tabela.");
    } finally {
      setLoading(false);
    }
  };

  const apagarTabelaAtual = async () => {
    if (!tabelaAtivaId) return;
    const tabelaAtual = tabelas.find(t => t.id === tabelaAtivaId);
    if (!confirm(`Apagar a tabela "${tabelaAtual?.nome_tabela}" e TODAS as suas medidas?\n\nEsta ação não pode ser desfeita.`)) return;
    try {
      setLoading(true);
      await deleteTabelaMedidasModelista(tabelaAtivaId);
      setTabelaAtivaId(null);
      await loadTabelas();
      setLinhas([]);
      alert("Tabela apagada com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao apagar tabela.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------ editar linhas ------------------------------ */

  const addLinha = () => {
    const novaLinha: LinhaEditavel = {
      letra_medida: "",
      descricao_medida: "",
      medida_pedida: null,
      tolerancia: null,
    };
    setLinhas((prev) => [...prev, novaLinha]);
    setIsEditing(true);
  };

  const addLinhasPadrao = () => {
    const linhasPadrao: LinhaEditavel[] = [
      { letra_medida: "A", descricao_medida: "Peito 1/2", medida_pedida: null, tolerancia: 0.5 },
      { letra_medida: "B", descricao_medida: "Comprimento", medida_pedida: null, tolerancia: 1.0 },
      { letra_medida: "C", descricao_medida: "Ombro", medida_pedida: null, tolerancia: 0.5 },
      { letra_medida: "D", descricao_medida: "Manga", medida_pedida: null, tolerancia: 1.0 },
      { letra_medida: "E", descricao_medida: "Punho", medida_pedida: null, tolerancia: 0.5 },
    ];
    setLinhas(linhasPadrao);
    setIsEditing(true);
  };

  const duplicarLinha = (idx: number) => {
    const linhaToDuplicate = linhas[idx];
    const novaLinha = {
      ...linhaToDuplicate,
      id: undefined, // nova linha
      letra_medida: linhaToDuplicate.letra_medida + "'",
    };
    setLinhas((prev) => [...prev.slice(0, idx + 1), novaLinha, ...prev.slice(idx + 1)]);
    setIsEditing(true);
  };

  const updateLinha = (idx: number, patch: Partial<LinhaEditavel>) => {
    setLinhas((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
    setIsEditing(true);
  };

  const removeLinha = (idx: number) => {
    if (linhas.length === 1) {
      if (!confirm("Remover a última linha? A tabela ficará vazia para esta cor/tamanho.")) return;
    }
    setLinhas((prev) => prev.filter((_, i) => i !== idx));
    setIsEditing(true);
  };

  const guardarLinhas = async () => {
    if (!tabelaAtivaId || !corSel || !tamSel) {
      alert("Escolhe uma Tabela, Cor e Tamanho.");
      return;
    }
    
    const linhasValidas = linhas.filter((l) => l.letra_medida.trim());
    if (!linhasValidas.length) {
      alert("Adiciona pelo menos uma linha com a letra da medida.");
      return;
    }

    const letras = linhasValidas.map(l => l.letra_medida.trim().toUpperCase());
    const letrasDuplicadas = letras.filter((letra, index) => letras.indexOf(letra) !== index);
    if (letrasDuplicadas.length > 0) {
      alert(`Letras duplicadas encontradas: ${letrasDuplicadas.join(', ')}\nCada letra deve ser única.`);
      return;
    }

    try {
      setLoading(true);
      
      const { error: deleteError } = await supabase
        .from('medidas_modelista_detalhes')
        .delete()
        .eq('tabela_id', tabelaAtivaId)
        .eq('cor', corSel)
        .eq('tamanho', tamSel);
      
      if (deleteError) throw deleteError;

      const payload = linhasValidas.map((l) => ({
        tabela_id: tabelaAtivaId,
        cor: corSel,
        tamanho: tamSel,
        letra_medida: l.letra_medida.trim().toUpperCase(),
        descricao_medida: l.descricao_medida?.trim() || "",
        medida_pedida: l.medida_pedida ?? null,
        tolerancia: l.tolerancia ?? null,
      }));

      await upsertMedidasModelistaDetalhes(payload);
      await loadLinhas();
      setIsEditing(false);
      alert(`${linhasValidas.length} medidas guardadas com sucesso!`);
    } catch (e) {
      console.error(e);
      alert("Erro ao guardar medidas.");
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicao = () => {
    setIsEditing(false);
    loadLinhas();
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ClipboardList className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg text-gray-900 font-semibold">Tabelas de Medidas (Modelista)</h3>
        </div>
        {isEditing && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={cancelarEdicao}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardarLinhas}
              className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded inline-flex items-center"
              disabled={loading || !isEditing}
            >
              <Save className="w-3 h-3 mr-1" />
              Guardar
            </button>
          </div>
        )}
      </div>

      {!producao.id ? (
        <div className="p-3 rounded bg-yellow-50 text-yellow-800 text-sm">
          Para registar a tabela de medidas, primeiro <b>guarda</b> a produção.
        </div>
      ) : (
        <>
          {/* Gestão de Tabelas - Compacta */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Selecionar Tabela */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tabela Ativa</label>
                <div className="flex space-x-1">
                  <select
                    value={tabelaAtivaId ?? ""}
                    onChange={(e) => setTabelaAtivaId(e.target.value || null)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                  >
                    <option value="">— selecionar —</option>
                    {tabelas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome_tabela} • {new Date(t.data_registo).toLocaleDateString("pt-PT")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={renomearTabelaAtual}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
                    disabled={!tabelaAtivaId || loading}
                    title="Renomear tabela"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={apagarTabelaAtual}
                    className="px-2 py-1 text-red-600 hover:bg-red-100 rounded"
                    disabled={!tabelaAtivaId || loading}
                    title="Apagar tabela"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Criar Nova Tabela */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nova Tabela</label>
                <div className="flex space-x-1">
                  <input
                    value={novoNomeTabela}
                    onChange={(e) => setNovoNomeTabela(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="Nome da tabela"
                  />
                  <button
                    type="button"
                    onClick={criarTabela}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                    disabled={loading || !producao.id}
                    title="Criar nova tabela"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Cor e Tamanho */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cor / Tamanho</label>
                <div className="flex space-x-1">
                  <select
                    value={corSel}
                    onChange={(e) => setCorSel(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                    disabled={!tabelaAtivaId}
                  >
                    {cores.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    value={tamSel}
                    onChange={(e) => setTamSel(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                    disabled={!tabelaAtivaId}
                  >
                    {tamanhos.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          {tabelaAtivaId && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={addLinha}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded inline-flex items-center"
                  disabled={loading}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Linha
                </button>
                <button
                  type="button"
                  onClick={addLinhasPadrao}
                  className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded inline-flex items-center"
                  disabled={loading}
                >
                  <Ruler className="w-3 h-3 mr-1" />
                  Medidas Padrão
                </button>
              </div>
              
              {linhas.length > 0 && (
                <div className="text-xs text-gray-500">
                  {linhas.length} medida(s) • {corSel} • {tamSel}
                  {isEditing && <span className="text-orange-600 ml-2">• Não guardado</span>}
                </div>
              )}
            </div>
          )}

          {/* Grid de linhas - Compacto */}
          {tabelaAtivaId && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-2 py-2 w-16">Letra</th>
                      <th className="text-left px-2 py-2">Descrição</th>
                      <th className="text-left px-2 py-2 w-24">Pedida (cm)</th>
                      <th className="text-left px-2 py-2 w-24">Tol. (±cm)</th>
                      <th className="px-2 py-2 w-20">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                          <div className="flex flex-col items-center space-y-2">
                            <Ruler className="w-8 h-8 text-gray-400" />
                            <p>Sem medidas para {corSel} • {tamSel}</p>
                            <p className="text-xs">Clica em "Linha" ou "Medidas Padrão" para começar</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      linhas.map((linha, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="px-2 py-2">
                            <input
                              value={linha.letra_medida}
                              onChange={(e) => updateLinha(idx, { letra_medida: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center font-mono"
                              placeholder="A"
                              maxLength={3}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              value={linha.descricao_medida}
                              onChange={(e) => updateLinha(idx, { descricao_medida: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="Ex.: Peito 1/2, Comprimento..."
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.1"
                              value={linha.medida_pedida ?? ""}
                              onChange={(e) =>
                                updateLinha(idx, {
                                  medida_pedida: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center"
                              placeholder="0.0"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.1"
                              value={linha.tolerancia ?? ""}
                              onChange={(e) =>
                                updateLinha(idx, {
                                  tolerancia: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center"
                              placeholder="0.5"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => duplicarLinha(idx)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Duplicar linha"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeLinha(idx)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Remover linha"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer com ações */}
              {linhas.length > 0 && (
                <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    {linhas.filter(l => l.letra_medida.trim()).length} de {linhas.length} linhas válidas
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditing && (
                      <span className="text-xs text-orange-600 font-medium">Alterações não guardadas</span>
                    )}
                    <button
                      type="button"
                      onClick={guardarLinhas}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded inline-flex items-center"
                      disabled={loading || !isEditing}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Guardar Medidas
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Helper */}
          <div className="mt-3 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2">
            <p><strong>Dica:</strong> Use "Medidas Padrão" para começar rapidamente com as medidas mais comuns (A-E). 
            Pode duplicar linhas e personalizar conforme necessário.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelistaMedidasSection;
