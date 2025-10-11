import { Helmet } from 'react-helmet-async';

const SeoHead = ({ 
  title = "Donza - Plataforma Educacional Completa",
  description = "Aprenda, ensine e cresça com a Donza. Acesse cursos online, materiais educacionais e faça parte de uma comunidade de aprendizagem colaborativa.",
  keywords = "educação, cursos online, aprendizado, plataforma educacional, Donza, ensino"
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
};

export default SeoHead;