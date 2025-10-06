import React, { useState, useEffect } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { getClientes, createCliente } from '../services/supabaseApi';
import { Cliente } from '../types';

interface EnvioFormProps {
  onSubmit: (data: EnvioFormData) => void;
  onClose: () => void;
}

export interface EnvioFormData {
  cliente_id: string | null;
  descricao: string;
  responsavel: string;
  pedido_por: 'cliente' | 'lomartex';
  pago_por: 'cliente' | 'lomartex';
  transportadora: string;
  tracking: string;
  valor_custo: number;
  valor_cobrar: number;
  numero_fatura: string;
  carta_porte_file?: File;
}

export default function EnvioForm({ onSubmit, onClose }: EnvioFormProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showNewClienteForm, setShowNewClienteForm] = useState(false);
  const [newClienteName, setNewClienteName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<EnvioFormData>({
    cliente_id: null,
    descricao: '',
    responsavel: '',
    pedido_por: 'cliente',
    pago_por: 'cliente',
    transportadora: '',
    tracking: '',
    valor_custo: 0,
    valor_cobrar: 0,
    numero_fatura: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (formData.valor_custo > 0 && formData.valor_cobrar === 0) {
      setFormData((prev) => ({
        ...prev,
        valor_cobrar: prev.valor_custo * 1.5,
      }));
    }
  }, [formData.valor_custo]);

  const loadClientes = async () => {
    const data = await getClientes();
    setClientes(data);
  };

  const handleCreateCliente = async () => {
    if (!newClienteName.trim()) return;

    try {
      const newCliente = await createCliente({
        nome: newClienteName,
        marcas: [],
      });
      setClientes([...clientes, newCliente]);
      setFormData({ ...formData, cliente_id: newCliente.id });
      setNewClienteName('');
      setShowNewClienteForm(false);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      alert('Erro ao criar cliente');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Por favor, selecione apenas ficheiros PDF');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descricao.trim()) {
      alert('Por favor, preencha a descrição');
      return;
    }

    if (!formData.responsavel.trim()) {
      alert('Por favor, preencha o responsável');
      return;
    }

    const submitData = { ...formData };
    if (selectedFile) {
      submitData.carta_porte_file = selectedFile;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Novo Envio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            {!showNewClienteForm ? (
              <div className="flex gap-2">
                <select
                  value={formData.cliente_id || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, cliente_id: e.target.value || null })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecionar cliente (opcional)</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewClienteForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  + Novo
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newClienteName}
                  onChange={(e) => setNewClienteName(e.target.value)}
                  placeholder="Nome do novo cliente"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleCreateCliente}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewClienteForm(false);
                    setNewClienteName('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsável *
            </label>
            <input
              type="text"
              value={formData.responsavel}
              onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pedido por *
              </label>
              <select
                value={formData.pedido_por}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pedido_por: e.target.value as 'cliente' | 'lomartex',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cliente">Cliente</option>
                <option value="lomartex">Lomartex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pago por *
              </label>
              <select
                value={formData.pago_por}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pago_por: e.target.value as 'cliente' | 'lomartex',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cliente">Cliente</option>
                <option value="lomartex">Lomartex</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transportadora *
            </label>
            <input
              type="text"
              value={formData.transportadora}
              onChange={(e) => setFormData({ ...formData, transportadora: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking
            </label>
            <input
              type="text"
              value={formData.tracking}
              onChange={(e) => setFormData({ ...formData, tracking: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Fatura
            </label>
            <input
              type="text"
              value={formData.numero_fatura}
              onChange={(e) => setFormData({ ...formData, numero_fatura: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: FAT-2025-001"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Custo (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_custo}
                onChange={(e) =>
                  setFormData({ ...formData, valor_custo: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor a Cobrar (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_cobrar}
                onChange={(e) =>
                  setFormData({ ...formData, valor_cobrar: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sugestão: {(formData.valor_custo * 1.5).toFixed(2)}€ (margem 50%)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carta de Porte (PDF)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                  {selectedFile ? (
                    <>
                      <FileText size={20} className="text-blue-600" />
                      <span className="text-sm text-gray-700">{selectedFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Clique para fazer upload do PDF
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Remover
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Envio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
