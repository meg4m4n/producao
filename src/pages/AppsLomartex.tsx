import React from 'react';
import { Grid3X3, ExternalLink, Calculator, Printer, Package } from 'lucide-react';

const AppsLomartex: React.FC = () => {
  const apps = [
    {
      id: 'conversor',
      title: 'Conversor KG/MT',
      description: 'Ferramenta para conversão entre quilogramas e metros',
      url: 'https://luminous-blancmange-b169da.netlify.app/',
      icon: Calculator,
      color: 'bg-blue-500'
    },
    {
      id: 'etiquetas',
      title: 'Impressão de Etiquetas',
      description: 'Sistema para impressão de etiquetas de produção',
      url: 'https://dapper-banoffee-6c581f.netlify.app/',
      icon: Printer,
      color: 'bg-green-500'
    },
    {
      id: 'packing',
      title: 'Packing List',
      description: 'Gestão de listas de embalamento e expedição',
      url: 'https://loquacious-tanuki-038afc.netlify.app/',
      icon: Package,
      color: 'bg-purple-500'
    }
  ];

  const handleOpenApp = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Grid3X3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Apps Lomartex</h1>
            <p className="text-gray-600">Ferramentas auxiliares para produção e gestão</p>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => {
          const IconComponent = app.icon;
          return (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenApp(app.url)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{app.title}</h3>
                  <p className="text-sm text-gray-600">{app.description}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Clique para abrir</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenApp(app.url);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <span>Abrir App</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Sobre as Aplicações</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Conversor KG/MT:</strong> Converte facilmente entre quilogramas e metros para diferentes tipos de tecidos</p>
          <p>• <strong>Impressão de Etiquetas:</strong> Gera e imprime etiquetas personalizadas para identificação de produtos</p>
          <p>• <strong>Packing List:</strong> Cria listas detalhadas de embalamento para expedição e controlo de stock</p>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Nota:</strong> Estas aplicações abrem em novas janelas/separadores do navegador.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppsLomartex;