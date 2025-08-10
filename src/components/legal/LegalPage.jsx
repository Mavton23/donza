import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

export default function LegalPage() {
  const { page } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get(`/legal/${page}`);
        setContent(response.data.content);
      } catch (err) {
        setContent(`Failed to load ${page}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [page]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
            {page === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
          </h1>
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}