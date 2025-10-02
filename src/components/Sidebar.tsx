import React from 'react';
import { Factory, FileText, Menu, X, Package2, Calendar, Archive, Grid3x3 as Grid3X3, Shield, DollarSign, LogOut, User as User2, Truck } from 'lucide-react';
import { Users } from 'lucide-react';
import { PageType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, currentPage, onPageChange }) => {
  const { hasPageAccess, user, logout } = useAuth();

  const menuItems = [
    { id: 'producoes' as PageType, label: 'Produções', icon: Factory, description: 'Gestão de produções' },
    { id: 'preparar-componentes' as PageType, label: 'A preparar componentes', icon: Package2, description: 'Componentes pendentes' },
    { id: 'gantt' as PageType, label: 'Planeamento', icon: Calendar, description: 'Planeamento e timeline' },
    { id: 'registos' as PageType, label: 'Registos', icon: FileText, description: 'Gestão de dados' },
    { id: 'historico' as PageType, label: 'Histórico', icon: Archive, description: 'Eliminados e completos' },
    { id: 'apps-lomartex' as PageType, label: 'Apps Lomartex', icon: Grid3X3, description: 'Ferramentas auxiliares' },
    { id: 'controlo-qualidade' as PageType, label: 'Controlo de Qualidade', icon: Shield, description: 'Gestão de qualidade' },
    { id: 'financeiro' as PageType, label: 'Financeiro', icon: DollarSign, description: 'Gestão financeira' },
    { id: 'envios' as PageType, label: 'Envios', icon: Truck, description: 'Gestão de envios' },
    { id: 'users' as PageType, label: 'Utilizadores', icon: Users, description: 'Gestão de utilizadores' },
  ];

  const accessibleMenuItems = menuItems.filter(item => hasPageAccess(item.id));

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-56' : 'w-14'}
        shadow-lg lg:shadow-none
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className={`flex items-center space-x-3 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            <Factory className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-800">ProduTech</h1>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {accessibleMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                title={!isOpen ? item.label : ''}
                className={`
                  w-full flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 relative
                  ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                  ${isOpen ? 'justify-start' : 'justify-center'}
                `}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />}
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
                {isOpen && (
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium text-sm truncate">{item.label}</span>
                    <span className="text-xs opacity-70 truncate">{item.description}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Logout footer */}
        <div className="border-t border-gray-200 p-3">
          {isOpen ? (
            <div className="flex items-center gap-2 mb-2">
              <User2 className="w-4 h-4 text-gray-500" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{user?.name || 'Utilizador'}</div>
                <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center mb-2">
              <User2 className="w-4 h-4 text-gray-500" title={user?.email || 'Utilizador'} />
            </div>
          )}

          <button
            onClick={logout}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50`}
            title="Terminar sessão"
          >
            <LogOut className="w-4 h-4" />
            {isOpen && 'Sair'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
