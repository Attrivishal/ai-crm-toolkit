import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../lib/api';
import type { User } from '../lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  socialLogin: (provider: 'google' | 'github') => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token in URL (OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error) {
      // Handle OAuth error
      if (error === 'google_auth_failed') {
        toast.error('Google login failed. Please try again.');
      } else if (error === 'github_auth_failed') {
        toast.error('GitHub login failed. Please try again.');
      } else {
        toast.error('Authentication failed. Please try again.');
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (token) {
      // Store tokens from OAuth
      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Fetch user data
      fetchUserWithToken(token);
    } else {
      // Normal auth check
      checkAuth();
    }
  }, [navigate]);

  const fetchUserWithToken = async (token: string) => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching user with token...');
      const { data } = await authApi.getMe();
      console.log('🔍 User data:', data);
      setUser(data.user);
      toast.success('Successfully logged in!');
      
      // Redirect to dashboard
      const redirectPath = '/dashboard';
      console.log('🔍 Redirecting to:', redirectPath);
      
      // Force redirect with window.location
      window.location.href = redirectPath;
    } catch (error) {
      console.error('Failed to fetch user after OAuth:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.error('Failed to complete login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await authApi.getMe();
      setUser(data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const signup = async (data: any) => {
    try {
      const response = await authApi.register(data);
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser(response.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const socialLogin = (provider: 'google' | 'github') => {
    // Store the current path to return after OAuth
    localStorage.setItem('oauth_redirect', window.location.pathname);
    
    // Show loading toast
    toast.loading(`Redirecting to ${provider}...`, { 
      id: 'oauth-loading',
      duration: 5000 
    });
    
    // Redirect to backend OAuth endpoint
    window.location.href = `http://localhost:5001/api/auth/${provider}`;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout();
      }
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('oauth_redirect');
      setUser(null);
      navigate('/login');
    }
  };

  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('oauth_redirect');
      setUser(null);
      toast.success('Logged out from all devices');
      navigate('/login');
    } catch (error) {
      const message = 'Failed to logout from all devices';
      toast.error(message);
      throw error;
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const { data: response } = await authApi.updateProfile(data);
      setUser(response.user);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      throw error;
    }
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        logoutAll,
        updateUser,
        socialLogin,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
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