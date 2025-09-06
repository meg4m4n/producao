import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageType } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  page: PageType;
  requireEdit?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  page, 
  requireEdit = false 
}) => {
  const { user, hasPageAccess, canEditPage } = useAuth();

  if (!user) {
    return null; // This should not happen as login is handled at app level
  }

  const hasAccess = hasPageAccess(page);
  const canEdit = canEditPage(page);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">
            Não tem permissão para aceder a esta página.
          </p>
          <p className="text-sm text-gray-500">
            Contacte o administrador para obter acesso.
          </p>
        </div>
      </div>
    );
  }

  if (requireEdit && !canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Permissão Insuficiente</h2>
          <p className="text-gray-600 mb-4">
            Tem acesso de leitura, mas não pode editar esta página.
          </p>
          <p className="text-sm text-gray-500">
            Contacte o administrador para obter permissões de edição.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;