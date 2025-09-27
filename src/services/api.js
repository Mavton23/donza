import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_BASE_URL || "http://localhost:5000/api",
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variáveis para controle do refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.url.includes('/upload-documents')) {
    config.headers['Content-Type'] = 'multipart/form-data';
    config.timeout = 300000;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para tratamento global de erros e refresh token
api.interceptors.response.use(
  (response) => {
    // Verifica se há um novo token no header da resposta
    const newToken = response.headers['new-access-token'] || response.headers['New-Access-Token'];
    if (newToken) {
      localStorage.setItem("token", newToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se for erro 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Se já está fazendo refresh, adiciona à fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Faz o refresh do token
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_API_BASE_URL || "http://localhost:5000/api"}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
            skipAuthRefresh: true // Flag para evitar loop infinito
          }
        );

        const { accessToken } = response.data.data;
        
        // Atualiza os tokens
        localStorage.setItem("token", accessToken);
        
        // Atualiza o header da requisição original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Processa a fila de requisições pendentes
        processQueue(null, accessToken);
        
        // Retorna a requisição original com o novo token
        return api(originalRequest);
        
      } catch (refreshError) {
        // Em caso de erro no refresh, limpa tudo e redireciona para login
        processQueue(refreshError, null);
        
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        
        // Redireciona para login apenas se não for uma página pública
        if (!window.location.pathname.includes('/signin') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = "/signin";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Tratamento de outros erros
    if (error.response) {
      const { status, data } = error.response;

      // Padronização de erros da API
      const apiError = {
        message: data?.message || data?.error?.message || "An error occurred",
        status,
        code: data?.error?.code || `HTTP_${status}`,
        errors: data?.errors,
        data: data
      };

      // Para outros erros 401 (não relacionados ao token)
      if (status === 401 && originalRequest._retry) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        if (!window.location.pathname.includes('/signin')) {
          window.location.href = "/signin";
        }
      }

      return Promise.reject(apiError);
    } else if (error.request) {
      return Promise.reject({
        message: "No response received from server",
        code: "NETWORK_ERROR"
      });
    } else {
      return Promise.reject({
        message: error.message,
        code: "REQUEST_ERROR"
      });
    }
  }
);

const ApiService = {
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
  patch: api.patch,

  // Autenticação - ATUALIZADO para incluir refresh token
  registerInit: (data) => api.post("/auth/register/init", data),
  registerComplete: (data) => api.post("/auth/register/complete", data),
  completeProfile: (data) => api.post("/auth/complete-profile", data),
  verifyTempToken: (token) => api.get(`/auth/register/verify-token/${token}`),
  resendVerification: (email) => api.post("/auth/resend-verification", { email }),
  verifyEmail: (token) => api.get("/auth/verify-email", { params: { token } }),
  login: (credentials) => api.post("/auth/login", credentials),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  logout: () => {
    const refreshToken = localStorage.getItem("refreshToken");
    return api.post("/auth/logout", { refreshToken })
      .finally(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      });
  },
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  getCurrentUser: () => api.get("/users/me"),

  // Método para verificar se o usuário está autenticado
  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      await api.get("/auth/verify");
      return true;
    } catch (error) {
      return false;
    }
  },

  // Comunidades
  getCommunities: (params) => api.get("/community/communities", { params }),
  getCommunity: (id) => api.get(`/community/communities/${id}`),
  createCommunity: (data) => api.post("/community/communities", data),
  updateCommunity: (id, data) => api.patch(`/community/communities/${id}`, data),
  joinCommunity: (id) => api.post(`/community/communities/${id}/join`),
  leaveCommunity: (id) => api.post(`/community/communities/${id}/leave`),

  // Grupos de Estudo
  getStudyGroups: (communityId) => api.get(`/community/communities/${communityId}/study-groups`),
  createStudyGroup: (communityId, data) => api.post(`/community/communities/${communityId}/study-groups`, data),
  scheduleMeeting: (groupId, data) => api.post(`/community/study-groups/${groupId}/meetings`, data),

  // Dashboard e outros métodos personalizados
  getDashboardData: () => api.get('/dashboard'),

  // Upload de arquivos
  uploadFile: (file, progressCallback) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressCallback) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          progressCallback(percentCompleted);
        }
      },
    });
  },

  // Upload de documentos para registro
  uploadDocument: (file, documentType, role) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('role', role);

    return api.post('/auth/register/upload-documents', formData);
  },

  // Validação de NUIT (para instituições)
  validateNUIT: (nuit) => api.get(`/auth/validate-nuit/${nuit}`),

  // Completa registro com documentos
  registerCompleteWithDocuments: (data) => {
    const formData = new FormData();
    
    // Adiciona todos os campos do formulário
    Object.keys(data).forEach(key => {
      if (key === 'documents') {
        // Adiciona cada documento separadamente
        data[key].forEach((file, index) => {
          formData.append(`documents[${index}]`, file);
        });
      } else {
        formData.append(key, data[key]);
      }
    });

    return api.post('/auth/register/complete-with-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default ApiService;