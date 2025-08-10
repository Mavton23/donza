import { useState, useEffect } from 'react';
import api from '../services/api';

export const useGroupContent = (groupId, initialContents = []) => {
  const [contents, setContents] = useState(initialContents);
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccured, setErrorOccured] = useState(null);

  const fetchContents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/content/groups/${groupId}/contents`);
      setContents(response.data.data);
      setErrorOccured(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao carregar conteúdos');
      console.error('Erro ao buscar conteúdos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      
      const response = await api.post(
        `/content/groups/${groupId}/contents`,
        formData,
      );
      
      setContents(prev => [response.data.data, ...prev]);
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Falha no upload do arquivo';
      setErrorOccured(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const addLink = async (url) => {
    setIsLoading(true);
    try {
      const response = await api.post(`/content/groups/${groupId}/links`, {
        title: 'Link compartilhado',
        url
      });
      
      setContents(prev => [response.data.data, ...prev]);
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Falha ao compartilhar link';
      setErrorOccured(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = async (contentId, updatedData) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/content/contents/${contentId}`, updatedData);
      
      setContents(prev => prev.map(content => 
        content.contentId === contentId ? response.data.data : content
      ));
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Falha ao atualizar conteúdo';
      setErrorOccured(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContent = async (contentId) => {
    setIsLoading(true);
    try {
      await api.delete(`/content/contents/${contentId}`);
      setContents(prev => prev.filter(content => content.contentId !== contentId));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Falha ao deletar conteúdo';
      setErrorOccured(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const registerDownload = async (contentId) => {
    try {
      await api.post(`/content/contents/${contentId}/download`);
      return { success: true };
    } catch (err) {
      console.error('Erro ao registrar download:', err);
      return { success: false };
    }
  };

  useEffect(() => {
    fetchContents();
  }, [groupId]);

  return {
    contents,
    isLoading,
    errorOccured,
    uploadFile,
    addLink,
    updateContent,
    deleteContent,
    registerDownload,
    refresh: fetchContents
  };
};