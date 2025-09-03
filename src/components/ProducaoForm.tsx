import React, { useState, useEffect } from 'react';
import { X, Save, Package, Plus, Trash2, Copy } from 'lucide-react';
import { Producao, Etapa, Estado } from '../types';
import { etapas, estados } from '../data/mockData';
import { useClientes } from '../hooks/useSupabaseData';

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
  const { clientes, loading: clientesLoading } = useClientes();
  
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
    marca: '',
    cliente: '',
    referenciaInterna: '',
    referenciaCliente: '',
    descricao: '',
    tipoPeca: '',
    genero: 'Unissexo' as const,
    etapa: 'Desenvolvimento' as Etapa,
    estado: 'Modelagem' as Estado,
    dataInicio: new Date().toISOString().split('T')[0],
    dataPrevisao: '',
    dataEstimadaEntrega: '',
    emProducao: false,
    problemas: false,
    faltaComponentes: false,
    localProducao: 'Interno' as const,
    empresaExterna: '',
    linkOdoo: '',
    comments: ''
  });

  const [tabelaItems, setTabelaItems] = useState<TabelaItem[]>([]);
  const [novaCor, setNovaCor] = useState('');
  const [novoTamanho, setNovoTamanho] = useState('');

  // Preencher dados quando estiver a editar
  useEffect(() => {
    if (producao && isOpen) {
      setFormData({
        marca: producao.marca || '',
        cliente: producao.cliente || '',
        referenciaInterna: producao.referenciaInterna || '',
        referenciaCliente: producao.referenciaCliente || '',
        descricao: producao.descricao || '',
        tipoPeca: producao.tipoPeca || '',
        genero: producao.genero || 'Unissexo',
        etapa: producao.etapa || 'Desenvolvimento',
        estado: producao.estado || 'Modelagem',
        dataInicio: producao.dataInicio || new Date().toISOString().split('T')[0],
        dataPrevisao: producao.dataPrevisao || '',
        dataEstimadaEntrega: producao.dataEstimadaEntrega || '',
        emProducao: producao.emProducao || false,
        problemas: producao.problemas || false,
        faltaComponentes: producao.estado === 'FALTA COMPONENTES' || false,
        localProducao: producao.localProducao || 'Interno',
        empresaExterna: producao.empresaExterna || '',
        linkOdoo: producao.linkOdoo || '',
        comments: producao.comments || ''
      });

      setTabelaItems(variantesToTabela(producao.variantes || []));
    } else if (!producao && isOpen) {
      // Reset form for new production
      setFormData({
        marca: '',
        cliente: '',
        referenciaInterna: '',
        referenciaCliente: '',
        descricao: '',
        tipoPeca: '',
        genero: 'Unissexo',
        etapa: 'Desenvolvimento',
        estado: 'Modelagem',
        dataInicio: new Date().toISOString().split('T')[0],
        dataPrevisao: '',
        dataEstimadaEntrega: '',
        emProducao: false,
        problemas: false,
        faltaComponentes: false,
        localProducao: 'Interno',
        empresaExterna: '',
        linkOdoo: '',
        comments: ''
      });
      setTabelaItems([]);
    }
  }, [producao, isOpen]);

  const clienteSelecionado = clientes?.find(c => c.nome === formData.cliente);
  const marcasDisponiveis = clienteSelecionado?.marcas || [];
  const coresUnicas = Array.from(new Set(tabelaItems.map(item => item.cor))).filter(Boolean);
  const tamanhosUnicos = Array.from(new Set(tabelaItems.map(item => item.tamanho))).filter(Boolean);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClienteChange = (cliente: string) => {
    setFormData(prev => ({ ...prev, cliente, marca: '' }));
  };

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

  // Funções de adicionar/remover/editar cores e tamanhos
  const adicionarCor = () => {
    if (!novaCor.trim() || coresUnicas.includes(novaCor.trim())) return;
    const cor = novaCor.trim();
    const novosItems: TabelaItem[] = tamanhosUnicos.length > 0
      ? tamanhosUnicos.map(tamanho => ({ id: `${cor}-${tamanho}`, cor, tamanho, quantidade: 0 }))
      : ['XS', 'S', 'M', 'L', 'XL'].map(tamanho => ({ id: `${cor}-${tamanho}`, cor, tamanho, quantidade: 0 }));
    setTabelaItems(prev => [...prev, ...novosItems]);
    setNovaCor('');
  };

  const adicionarTamanho = () => {
    if (!novoTamanho.trim() || tamanhosUnicos.includes(novoTamanho.trim().toUpperCase())) return;
    const tamanho = novoTamanho.trim().toUpperCase();
    const novosItems: TabelaItem[] = coresUnicas.length > 0
      ? coresUnicas.map(cor => ({ id: `${cor}-${tamanho}`, cor, tamanho, quantidade: 0 }))
      : [{ id: `Nova Cor-${tamanho}`, cor: 'Nova Cor', tamanho, quantidade: 0 }];
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

  const removerItem = (id: string) => setTabelaItems(prev => prev.filter(item => item.id !== id));

  const duplicarLinha = (item: TabelaItem) => {
    setTabelaItems(prev => [...prev, { ...item, id: `${item.cor}-${item.tamanho}-${Date.now()}` }]);
  };

  const updateItem = (id: string, field: keyof TabelaItem, value: string | number) => {
    setTabelaItems(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            [field]: value, 
            id: field === 'cor' || field === 'tamanho' ? `${field === 'cor' ? value : item.cor}-${field === 'tamanho' ? value : item.tamanho}` : item.id 
          } 
        : item
    ));
  };

  const adicionarLinha = () => {
    setTabelaItems(prev => [...prev, { 
      id: `nova-${Date.now()}`, 
      cor: '', 
      tamanho: '', 
      quantidade: 0 
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
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

            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
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

            {/* Etapa */}
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

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={formData.faltaComponentes ? 'FALTA COMPONENTES' : formData.estado}
                onChange={(e) => {
                  if (e.target.value === 'FALTA COMPONENTES') {
                    handleChange('faltaComponentes', true);
                    handleChange('estado', 'Aguarda Componentes');
                  } else {
                    handleChange('faltaComponentes', false);
                    handleChange('estado', e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {estados.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
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

          {/* Cores e Tamanhos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cores e Tamanhos</h3>
            
            {/* Adicionar Nova Cor/Tamanho */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={novaCor}
                  onChange={(e) => setNovaCor(e.target.value)}
                  placeholder="Nova cor"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={adicionarCor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={novoTamanho}
                  onChange={(e) => setNovoTamanho(e.target.value)}
                  placeholder="Novo tamanho"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={adicionarTamanho}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabela de Cores/Tamanhos */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tabelaItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.cor}
                          onChange={(e) => updateItem(item.id, 'cor', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.tamanho}
                          onChange={(e) => updateItem(item.id, 'tamanho', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={item.quantidade}
                          onChange={(e) => updateItem(item.id, 'quantidade', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => duplicarLinha(item)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Duplicar linha"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removerItem(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remover linha"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={adicionarLinha}
                  className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Linha</span>
                </button>
              </div>
            </div>

            {/* Resumo de Cores e Tamanhos */}
            {(coresUnicas.length > 0 || tamanhosUnicos.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {coresUnicas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Cores Disponíveis</h4>
                    <div className="flex flex-wrap gap-2">
                      {coresUnicas.map(cor => (
                        <div key={cor} className="flex items-center space-x-2 bg-blue-50 px-2 py-1 rounded">
                          <span className="text-sm text-blue-800">{cor}</span>
                          <button
                            type="button"
                            onClick={() => removerCor(cor)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tamanhosUnicos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tamanhos Disponíveis</h4>
                    <div className="flex flex-wrap gap-2">
                      {tamanhosUnicos.map(tamanho => (
                        <div key={tamanho} className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded">
                          <span className="text-sm text-green-800">{tamanho}</span>
                          <button
                            type="button"
                            onClick={() => removerTamanho(tamanho)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Link Odoo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link do Odoo</label>
            <input
              type="url"
              value={formData.linkOdoo}
              onChange={(e) => handleChange('linkOdoo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://odoo.example.com/production/..."
            />
          </div>

          {/* Comentários */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comentários</label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Comentários sobre a produção..."
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emProducao"
                checked={formData.emProducao}
                onChange={(e) => handleChange('emProducao', e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="emProducao" className="text-sm font-medium text-gray-700">
                Em Produção
              </label>
            </div>

            <div className="flex items-center space-x-2">
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="faltaComponentes"
                checked={formData.faltaComponentes}
                onChange={(e) => {
                  handleChange('faltaComponentes', e.target.checked);
                  if (e.target.checked) {
                    handleChange('estado', 'Aguarda Componentes');
                  }
                }}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="faltaComponentes" className="text-sm font-medium text-gray-700">
                Falta Componentes
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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