import React from 'react';
import { X, Package, Calendar, Euro, ExternalLink, User, Building, FileText, CreditCard } from 'lucide-react';
import { Envio } from '../services/supabaseApi';

interface EnvioDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  envio: Envio | null;
}

const EnvioDetailsModal: React.FC<EnvioDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  envio 
}) => {
  if (!isOpen || !envio) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)}€`;
  };

  const getTrackingUrl = (transportadora: string, tracking: string): string | null => {
    if (!tracking) return null;
    
    const transportadoraLower = transportadora.toLowerCase();
    
    if (transportadoraLower.includes('tnt')) {
      return `https://www.tnt.com/express/pt_pt/site/shipping-tools/tracking.html?searchType=con&cons=${tracking}`;
    } else if (transportadoraLower.includes('dhl')) {
      return `https://www.dhl.com/pt-pt/home/tracking/tracking-express.html?submit=1&tracking-id=${tracking}`;
    } else if (transportadoraLower.includes('ups')) {
      return `https://www.ups.com/track?loc=pt_PT&tracknum=${tracking}`;
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detalhes do Envio</h2>
              <p className="text-sm text-gray-600">
                {formatDate(envio.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                envio.pago ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="font-medium text-gray-900">
                {envio.pago ? 'Pago' : 'Pendente'}
              </span>
            </div>
            {envio.pago_at && (
              <span className="text-sm text-gray-600">
                Pago em: {formatDate(envio.pago_at)}
              </span>
            )}
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{envio.cliente_nome || 'Sem cliente'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <span className="text-gray-900">{envio.responsavel}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transportadora</label>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{envio.transportadora}</span>
                </div>
              </div>

            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pedido Por</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  envio.pedido_por === 'cliente'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {envio.pedido_por === 'cliente' ? 'Cliente' : 'Lomartex'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pago Por</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  envio.pago_por === 'cliente'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {envio.pago_por === 'cliente' ? 'Cliente' : 'Lomartex'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking</label>
                {envio.tracking ? (
                  (() => {
                    const trackingUrl = getTrackingUrl(envio.transportadora, envio.tracking);
                    return trackingUrl ? (
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink size={16} />
                        <span className="font-mono">{envio.tracking}</span>
                      </a>
                    ) : (
                      <span className="text-gray-900 font-mono">{envio.tracking}</span>
                    );
                  })()
                ) : (
                  <span className="text-gray-400">Sem tracking</span>
                )}
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-900 whitespace-pre-wrap">{envio.descricao}</p>
            </div>
          </div>

          {/* Valores Financeiros */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Informação Financeira</span>
            </h3>

            {envio.numero_fatura && (
              <div className="mb-3 pb-3 border-b border-blue-200">
                <label className="block text-sm font-medium text-blue-700 mb-1">Número de Fatura</label>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-900 font-mono font-semibold">{envio.numero_fatura}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Valor de Custo</label>
                <div className="flex items-center space-x-1">
                  <Euro className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-900 font-semibold">{formatCurrency(envio.valor_custo)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Valor a Cobrar</label>
                <div className="flex items-center space-x-1">
                  <Euro className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-900 font-semibold text-lg">{formatCurrency(envio.valor_cobrar)}</span>
                </div>
              </div>
            </div>

            {envio.valor_custo > 0 && envio.valor_cobrar > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Margem:</span>
                  <span className="font-semibold text-blue-900">
                    {formatCurrency(envio.valor_cobrar - envio.valor_custo)}
                    ({(((envio.valor_cobrar - envio.valor_custo) / envio.valor_custo) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Carta de Porte */}
          {envio.carta_porte_url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carta de Porte</label>
              <a
                href={envio.carta_porte_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Carta de Porte</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvioDetailsModal;