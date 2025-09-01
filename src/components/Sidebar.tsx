import React from 'react';
import { Factory, FileText, Menu, X, Package2 } from 'lucide-react';
import { PageType } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, currentPage, onPageChange }) => {
  const menuItems = [
    { 
      id: 'producoes' as PageType, 
      label: 'Produções', 
      icon: Factory,
      description: 'Gestão de produções'
    },
    { 
      id: 'preparar-componentes' as PageType, 
      label: 'A preparar componentes', 
      icon: Package2,
      description: 'Componentes pendentes'
    },
    { 
      id: 'registos' as PageType, 
      label: 'Registos', 
      icon: FileText,
      description: 'Gestão de dados'
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-56' : 'w-14'}
        shadow-lg lg:shadow-none
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
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                title={!isOpen ? item.label : ''}
                className={`
                  w-full flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 relative
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }
                  ${isOpen ? 'justify-start' : 'justify-center'}
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"></div>
                )}
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
      </div>
    </>
  );
};

export default Sidebar;