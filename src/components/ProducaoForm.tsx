import React, { useState } from 'react';
import { X, Save, Package, Plus, Trash2, Copy } from 'lucide-react';
import { Producao, Etapa, Estado } from '../types';
import { etapas, estados, clientes } from '../data/mockData';

interface ProducaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (producao: Omit<Producao, 'id'>) => void;
  producao?: Producao;
}

interface TabelaItem {
  id: string;
  cor: string;
  tamanho: string;
  quantidade: number;
}

const ProducaoForm: React.FC<ProducaoFormProps> = ({ isOpen, onClose, onSave, producao }) => {
  // Converter variantes para formato de tabela
  const variantesToTabela = (variantes: any[]): TabelaItem[] => {
    const items: TabelaItem[] = [];
    variantes.forEach(variante => {
      Object.entries(variante.tamanhos).forEach(([tamanho, quantidade]) => {
        items.push({
          id: `${variante.cor}-${tamanho}`,
          cor: variante.cor,
          tamanho,
          quantidade: quantidade as number
        });
      });
    });
    return items;
  };

  // Converter tabela para formato de variantes
  const tabelaToVariantes = (tabela: TabelaItem[]) => {
    const variantesMap = new Map();
    
    tabela.forEach(item => {
      if (!variantesMap.has(item.cor)) {
        variantesMap.set(item.cor, { cor: item.cor, tamanhos: {} });
      }
      if (item.quantidade > 0) {
        variantesMap.get(item.cor).tamanhos[item.tamanho] = item.quantidade;
      }
    });
    
    return Array.from(variantesMap.values()).filter(v => Object.keys(v.tamanhos).length > 0);
  };

  const [formData, setFormData] = useState({
    marca: producao?.marca || '',
    cliente: producao?.cliente || '',
    referenciaInterna: producao?.referenciaInterna || '',
    referenciaCliente: producao?.referenciaCliente || '',
    descricao: producao?.descricao || '',
    tipoPeca: producao?.tipoPeca || '',
    genero: producao?.genero || 'Unissexo' as const,
    etapa: producao?.etapa || 'Desenvolvimento' as Etapa,
    estado: producao?.estado || 'Modelagem' as Estado,
    dataInicio: producao?.dataInicio || new Date().toISOString().split('T')[0],
    dataPrevisao: producao?.dataPrevisao || '',
    dataEstimadaEntrega: producao?.dataEstimadaEntrega || '',
    emProducao: producao?.emProducao || false,
    problemas: producao?.problemas || false,
    faltaComponentes: producao?.estado === 'FALTA COMPONENTES' || false,
    localProducao: producao?.localProducao || 'Interno' as const,
    empresaExterna: producao?.empresaExterna || '',
    linkOdoo: producao?.linkOdoo || ''
  });

  const [tabelaItems, setTabelaItems] = useState<TabelaItem[]>(() => {
    if (producao) {
      return variantesToTabela(producao.variantes);
    }
    return [];
  });

  const [novaCor, setNovaCor] = useState('');
  const [novoTamanho, setNovoTamanho] = useState('');

  const clienteSelecionado = clientes.find(c => c.nome === formData.cliente);
  const marcasDisponiveis = clienteSelecionado?.marcas || [];

  // Obter cores e tamanhos únicos
  const coresUnicas = Array.from(new Set(tabelaItems.map(item => item.cor))).filter(Boolean);
  const tamanhosUnicos = Array.from(new Set(tabelaItems.map(item => item.tamanho))).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const variantes = tabelaToVariantes(tabelaItems);
    const producaoData = { 
      ...formData, 
      variantes,
      estado: formData.faltaComponentes ? 'FALTA COMPONENTES' : formData.estado
    };
    delete (producaoData as any).faltaComponentes;
    onSave(producaoData);
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClienteChange = (cliente: string) => {
    setFormData(prev => ({ 
      ...prev, 
      cliente,
      marca: '' // Reset marca quando cliente muda
    }));
  };

  const adicionarCor = () => {
    if (!novaCor.trim() || coresUnicas.includes(novaCor.trim())) return;
    
    const cor = novaCor.trim();
    const novosItems: TabelaItem[] = [];
    
    if (tamanhosUnicos.length === 0) {
      // Se não há tamanhos, adicionar tamanhos padrão
      const tamanhosDefault = ['XS', 'S', 'M', 'L', 'XL'];
      tamanhosDefault.forEach(tamanho => {
        novosItems.push({
          id: `${cor}-${tamanho}`,
          cor,
          tamanho,
          quantidade: 0
        });
      });
    } else {
      // Adicionar a cor para todos os tamanhos existentes
      tamanhosUnicos.forEach(tamanho => {
        novosItems.push({
          id: `${cor}-${tamanho}`,
          cor,
          tamanho,
          quantidade: 0
        });
      });
    }
    
    setTabelaItems(prev => [...prev, ...novosItems]);
    setNovaCor('');
  };

  const adicionarTamanho = () => {
    if (!novoTamanho.trim() || tamanhosUnicos.includes(novoTamanho.trim().toUpperCase())) return;
    
    const tamanho = novoTamanho.trim().toUpperCase();
    const novosItems: TabelaItem[] = [];
    
    if (coresUnicas.length === 0) {
      // Se não há cores, adicionar uma cor padrão
      novosItems.push({
        id: `Nova Cor-${tamanho}`,
        cor: 'Nova Cor',
        tamanho,
        quantidade: 0
      });
    } else {
      // Adicionar o tamanho para todas as cores existentes
      coresUnicas.forEach(cor => {
        novosItems.push({
          id: `${cor}-${tamanho}`,
          cor,
          tamanho,
          quantidade: 0
        });
      });
    }
    
    setTabelaItems(prev => [...prev, ...novosItems]);
    setNovoTamanho('');
  };

  const removerCor = (cor: string) => {
    if (confirm(`Remover todas as entradas da cor "${cor}"?`)) {
      setTabelaItems(prev => prev.filter(item => item.cor !== cor));
    }
  };

  const removerTamanho = (tamanho: string) => {
    if (confirm(`Remover todas as entradas do tamanho "${tamanho}"?`)) {
      setTabelaItems(prev => prev.filter(item => item.tamanho !== tamanho));
    }
  };

  const removerItem = (id: string) => {
    setTabelaItems(prev => prev.filter(item => item.id !== id));
  };

  const duplicarLinha = (item: TabelaItem) => {
    const novoItem: TabelaItem = {
      id: `${item.cor}-${item.tamanho}-${Date.now()}`,
      cor: item.cor,
      tamanho: item.tamanho,
      quantidade: item.quantidade
    };
    setTabelaItems(prev => [...prev, novoItem]);
  };

  const updateItem = (id: string, field: keyof TabelaItem, value: string | number) => {
    setTabelaItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Atualizar ID se cor ou tamanho mudaram
        if (field === 'cor' || field === 'tamanho') {
          updatedItem.id = `${updatedItem.cor}-${updatedItem.tamanho}`;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Adicionar nova linha vazia
      const novoItem: TabelaItem = {
        id: `nova-${Date.now()}`,
        cor: '',
        tamanho: '',
        quantidade: 0
      };
      setTabelaItems(prev => [...prev, novoItem]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {producao ? 'Editar Produção' : 'Nova Produção'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <select
                value={formData.cliente}
                onChange={(e) => handleClienteChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecionar cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.nome}>{cliente.nome}</option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
              <select
                value={formData.marca}
                onChange={(e) => handleChange('marca', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.cliente}
              >
                <option value="">Selecionar marca</option>
                {marcasDisponiveis.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>

            {/* Referência Interna */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Referência Interna</label>
              <input
                type="text"
                value={formData.referenciaInterna}
                onChange={(e) => handleChange('referenciaInterna', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Referência Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Referência Cliente</label>
              <input
                type="text"
                value={formData.referenciaCliente}
                onChange={(e) => handleChange('referenciaCliente', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Tipo de Peça */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Peça</label>
              <input
                type="text"
                value={formData.tipoPeca}
                onChange={(e) => handleChange('tipoPeca', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
              <select
                value={formData.genero}
                onChange={(e) => handleChange('genero', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Unissexo">Unissexo</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Tabela Dinâmica de Cores e Tamanhos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Quantidades por Cor e Tamanho</label>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={novaCor}
                    onChange={(e) => setNovaCor(e.target.value)}
                    placeholder="Nova cor"
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        adicionarCor();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={adicionarCor}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Cor</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={novoTamanho}
                    onChange={(e) => setNovoTamanho(e.target.value)}
                    placeholder="Novo tamanho"
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        adicionarTamanho();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={adicionarTamanho}
                    className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tamanho</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                        Cor
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                        Tamanho
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                        Quantidade
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200 w-20">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabelaItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={item.cor}
                              onChange={(e) => updateItem(item.id, 'cor', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              onKeyPress={(e) => handleKeyPress(e, index)}
                            />
                            {coresUnicas.filter(c => c === item.cor).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removerCor(item.cor)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title={`Remover cor ${item.cor}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={item.tamanho}
                              onChange={(e) => updateItem(item.id, 'tamanho', e.target.value.toUpperCase())}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              onKeyPress={(e) => handleKeyPress(e, index)}
                            />
                            {tamanhosUnicos.filter(t => t === item.tamanho).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removerTamanho(item.tamanho)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title={`Remover tamanho ${item.tamanho}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          <input
                            type="number"
                            value={item.quantidade}
                            onChange={(e) => updateItem(item.id, 'quantidade', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            onKeyPress={(e) => handleKeyPress(e, index)}
                          />
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          <div className="flex justify-center space-x-1">
                            <button
                              type="button"
                              onClick={() => duplicarLinha(item)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Duplicar linha"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removerItem(item.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remover linha"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {tabelaItems.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Nenhuma variante adicionada. Use os botões acima para adicionar cores e tamanhos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>• Pressione Enter numa célula para adicionar uma nova linha</p>
              <p>• Use o botão de duplicar para copiar uma linha existente</p>
              <p>• Adicionar uma nova cor cria automaticamente linhas para todos os tamanhos</p>
              <p>• Adicionar um novo tamanho cria automaticamente linhas para todas as cores</p>
            </div>
          </div>

          {/* Datas e Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Etapa</label>
              <select
                value={formData.etapa}
                onChange={(e) => handleChange('etapa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {etapas.map(etapa => (
                  <option key={etapa} value={etapa}>{etapa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <div className="space-y-3">
                <select
                  value={formData.faltaComponentes ? 'FALTA COMPONENTES' : formData.estado}
                  onChange={(e) => {
                    if (e.target.value === 'FALTA COMPONENTES') {
                      handleChange('faltaComponentes', true);
                    } else {
                      handleChange('faltaComponentes', false);
                      handleChange('estado', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={formData.faltaComponentes}
                >
                  {estados.filter(estado => estado !== 'FALTA COMPONENTES').map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="faltaComponentes"
                    checked={formData.faltaComponentes}
                    onChange={(e) => {
                      handleChange('faltaComponentes', e.target.checked);
                      if (!e.target.checked) {
                        handleChange('estado', 'Modelagem');
                      }
                    }}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="faltaComponentes" className="text-sm font-medium text-red-700">
                    FALTA COMPONENTES
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-6">
              <input
                type="checkbox"
                id="emProducao"
                checked={formData.emProducao}
                onChange={(e) => handleChange('emProducao', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="emProducao" className="text-sm font-medium text-gray-700">
                Em Produção
              </label>
              
              <input
                type="checkbox"
                id="problemas"
                checked={formData.problemas}
                onChange={(e) => handleChange('problemas', e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="problemas" className="text-sm font-medium text-gray-700">
                Com Problemas
              </label>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
              <input
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleChange('dataInicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Previsão</label>
              <input
                type="date"
                value={formData.dataPrevisao}
                onChange={(e) => handleChange('dataPrevisao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Estimada de Entrega</label>
              <input
                type="date"
                value={formData.dataEstimadaEntrega}
                onChange={(e) => handleChange('dataEstimadaEntrega', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Local de Produção */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Local de Produção</label>
              <select
                value={formData.localProducao}
                onChange={(e) => handleChange('localProducao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Interno">Interno</option>
                <option value="Externo">Externo</option>
              </select>
            </div>

            {formData.localProducao === 'Externo' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa Externa</label>
                <input
                  type="text"
                  value={formData.empresaExterna}
                  onChange={(e) => handleChange('empresaExterna', e.target.value)}
                  placeholder="Nome da empresa externa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={formData.localProducao === 'Externo'}
                />
              </div>
            )}
          </div>

          {/* Link do Odoo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link do Odoo (opcional)</label>
            <input
              type="url"
              value={formData.linkOdoo}
              onChange={(e) => handleChange('linkOdoo', e.target.value)}
              placeholder="https://odoo.example.com/production/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{producao ? 'Atualizar' : 'Criar'} Produção</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProducaoForm;