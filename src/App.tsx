import React, { useState } from 'react';
import Layout from './components/Layout';
import Producoes from './pages/Producoes';
import Registos from './pages/Registos';
import { PageType } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('producoes');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'producoes':
        return <Producoes />;
      case 'registos':
        return <Registos />;
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