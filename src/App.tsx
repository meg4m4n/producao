import React, { useState } from 'react';
import Layout from './components/Layout';
import Producoes from './pages/Producoes';
import Registos from './pages/Registos';
import PrepararComponentes from './pages/PrepararComponentes';
import GanttChart from './pages/GanttChart';
import Historico from './pages/Historico';
import AppsLomartex from './pages/AppsLomartex';
import ControloQualidade from './pages/ControloQualidade';
import Financeiro from './pages/Financeiro';
import { PageType } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('producoes');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'producoes':
        return <Producoes />;
      case 'preparar-componentes':
        return <PrepararComponentes />;
      case 'gantt':
        return <GanttChart />;
      case 'registos':
        return <Registos />;
      case 'historico':
        return <Historico />;
      case 'apps-lomartex':
        return <AppsLomartex />;
      case 'controlo-qualidade':
        return <ControloQualidade />;
      case 'financeiro':
        return <Financeiro />;
      default:
        return <Producoes />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;