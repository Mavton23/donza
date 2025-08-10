import api from './api';

export const fetchHelpData = async () => {
  const [articles, topics, categories] = await Promise.all([
    api.get('/help/articles'),
    api.get('/help/popular-topics'),
    api.get('/help/categories')
  ]);
  return {
    articles: articles.data,
    popularTopics: topics.data,
    categories: categories.data
  };
};

export const searchArticles = async (query) => {
  const response = await api.get(`/help/search?query=${encodeURIComponent(query)}`);
  return response.data;
};

export const fetchArticle = async (slug) => {
  const response = await api.get(`/help/articles/${slug}`);
  return response.data;
};

export const submitFeedback = async (articleId, wasHelpful, comment) => {
  await api.post('/help/feedback', {
    articleId,
    wasHelpful,
    comment
  });
};

export const submitContactRequest = async (data) => {
  await api.post('/help/contact', data);
};