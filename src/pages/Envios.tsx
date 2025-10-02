import React, { useState, useEffect } from 'react';
import { Plus, ExternalLink, Package, Calendar, Euro } from 'lucide-react';
import {
  getEnvios,
  createEnvio,
  uploadCartaPorte,
  Envio,
} from '../services/supabaseApi';
import EnvioForm, { EnvioFormData } from '../components/EnvioForm';

export default function Envios() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadEnvios();
  }, []);

  const loadEnvios = async () => {
    setLoading(true);
    try {
      const data = await getEnvios();
      setEnvios(data);
    } catch (error) {
      console.error('Erro ao carregar envios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnvio = async (formData: EnvioFormData) => {
    try {
      let cartaPorteUrl = null;

      const newEnvio = await createEnvio({
        cliente_id: formData.cliente_id,
        descricao: formData.descricao,
        responsavel: formData.responsavel,
        pedido_por: formData.pedido_por,
        pago_por: formData.pago_por,
        transportadora: formData.transportadora,
        tracking: formData.tracking,
        valor_custo: formData.valor_custo,
        valor_cobrar: formData.valor_cobrar,
        carta_porte_url: cartaPorteUrl,
      });

      if (formData.carta_porte_file) {
        cartaPorteUrl = await uploadCartaPorte(formData.carta_porte_file, newEnvio.id);
        await createEnvio({
          ...newEnvio,
          carta_porte_url: cartaPorteUrl,
        });
      }

      setShowForm(false);
      loadEnvios();
    } catch (error) {
      console.error('Erro ao criar envio:', error);
      alert('Erro ao criar envio');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)}€`;
  };

  const totalPages = Math.ceil(envios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEnvios = envios.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">A carregar envios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Envios</h1>
          <p className="text-gray-600 mt-1">Gestão de envios e transportadoras</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novo Envio
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transportadora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido Por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago Por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Custo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  A Cobrar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carta Porte
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEnvios.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Nenhum envio registado</p>
                    <p className="text-gray-400 mt-1">
                      Clique em "Novo Envio" para criar o primeiro envio
                    </p>
                  </td>
                </tr>
              ) : (
                currentEnvios.map((envio) => (
                  <tr key={envio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar size={16} className="text-gray-400" />
                        {formatDate(envio.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {envio.cliente_nome || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={envio.descricao}>
                        {envio.descricao}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{envio.responsavel}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{envio.transportadora}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{envio.tracking || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          envio.pedido_por === 'cliente'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {envio.pedido_por === 'cliente' ? 'Cliente' : 'Lomartex'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          envio.pago_por === 'cliente'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {envio.pago_por === 'cliente' ? 'Cliente' : 'Lomartex'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Euro size={14} className="text-gray-400" />
                        {formatCurrency(envio.valor_custo)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                        <Euro size={14} className="text-gray-400" />
                        {formatCurrency(envio.valor_cobrar)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {envio.carta_porte_url ? (
                        <a
                          href={envio.carta_porte_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <ExternalLink size={16} />
                          Ver
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                A mostrar {startIndex + 1} a {Math.min(endIndex, envios.length)} de {envios.length}{' '}
                envios
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && <EnvioForm onSubmit={handleCreateEnvio} onClose={() => setShowForm(false)} />}
    </div>
  );
}
