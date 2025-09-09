import React, { useEffect, useMemo, useState } from "react";
import {
  getTabelasMedidasModelista,
  createTabelaMedidasModelista,
  updateTabelaMedidasModelista,
  deleteTabelaMedidasModelista,
  getMedidasModelistaDetalhes,
  getModelistaSpecFor,
  upsertMedidasModelistaDetalhes,
} from "../../services/supabaseApi";
import { Producao } from "../../types";
import { Plus, Save, Trash2, Ruler, ClipboardList } from "lucide-react";

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

  const [corSel, setCorSel] = useState<string>(cores[0] || "");
  const [tamSel, setTamSel] = useState<string>(tamanhos[0] || "");

  const [linhas, setLinhas] = useState<LinhaEditavel[]>([]);
  const [novoNomeTabela, setNovoNomeTabela] = useState<string>("Tabela de Medidas");

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
      // Podes usar getMedidasModelistaDetalhes(tabelaAtivaId) e filtrar por cor/tamanho,
      // ou diretamente a spec mais recente para esta produção/cor/tamanho.
      // Aqui usamos a tabela escolhida + filtro local (para manteres histórico por tabela):
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
      alert("Tabela criada.");
    } catch (e) {
      console.error(e);
      alert("Erro ao criar tabela.");
    } finally {
      setLoading(false);
    }
  };

  const renomearTabelaAtual = async () => {
    if (!tabelaAtivaId) return;
    const novoNome = prompt("Novo nome da tabela:", (tabelas.find(t => t.id === tabelaAtivaId)?.nome_tabela) || "");
    if (!novoNome) return;
    try {
      setLoading(true);
      await updateTabelaMedidasModelista(tabelaAtivaId, { nome_tabela: novoNome });
      await loadTabelas();
      alert("Tabela atualizada.");
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar tabela.");
    } finally {
      setLoading(false);
    }
  };

  const apagarTabelaAtual = async () => {
    if (!tabelaAtivaId) return;
    if (!confirm("Apagar esta tabela e TODAS as suas linhas?")) return;
    try {
      setLoading(true);
      await deleteTabelaMedidasModelista(tabelaAtivaId);
      setTabelaAtivaId(null);
      await loadTabelas();
      setLinhas([]);
      alert("Tabela apagada.");
    } catch (e) {
      console.error(e);
      alert("Erro ao apagar tabela.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------ editar linhas ------------------------------ */

  const addLinha = () => {
    setLinhas((prev) => [
      ...prev,
      {
        letra_medida: "",
        descricao_medida: "",
        medida_pedida: null,
        tolerancia: null,
      },
    ]);
  };

  const updateLinha = (idx: number, patch: Partial<LinhaEditavel>) => {
    setLinhas((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const removeLinha = (idx: number) => {
    setLinhas((prev) => prev.filter((_, i) => i !== idx));
  };

  const guardarLinhas = async () => {
    if (!tabelaAtivaId || !corSel || !tamSel) {
      alert("Escolhe uma Tabela, Cor e Tamanho.");
      return;
    }
    // validação mínima
    const linhasValidas = linhas.filter((l) => l.letra_medida.trim());
    if (!linhasValidas.length) {
      alert("Adiciona pelo menos uma linha com a letra/medida.");
      return;
    }
    try {
      setLoading(true);
      const payload = linhasValidas.map((l) => ({
        tabela_id: tabelaAtivaId,
        cor: corSel,
        tamanho: tamSel,
        letra_medida: l.letra_medida.trim(),
        descricao_medida: l.descricao_medida?.trim() || "",
        medida_pedida: l.medida_pedida ?? null,
        tolerancia: l.tolerancia ?? null,
      }));
      await upsertMedidasModelistaDetalhes(payload);
      await loadLinhas(); // recarregar para apanhar ids, etc.
      alert("Medidas guardadas.");
    } catch (e) {
      console.error(e);
      alert("Erro a guardar medidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex items-center space-x-2 mb-3">
        <ClipboardList className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Tabelas de Medidas (Modelista)</h3>
      </div>

      {!producao.id ? (
        <div className="p-3 rounded bg-yellow-50 text-yellow-800 text-sm">
          Para registar a tabela de medidas, primeiro <b>guarda</b> a produção.
        </div>
      ) : (
        <>
          {/* Barra de Tabelas */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
              <div className="flex-1">
                <label className="text-xs text-gray-600">Tabelas existentes</label>
                <select
                  value={tabelaAtivaId ?? ""}
                  onChange={(e) => setTabelaAtivaId(e.target.value || null)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">— selecionar —</option>
                  {tabelas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome_tabela} • {new Date(t.data_registo).toLocaleDateString("pt-PT")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-xs text-gray-600">Criar nova tabela</label>
                <div className="flex mt-1 space-x-2">
                  <input
                    value={novoNomeTabela}
                    onChange={(e) => setNovoNomeTabela(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Nome da tabela (ex.: Tabela V1)"
                  />
                  <button
                    onClick={criarTabela}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg inline-flex items-center"
                    disabled={loading || !producao.id}
                    title="Criar nova tabela"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Criar
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={renomearTabelaAtual}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg disabled:opacity-50"
                  disabled={!tabelaAtivaId || loading}
                >
                  Renomear
                </button>
                <button
                  onClick={apagarTabelaAtual}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 inline-flex items-center"
                  disabled={!tabelaAtivaId || loading}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Apagar
                </button>
              </div>
            </div>
          </div>

          {/* Filtros Cor/Tamanho */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600">Cor</label>
              <select
                value={corSel}
                onChange={(e) => setCorSel(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {cores.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Tamanho</label>
              <select
                value={tamSel}
                onChange={(e) => setTamSel(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {tamanhos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={addLinha}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center"
                disabled={!tabelaAtivaId || loading}
              >
                <Ruler className="w-4 h-4 mr-1" />
                Adicionar linha
              </button>
            </div>
          </div>

          {/* Grid de linhas */}
          <div className="overflow-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Letra</th>
                  <th className="text-left px-3 py-2">Descrição</th>
                  <th className="text-left px-3 py-2">Medida Pedida</th>
                  <th className="text-left px-3 py-2">Tolerância</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {linhas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                      Sem linhas para esta Cor/Tamanho. Adiciona com “Adicionar linha”.
                    </td>
                  </tr>
                ) : (
                  linhas.map((linha, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">
                        <input
                          value={linha.letra_medida}
                          onChange={(e) => updateLinha(idx, { letra_medida: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                          placeholder="A, B, C…"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={linha.descricao_medida}
                          onChange={(e) => updateLinha(idx, { descricao_medida: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          placeholder="Ex.: Peito 1/2"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={linha.medida_pedida ?? ""}
                          onChange={(e) =>
                            updateLinha(idx, {
                              medida_pedida: e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                          className="w-28 px-2 py-1 border border-gray-300 rounded"
                          placeholder="cm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={linha.tolerancia ?? ""}
                          onChange={(e) =>
                            updateLinha(idx, {
                              tolerancia: e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                          className="w-28 px-2 py-1 border border-gray-300 rounded"
                          placeholder="± cm"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => removeLinha(idx)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                          title="Remover linha"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Ações */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={guardarLinhas}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center disabled:opacity-50"
              disabled={!tabelaAtivaId || loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Medidas
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelistaMedidasSection;
