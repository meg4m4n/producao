import React, { useState } from 'react';
import { Users as UsersIcon, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { User, PagePermission } from '../types/auth';
import { PageType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';
import UserForm from '../components/UserForm';

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const [userForm, setUserForm] = useState<{
    isOpen: boolean;
    user?: User;
  }>({ isOpen: false });

  // Available pages for permission management
  const availablePages: { id: PageType; label: string }[] = [
    { id: 'producoes', label: 'Produções' },
    { id: 'preparar-componentes', label: 'Preparar Componentes' },
    { id: 'gantt', label: 'Planeamento' },
    { id: 'registos', label: 'Registos' },
    { id: 'historico', label: 'Histórico' },
    { id: 'apps-lomartex', label: 'Apps Lomartex' },
    { id: 'controlo-qualidade', label: 'Controlo de Qualidade' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'envios', label: 'Envios' },
    { id: 'users', label: 'Utilizadores' }
  ];


  const handleCreateUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userData.password) {
      alert('Palavra-passe é obrigatória para novos utilizadores');
      return;
    }

    try {
      await createUser(userData);
      setUserForm({ isOpen: false });
    } catch (error) {
      console.error('Erro ao criar utilizador:', error);
      alert('Erro ao criar utilizador');
    }
  };

  const handleUpdateUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userForm.user) return;

    try {
      await updateUser(userForm.user.id, userData);
      setUserForm({ isOpen: false });
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      alert('Erro ao atualizar utilizador');
    }
  };

  const handleDeleteUser = async (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;

    if (userToDelete.id === currentUser?.id) {
      alert('Não pode eliminar a sua própria conta');
      return;
    }

    if (confirm(`Tem certeza que deseja eliminar o utilizador "${userToDelete.name}"?`)) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error('Erro ao eliminar utilizador:', error);
        alert('Erro ao eliminar utilizador');
      }
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getPermissionSummary = (permissions: PagePermission[]) => {
    const viewCount = permissions.filter(p => p.canView).length;
    const editCount = permissions.filter(p => p.canEdit).length;
    return `${viewCount} visualizar, ${editCount} editar`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando utilizadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Utilizadores</h1>
              <p className="text-gray-600">Controlo de acesso e permissões do sistema</p>
            </div>
          </div>
          <button 
            onClick={() => setUserForm({ isOpen: true })}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Utilizador</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <UsersIcon className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-700">{users.length}</div>
                <div className="text-sm text-blue-600">Total Utilizadores</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-sm text-red-600">Administradores</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <UsersIcon className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {users.filter(u => u.role === 'user').length}
                </div>
                <div className="text-sm text-green-600">Utilizadores</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lista de Utilizadores</h2>
          <p className="text-gray-600">Gerir utilizadores e as suas permissões</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilizador
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissões
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role === 'admin' ? 'Administrador' : 'Utilizador'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.role === 'admin' ? 'Acesso Total' : getPermissionSummary(user.permissions)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.permissions.length} página(s) configurada(s)
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleString('pt-PT')
                        : 'Nunca'
                      }
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setUserForm({ isOpen: true, user })}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar utilizador"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar utilizador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={userForm.isOpen}
        onClose={() => setUserForm({ isOpen: false })}
        onSave={userForm.user ? handleUpdateUser : handleCreateUser}
        user={userForm.user}
        availablePages={availablePages}
      />
    </div>
  );
};

export default Users;