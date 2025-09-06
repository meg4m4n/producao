import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials } from '../types/auth';
import { PageType } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  hasPageAccess: (page: PageType) => boolean;
  canEditPage: (page: PageType) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'rmegaguimaraes@gmail.com',
    name: 'Rui Guimarães',
    role: 'admin',
    permissions: [
      { page: 'producoes', canView: true, canEdit: true },
      { page: 'preparar-componentes', canView: true, canEdit: true },
      { page: 'gantt', canView: true, canEdit: true },
      { page: 'registos', canView: true, canEdit: true },
      { page: 'historico', canView: true, canEdit: true },
      { page: 'apps-lomartex', canView: true, canEdit: true },
      { page: 'controlo-qualidade', canView: true, canEdit: true },
      { page: 'financeiro', canView: true, canEdit: true },
      { page: 'users', canView: true, canEdit: true }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false
        });
      } catch (error) {
        localStorage.removeItem('auth_user');
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Mock authentication
      const user = mockUsers.find(u => u.email === credentials.email);
      
      if (user && credentials.password === 'mega$3311225') {
        const updatedUser = {
          ...user,
          last_login: new Date().toISOString()
        };
        
        setAuthState({
          user: updatedUser,
          isAuthenticated: true,
          loading: false
        });
        
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false
    });
    localStorage.removeItem('auth_user');
  };

  const hasPageAccess = (page: PageType): boolean => {
    if (!authState.user) return false;
    if (authState.user.role === 'admin') return true;
    
    const permission = authState.user.permissions.find(p => p.page === page);
    return permission?.canView || false;
  };

  const canEditPage = (page: PageType): boolean => {
    if (!authState.user) return false;
    if (authState.user.role === 'admin') return true;
    
    const permission = authState.user.permissions.find(p => p.page === page);
    return permission?.canEdit || false;
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      hasPageAccess,
      canEditPage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};