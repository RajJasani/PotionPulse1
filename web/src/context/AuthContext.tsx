import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@shared/api-client';
import { User, UserLogin, UserRegister, DemoUser } from '@shared/api.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openLogin: () => void;
  openSignup: () => void;
  closeAuthModal: () => void;
  login: (data: UserLogin) => Promise<void>;
  register: (data: UserRegister) => Promise<void>;
  logout: () => void;
  demoUsers: DemoUser[];
  loginAsDemo: (demo: DemoUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('potion_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  // Fetch demo accounts for 1-click testing
  useEffect(() => {
    api.getDemoUsers()
      .then((users) => setDemoUsers(users))
      .catch((err) => console.warn('Could not load demo alchemists:', err.message));
  }, []);

  // Validate session on mount
  useEffect(() => {
    const currentToken = api.getToken();
    if (currentToken && !user) {
      setIsLoading(true);
      api.getMe()
        .then((u) => {
          setUser(u);
          localStorage.setItem('potion_auth_user', JSON.stringify(u));
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  const openLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (data: UserLogin) => {
    setIsLoading(true);
    try {
      const res = await api.login(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('potion_auth_user', JSON.stringify(res.user));
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: UserRegister) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('potion_auth_user', JSON.stringify(res.user));
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('potion_auth_user');
  };

  const loginAsDemo = async (demo: DemoUser) => {
    await login({
      email: demo.email,
      password: demo.password,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openLogin,
        openSignup,
        closeAuthModal,
        login,
        register,
        logout,
        demoUsers,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
