import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Producoes from './pages/Producoes';
import Registos from './pages/Registos';
import PrepararComponentes from './pages/PrepararComponentes';
import GanttChart from './pages/GanttChart';
import Historico from './pages/Historico';
import AppsLomartex from './pages/AppsLomartex';
import ControloQualidade from './pages/ControloQualidade';
import Financeiro from './pages/Financeiro';
import Users from './pages/Users';
import { PageType } from './types';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('producoes');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'producoes':
        return (
          <ProtectedRoute page="producoes">
            <Producoes />
          </ProtectedRoute>
        );
      case 'preparar-componentes':
        return (
          <ProtectedRoute page="preparar-componentes">
            <PrepararComponentes />
          </ProtectedRoute>
        );
      case 'gantt':
        return (
          <ProtectedRoute page="gantt">
            <GanttChart />
          </ProtectedRoute>
        );
      case 'registos':
        return (
          <ProtectedRoute page="registos">
            <Registos />
          </ProtectedRoute>
        );
      case 'historico':
        return (
          <ProtectedRoute page="historico">
            <Historico />
          </ProtectedRoute>
        );
      case 'apps-lomartex':
        return (
          <ProtectedRoute page="apps-lomartex">
            <AppsLomartex />
          </ProtectedRoute>
        );
      case 'controlo-qualidade':
        return (
          <ProtectedRoute page="controlo-qualidade">
            <ControloQualidade />
          </ProtectedRoute>
        );
      case 'financeiro':
        return (
          <ProtectedRoute page="financeiro">
            <Financeiro />
          </ProtectedRoute>
        );
      case 'users':
        return (
          <ProtectedRoute page="users">
            <Users />
          </ProtectedRoute>
        );
      default:
        return (
          <ProtectedRoute page="producoes">
            <Producoes />
          </ProtectedRoute>
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;