import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    user: null,
    loading: true,
    error: null
  });
  const navigate = useNavigate();

  // Carrega usuário do localStorage
  const loadUserFromStorage = useCallback(() => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }, []);

  // Atualiza usuário no estado e localStorage
  const updateUser = useCallback((userData) => {
    const updatedUser = { ...authState.user, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
    return updatedUser;
  }, [authState.user]);

  // Verificar autenticação ao inicializar
  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      const user = loadUserFromStorage();
      
      if (!token || !user) {
        setAuthState(prev => ({ ...prev, isAuthenticated: false, loading: false }));
        return false;
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setAuthState({ 
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });
      return true;
    } catch (error) {
      console.error("Auth validation error:", error);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        loading: false,
        error: "Failed to validate session"
      }));
      return false;
    }
  }, [loadUserFromStorage]);

  const hasRole = useCallback((role) => {
    if (!authState.user || !authState.user.role) return false;
    
    // Se for array, verifica se tem algum dos roles
    if (Array.isArray(role)) {
      return role.includes(authState.user.role);
    }
    
    // Se for string, verifica se é exatamente o role
    return authState.user.role === role;
  }, [authState.user]);

  const completeProfile = async (profileData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const response = await api.completeProfile(profileData);
      const updatedUser = updateUser({
        ...response.data.user,
        profileCompleted: true,
      });
      
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.errors?.join(', ') || 
                         "Failed to complete profile";
      toast.error(errorMessage);
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  // Atualizar perfil
  const updateProfile = async (profileData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const response = await axios.put("/api/auth/complete-profile", profileData);
      const updatedUser = updateUser(response.data.user);
      
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         "Failed to update profile";
      toast.error(errorMessage);
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  // Efeito para verificar autenticação ao montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login tradicional
  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await api.login(credentials);

      const { data } = response;
      
      if (!data.success) {
        throw new Error(data.message || "Ocorreu um erro durante o login...");
      }

      const { user, accessToken, refreshToken } = data.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      });

      return user;
      
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     error.message || 
                     "Falha no login";
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      throw error;
    }
  };

  // Logout
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.logout({ refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
      
      navigate("/signin");
    }
  }, [navigate]);

  return (
    <AuthContext.Provider
    value={{
      ...authState,
      currentUser: authState.user,
      login,
      logout,
      checkAuth,
      completeProfile,
      updateProfile,
      updateUser,
      hasRole
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.log("useAuth must be used within an AuthProvider");
  }
  return context;
};