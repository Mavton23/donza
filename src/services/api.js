import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_BASE_URL || "https://donza-api.onrender.com/api",
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
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

      if (status === 401) {
        // Ações específicas para 401 podem ser tratadas na camada de UI
        localStorage.removeItem("token");
        window.location.href = "/login";
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

  // Autenticação
  registerInit: (data) => api.post("/auth/register/init", data),
  registerComplete: (data) => api.post("/auth/register/complete", data),
  completeProfile: (data) => api.post("/auth/complete-profile", data),
  verifyTempToken: (token) => api.get(`/auth/register/verify-token/${token}`),
  resendVerification: (email) => api.post("/auth/resend-verification", { email }),
  verifyEmail: (token) => api.get("/auth/verify-email", { params: { token } }),
  login: (credentials) => api.post("/auth/login", credentials),
  forgotPassword: (data) => axios.post('/api/auth/forgot-password', data),
  resetPassword: (token, data) => axios.post(`/api/auth/reset-password/${token}`, data),
  logout: () => api.post("/auth/logout", { refreshToken }),
  refreshToken: () => api.post("/auth/refresh"),
  getCurrentUser: () => api.get("/users/me"),

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
