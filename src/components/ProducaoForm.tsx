import React, { useState } from 'react';
import { X, Save, Package, Plus, Trash2 } from 'lucide-react';
import { Producao, Etapa, Estado, VarianteProducao } from '../types';
import { etapas, estados, clientes } from '../data/mockData';

interface ProducaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (producao: Omit<Producao, 'id'>) => void;
  producao?: Producao;
}

const ProducaoForm: React.FC<ProducaoFormProps> = ({ isOpen, onClose, onSave, producao }) => {
  const [tamanhosDisponiveis, setTamanhosDisponiveis] = useState<string[]>(() => {
    // Inicializar com tamanhos padrão e tamanhos existentes da produção
    const tamanhosBase = ['XS', 'S', 'M', 'L', 'XL'];
    if (producao) {
      const tamanhosExistentes = Array.from(
        new Set(producao.variantes.flatMap(v => Object.keys(v.tamanhos)))
      );
      return Array.from(new Set([...tamanhosBase, ...tamanhosExistentes])).sort();
    }
    return tamanhosBase;
  });
  
  const [novoTamanho, setNovoTamanho] = useState('');

  const [formData, setFormData] = useState({
    marca: producao?.marca || '',
    cliente: producao?.cliente || '',
    referenciaInterna: producao?.referenciaInterna || '',
    referenciaCliente: producao?.referenciaCliente || '',
    descricao: producao?.descricao || '',
    tipoPeca: producao?.tipoPeca || '',
    genero: producao?.genero || 'Unissexo' as const,
    variantes: producao?.variantes || [{ cor: '', tamanhos: {} }] as VarianteProducao[],
    etapa: producao?.etapa || 'Desenvolvimento' as Etapa,
    estado: producao?.estado || 'Modelagem' as Estado,
    dataInicio: producao?.dataInicio || new Date().toISOString().split('T')[0],
    dataPrevisao: producao?.dataPrevisao || '',
    dataEstimadaEntrega: producao?.dataEstimadaEntrega || '',
    emProducao: producao?.emProducao || false,
    localProducao: producao?.localProducao || 'Interno' as const,
    empresaExterna: producao?.empresaExterna || '',
    linkOdoo: producao?.linkOdoo || ''
  });

  const clienteSelecionado = clientes.find(c => c.nome === formData.cliente);
  const marcasDisponiveis = clienteSelecionado?.marcas || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const producaoData = producao 
      ? { ...formData, id: producao.id } as Producao
      : formData;
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

  const addVariante = () => {
    setFormData(prev => ({
      ...prev,
      variantes: [...prev.variantes, { cor: '', tamanhos: {} }]
    }));
  };

  const removeVariante = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== index)
    }));
  };

  const updateVariante = (index: number, field: keyof VarianteProducao, value: any) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const updateTamanho = (varianteIndex: number, tamanho: string, quantidade: number) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.map((v, i) => 
        i === varianteIndex 
          ? { 
              ...v, 
              tamanhos: { 
                ...v.tamanhos, 
                [tamanho]: quantidade || 0 
              } 
            } 
          : v
      )
    }));
  };

  const adicionarTamanho = () => {
    if (novoTamanho.trim() && !tamanhosDisponiveis.includes(novoTamanho.trim().toUpperCase())) {
      const tamanhoFormatado = novoTamanho.trim().toUpperCase();
      setTamanhosDisponiveis(prev => [...prev, tamanhoFormatado].sort());
      setNovoTamanho('');
    }
  };

  const removerTamanho = (tamanho: string) => {
    // Verificar se o tamanho está sendo usado em alguma variante
    const tamanhoEmUso = formData.variantes.some(v => 
      v.tamanhos[tamanho] && v.tamanhos[tamanho] > 0
    );
    
    if (tamanhoEmUso) {
      if (!confirm(`O tamanho ${tamanho} está sendo usado. Remover mesmo assim?`)) {
        return;
      }
    }
    
    setTamanhosDisponiveis(prev => prev.filter(t => t !== tamanho));
    // Remover o tamanho de todas as variantes
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.map(v => {
        const { [tamanho]: removed, ...restTamanhos } = v.tamanhos;
        return { ...v, tamanhos: restTamanhos };
      })
    }));
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

          {/* Variantes (Cores e Tamanhos) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Variantes (Cores e Tamanhos)</label>
              <button
                type="button"
                onClick={addVariante}
                className="flex items-center space-x-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Cor</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.variantes.map((variante, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Cor {index + 1}</h4>
                    {formData.variantes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariante(index)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cor</label>
                      <input
                        type="text"
                        value={variante.cor}
                        onChange={(e) => updateVariante(index, 'cor', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Ex: Preto, Branco..."
                        required
                      />
                    </div>
                    
                    {/* Tamanhos em grid compacto */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-700">Quantidades por Tamanho</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={novoTamanho}
                            onChange={(e) => setNovoTamanho(e.target.value)}
                            placeholder="Ex: XXL"
                            className="w-16 px-1 py-1 border border-gray-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Adicionar tamanho"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className={`grid gap-2 ${tamanhosDisponiveis.length <= 5 ? 'grid-cols-5' : tamanhosDisponiveis.length <= 6 ? 'grid-cols-6' : 'grid-cols-7'}`}>
                        {tamanhosDisponiveis.map(tamanho => (
                          <div key={tamanho} className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <label className="text-xs font-medium text-gray-600">{tamanho}</label>
                              {!['XS', 'S', 'M', 'L', 'XL'].includes(tamanho) && (
                                <button
                                  type="button"
                                  onClick={() => removerTamanho(tamanho)}
                                  className="ml-1 p-0.5 text-gray-400 hover:text-red-600 transition-colors"
                                  title={`Remover tamanho ${tamanho}`}
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              )}
                            </div>
                            <input
                              type="number"
                              value={variante.tamanhos[tamanho] || ''}
                              onChange={(e) => updateTamanho(index, tamanho, parseInt(e.target.value) || 0)}
                              className="w-full px-1 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                      {tamanhosDisponiveis.length > 5 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Dica: Use Enter para adicionar rapidamente um novo tamanho
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
              <select
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {estados.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
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