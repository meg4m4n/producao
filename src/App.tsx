import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Producoes from './pages/Producoes';
import Registos from './pages/Registos';
import { PageType } from './types';
import { initializeDatabase } from './config/database';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('producoes');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setIsInitialized(true); // Continue mesmo com erro
      }
    };
    init();
  }, []);

  const renderCurrentPage = () => {
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">A inicializar base de dados...</p>
          </div>
        </div>
      );
    }

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