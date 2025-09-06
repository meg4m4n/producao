import React from 'react';
import { LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">{user.email}</span>
              {user.role === 'admin' && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Sair do sistema"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Header;