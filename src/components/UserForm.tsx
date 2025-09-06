import React, { useState, useEffect } from 'react';
import { X, Save, Users, Shield, Eye, Edit } from 'lucide-react';
import { User, PagePermission } from '../types/auth';
import { PageType } from '../types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => void;
  user?: User;
  availablePages: { id: PageType; label: string }[];
}

const UserForm: React.FC<UserFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  user,
  availablePages 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'user' as 'admin' | 'user',
    permissions: [] as PagePermission[]
  });

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      });
    } else if (isOpen && !user) {
      setFormData({
        email: '',
        name: '',
        role: 'user',
        permissions: []
      });
    }
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If admin, give full permissions
    const finalPermissions = formData.role === 'admin' 
      ? availablePages.map(page => ({
          page: page.id,
          canView: true,
          canEdit: true
        }))
      : formData.permissions;

    onSave({
      email: formData.email,
      name: formData.name,
      role: formData.role,
      permissions: finalPermissions
    });
  };

  const updatePermission = (pageId: string, field: 'canView' | 'canEdit', value: boolean) => {
    setFormData(prev => {
      const existingIndex = prev.permissions.findIndex(p => p.page === pageId);
      
      if (existingIndex >= 0) {
        const updatedPermissions = [...prev.permissions];
        updatedPermissions[existingIndex] = {
          ...updatedPermissions[existingIndex],
          [field]: value
        };
        
        // If removing view access, also remove edit access
        if (field === 'canView' && !value) {
          updatedPermissions[existingIndex].canEdit = false;
        }
        
        // If adding edit access, also add view access
        if (field === 'canEdit' && value) {
          updatedPermissions[existingIndex].canView = true;
        }
        
        return { ...prev, permissions: updatedPermissions };
      } else {
        // Create new permission
        const newPermission: PagePermission = {
          page: pageId,
          canView: field === 'canView' ? value : false,
          canEdit: field === 'canEdit' ? value : false
        };
        
        // If adding edit access, also add view access
        if (field === 'canEdit' && value) {
          newPermission.canView = true;
        }
        
        return { ...prev, permissions: [...prev.permissions, newPermission] };
      }
    });
  };

  const getPermission = (pageId: string): PagePermission => {
    return formData.permissions.find(p => p.page === pageId) || {
      page: pageId,
      canView: false,
      canEdit: false
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {user ? 'Editar Utilizador' : 'Novo Utilizador'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="user">Utilizador</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Administradores têm acesso total a todas as funcionalidades
            </p>
          </div>

          {/* Permissions (only for non-admin users) */}
          {formData.role !== 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Permissões por Página</label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Página
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Visualizar
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Editar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availablePages.map((page) => {
                      const permission = getPermission(page.id);
                      return (
                        <tr key={page.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{page.label}</span>
                            </div>
                          </td>
                          
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={permission.canView}
                              onChange={(e) => updatePermission(page.id, 'canView', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={permission.canEdit}
                              onChange={(e) => updatePermission(page.id, 'canEdit', e.target.checked)}
                              disabled={!permission.canView}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Para editar uma página, o utilizador deve ter permissão de visualização
              </p>
            </div>
          )}

          {formData.role === 'admin' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="text-sm font-medium text-red-900">Acesso de Administrador</h4>
                  <p className="text-sm text-red-700">
                    Este utilizador terá acesso total a todas as funcionalidades do sistema
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{user ? 'Atualizar' : 'Criar'} Utilizador</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;