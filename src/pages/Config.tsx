import React, { useState } from 'react';
import { Database, Save, TestTube, Check, X, AlertTriangle, Info } from 'lucide-react';

interface ConfigForm {
  host: string;
  user: string;
  password: string;
  dbName: string;
}

const Config: React.FC = () => {
  const [config, setConfig] = useState<ConfigForm>({
    host: 'localhost',
    user: 'admin',
    password: '',
    dbName: 'producoes_db'
  });

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showWarning, setShowWarning] = useState(false);

  const handleInputChange = (field: keyof ConfigForm, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    if (!showWarning) {
      setShowWarning(true);
      return;
    }
    
    setConnectionStatus('testing');
    
    // Simular teste de conexão
    setTimeout(() => {
      setConnectionStatus(Math.random() > 0.5 ? 'success' : 'error');
    }, 2000);
  };

  const handleSaveConfig = () => {
    if (!showWarning) {
      setShowWarning(true);
      return;
    }
    
    // Aqui seria salva a configuração
    console.log('Configuração salva:', config);
    alert('Configuração salva com sucesso!');
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testando conexão...';
      case 'success':
        return 'Conexão bem-sucedida!';
      case 'error':
        return 'Falha na conexão';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuração da Base de Dados</h1>
            <p className="text-gray-600">Configure a ligação à base de dados do sistema</p>
          </div>
        </div>
      </div>

      {/* Aviso sobre dados demo */}
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Modo Demonstração Ativo</h3>
            <p className="text-amber-800 mb-3">
              A aplicação está atualmente a utilizar dados de demonstração. Todas as produções, 
              categorias, etapas e estados são fictícios e servem apenas para demonstrar as funcionalidades.
            </p>
            <div className="bg-amber-100 rounded-lg p-3 border border-amber-300">
              <p className="text-sm text-amber-800 font-medium">
                ⚠️ Importante: Ao conectar com uma base de dados real, todos os dados demo serão perdidos permanentemente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Aviso */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <h3 className="text-xl font-bold text-gray-900">Aviso Importante</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  Ao conectar com uma base de dados real, <strong>todos os dados de demonstração serão perdidos permanentemente</strong>.
                </p>
                <p className="text-gray-700">
                  Isto inclui:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Todas as produções de exemplo</li>
                  <li>Categorias personalizadas</li>
                  <li>Etapas e estados configurados</li>
                </ul>
                <p className="text-sm text-red-600 font-medium">
                  Esta ação não pode ser desfeita!
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowWarning(false);
                    handleTestConnection();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Continuar Mesmo Assim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Configuração */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Parâmetros de Ligação</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Host */}
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-2">
                Host / Servidor
              </label>
              <input
                type="text"
                id="host"
                value={config.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                placeholder="localhost ou IP do servidor"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Database Name */}
            <div>
              <label htmlFor="dbName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Base de Dados
              </label>
              <input
                type="text"
                id="dbName"
                value={config.dbName}
                onChange={(e) => handleInputChange('dbName', e.target.value)}
                placeholder="Nome da base de dados"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* User */}
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                Utilizador
              </label>
              <input
                type="text"
                id="user"
                value={config.user}
                onChange={(e) => handleInputChange('user', e.target.value)}
                placeholder="Nome de utilizador"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Palavra-passe
              </label>
              <input
                type="password"
                id="password"
                value={config.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Palavra-passe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status da Conexão */}
          {connectionStatus !== 'idle' && (
            <div className={`mt-6 p-4 rounded-lg border ${
              connectionStatus === 'success' ? 'bg-green-50 border-green-200' :
              connectionStatus === 'error' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={connectionStatus === 'testing'}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube className="w-4 h-4" />
              <span>Testar Ligação</span>
            </button>
            
            <button
              type="button"
              onClick={handleSaveConfig}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuração</span>
            </button>
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Notas Importantes</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Certifique-se de que a base de dados está acessível a partir desta aplicação</li>
          <li>• As credenciais são guardadas de forma segura no sistema</li>
          <li>• Teste sempre a ligação antes de guardar a configuração</li>
          <li>• Em caso de problemas, contacte o administrador do sistema</li>
        </ul>
      </div>
    </div>
  );
};

export default Config;