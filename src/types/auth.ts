export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // agora obrigatório
  role: 'admin' | 'user';
  permissions: PagePermission[];
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface PagePermission {
  page: string;
  canView: boolean;
  canEdit: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Novo para tabela profiles
export interface Profile {
  id: string;
  role?: string;
  password: string;
  created_at?: string;
}
