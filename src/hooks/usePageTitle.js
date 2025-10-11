import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTitle = (customSeo = {}) => {
  const location = useLocation();

  useEffect(() => {
    const pageSeoData = {
      // Rotas públicas
      '/': {
        title: 'Donza - Plataforma Educacional Completa',
        description: 'Aprenda, ensine e cresça com a Donza. Acesse cursos online, materiais educacionais e faça parte de uma comunidade de aprendizagem colaborativa.',
        keywords: 'educação, cursos online, aprendizado, plataforma educacional, Donza, ensino, comunidade educacional'
      },
      '/signin': {
        title: 'Login - Donza',
        description: 'Faça login na sua conta Donza e acesse todos os recursos da plataforma educacional. Retome seus cursos e conecte-se com a comunidade.',
        keywords: 'login, entrar, conta Donza, acesso, autenticação, plataforma educacional'
      },
      '/signup': {
        title: 'Cadastro - Donza',
        description: 'Cadastre-se na Donza e comece sua jornada educacional. Acesso a cursos, comunidades de aprendizado e recursos exclusivos.',
        keywords: 'cadastro, registrar, nova conta, inscrição, plataforma educação, cursos online'
      },
      '/signup/admin': {
        title: 'Cadastro Administrador - Donza',
        description: 'Crie uma conta de administrador para gerenciar a plataforma Donza. Controle completo sobre usuários, cursos e instituições.',
        keywords: 'admin, administrador, gestão plataforma, superusuário, moderador'
      },
      '/forgot-password': {
        title: 'Recuperar Senha - Donza',
        description: 'Recupere o acesso à sua conta Donza. Siga os passos para redefinir sua senha e retomar seus estudos.',
        keywords: 'recuperar senha, redefinir senha, acesso, conta, autenticação'
      },
      '/reset-password': {
        title: 'Redefinir Senha - Donza',
        description: 'Redefina sua senha da conta Donza e retome o acesso à plataforma educacional e todos os seus cursos.',
        keywords: 'redefinir senha, nova senha, segurança, acesso, conta'
      },
      '/terms': {
        title: 'Termos de Uso - Donza',
        description: 'Termos e condições de uso da plataforma Donza. Conheça os direitos, responsabilidades e diretrizes da nossa comunidade educacional.',
        keywords: 'termos de uso, condições, diretrizes, regras, contrato'
      },
      '/privacy': {
        title: 'Política de Privacidade - Donza',
        description: 'Política de privacidade e proteção de dados da Donza. Saiba como protegemos suas informações e garantimos sua segurança.',
        keywords: 'privacidade, proteção de dados, segurança, LGPD, informações pessoais'
      },
      '/help': {
        title: 'Central de Ajuda - Donza',
        description: 'Encontre respostas para suas dúvidas, tutoriais e suporte completo para aproveitar ao máximo a plataforma Donza.',
        keywords: 'ajuda, suporte, FAQ, tutoriais, dúvidas, suporte técnico'
      },
      '/about': {
        title: 'Sobre Nós - Donza',
        description: 'Conheça a Donza, nossa missão, visão e valores. Saiba como estamos transformando a educação através da tecnologia.',
        keywords: 'sobre, missão, valores, empresa, história, educação tecnologia'
      },
      '/contact': {
        title: 'Contato - Donza',
        description: 'Entre em contato com a equipe Donza. Tire dúvidas, dê sugestões ou solicite suporte para sua instituição educacional.',
        keywords: 'contato, suporte, atendimento, dúvidas, sugestões, ajuda'
      },

      // Rotas protegidas - Comuns
      '/search': {
        title: 'Buscar - Donza',
        description: 'Encontre cursos, instrutores, comunidades e recursos educacionais na plataforma Donza. Busca avançada por categorias e filtros.',
        keywords: 'buscar, pesquisa, encontrar cursos, filtros, busca avançada'
      },
      '/profile': {
        title: 'Meu Perfil - Donza',
        description: 'Gerencie seu perfil na Donza. Atualize informações pessoais, acompanhe conquistas e compartilhe sua jornada educacional.',
        keywords: 'perfil, conta, informações pessoais, conquistas, portfolio educacional'
      },
      '/profile/:username': {
        title: 'Perfil - Donza',
        description: 'Visualize o perfil de usuários na plataforma Donza. Conheça outros aprendizes, instrutores e suas contribuições educacionais.',
        keywords: 'perfil usuário, biografia, atividades, contribuições, network'
      },
      '/complete-profile': {
        title: 'Completar Perfil - Donza',
        description: 'Complete seu cadastro na Donza para desbloquear todos os recursos da plataforma e personalizar sua experiência educacional.',
        keywords: 'completar cadastro, informações adicionais, preferências, personalização'
      },

      // Rotas de estudantes
      '/courses': {
        title: 'Catálogo de Cursos - Donza',
        description: 'Explore nossa vasta biblioteca de cursos online. Encontre o curso ideal para seu desenvolvimento profissional e pessoal na Donza.',
        keywords: 'cursos, catálogo, aprendizado, educação online, capacitação, desenvolvimento profissional'
      },
      '/learning/courses': {
        title: 'Meus Cursos - Donza',
        description: 'Acesse e gerencie todos os cursos em que você está matriculado. Continue de onde parou e acompanhe seu progresso de aprendizado.',
        keywords: 'meus cursos, progresso, aprendizado, matriculas, cursos ativos, continuar estudos'
      },
      '/learn/:slug': {
        title: 'Área de Aprendizado - Donza',
        description: 'Ambiente de aprendizado imersivo da Donza. Acesse aulas, materiais e atividades para avançar em seu desenvolvimento educacional.',
        keywords: 'aprendizado, aulas, materiais, atividades, progresso, educação online'
      },
      '/learning/certificates': {
        title: 'Meus Certificados - Donza',
        description: 'Visualize e gerencie todos os seus certificados conquistados na plataforma Donza. Comprove suas habilidades e conhecimentos.',
        keywords: 'certificados, conquistas, diplomas, comprovação, habilidades, certificação'
      },
      '/learning/progress': {
        title: 'Meu Progresso - Donza',
        description: 'Acompanhe seu progresso educacional detalhado. Métricas, estatísticas e insights sobre sua jornada de aprendizado na Donza.',
        keywords: 'progresso, desempenho, métricas, estatísticas, evolução, aprendizado'
      },

      // Eventos
      '/events': {
        title: 'Eventos - Donza',
        description: 'Participe de eventos educacionais, webinars, workshops e encontros da comunidade Donza. Amplie seu conhecimento e network.',
        keywords: 'eventos, webinars, workshops, encontros, networking, aprendizado ao vivo'
      },
      '/events/create': {
        title: 'Criar Evento - Donza',
        description: 'Crie e organize eventos educacionais na plataforma Donza. Compartilhe conhecimento e conecte-se com a comunidade de aprendizes.',
        keywords: 'criar evento, organizar, webinar, workshop, evento educacional'
      },
      '/events/:eventId': {
        title: 'Detalhes do Evento - Donza',
        description: 'Detalhes completos do evento educacional. Informações, participantes, agenda e recursos disponíveis na plataforma Donza.',
        keywords: 'detalhes evento, informações, participantes, agenda, recursos'
      },
      '/events/:eventId/edit': {
        title: 'Editar Evento - Donza',
        description: 'Edite e atualize as informações do seu evento educacional na plataforma Donza. Gerencie participantes e recursos.',
        keywords: 'editar evento, atualizar, gerenciar, modificar evento'
      },

      // Rotas de instrutores
      '/instructor/courses': {
        title: 'Gerenciar Cursos - Donza',
        description: 'Painel do instrutor para gerenciar cursos, acompanhar desempenho dos alunos e otimizar conteúdo educacional na plataforma Donza.',
        keywords: 'instrutor, gerenciar cursos, painel professor, conteúdo educacional, ensino online'
      },
      '/instructor/courses/create': {
        title: 'Criar Curso - Donza',
        description: 'Crie cursos incríveis na plataforma Donza. Ferramentas completas para desenvolvimento de conteúdo educacional de alta qualidade.',
        keywords: 'criar curso, conteúdo educacional, criação de aulas, material didático, ensino online'
      },
      '/instructor/courses/:courseId/edit': {
        title: 'Editar Curso - Donza',
        description: 'Edite e atualize seu curso na plataforma Donza. Modifique conteúdo, estrutura e configurações para melhor experiência de aprendizado.',
        keywords: 'editar curso, atualizar conteúdo, modificar aulas, melhorar curso'
      },
      '/courses/:slug': {
        title: 'Detalhes do Curso - Donza',
        description: 'Conheça todos os detalhes deste curso na plataforma Donza. Conteúdo, instrutor, avaliações e informações para sua decisão.',
        keywords: 'detalhes curso, informações, conteúdo, avaliações, instrutor'
      },
      '/courses/:courseId/reviews': {
        title: 'Avaliações do Curso - Donza',
        description: 'Avaliações e feedback dos estudantes sobre este curso. Opiniões genuínas para ajudar na sua escolha educacional.',
        keywords: 'avaliações, reviews, feedback, opiniões, classificações'
      },
      '/institution/:courseId/reviews': {
        title: 'Avaliações Institucionais - Donza',
        description: 'Painel de avaliações e feedback para instituições de ensino. Acompanhe o desempenho e satisfação dos estudantes.',
        keywords: 'avaliações institucionais, feedback instituição, desempenho cursos, satisfação estudantes'
      },
      '/courses/:courseId/assignments/new': {
        title: 'Criar Atividade - Donza',
        description: 'Crie novas atividades e exercícios para seus cursos na plataforma Donza. Desenvolva avaliações práticas e teóricas.',
        keywords: 'criar atividade, exercícios, avaliações, tarefas, assignments'
      },
      '/instructor/lessons': {
        title: 'Gerenciar Aulas - Donza',
        description: 'Gerencie todas as suas aulas e conteúdos educacionais. Organize, edite e otimize o material de ensino na plataforma Donza.',
        keywords: 'gerenciar aulas, conteúdo educacional, organizar material, aulas online'
      },
      '/lessons': {
        title: 'Minhas Aulas - Donza',
        description: 'Acesse todas as aulas dos seus cursos matriculados. Conteúdo organizado e progresso individualizado na plataforma Donza.',
        keywords: 'minhas aulas, conteúdo cursos, progresso aulas, aprendizado sequencial'
      },
      '/lessons/:lessonId': {
        title: 'Detalhes da Aula - Donza',
        description: 'Acesse o conteúdo completo desta aula na plataforma Donza. Materiais, exercícios e recursos adicionais para seu aprendizado.',
        keywords: 'detalhes aula, conteúdo completo, materiais, exercícios, recursos'
      },
      '/instructor/lessons/new': {
        title: 'Criar Aula - Donza',
        description: 'Crie novas aulas e conteúdos educacionais na plataforma Donza. Desenvolva material didático engajador e eficaz.',
        keywords: 'criar aula, conteúdo educacional, material didático, desenvolvimento aulas'
      },
      '/instructor/lessons/:lessonId/edit': {
        title: 'Editar Aula - Donza',
        description: 'Edite e melhore suas aulas na plataforma Donza. Atualize conteúdo, adicione recursos e otimize a experiência de aprendizado.',
        keywords: 'editar aula, atualizar conteúdo, melhorar aula, otimizar ensino'
      },
      '/instructor/assignments': {
        title: 'Gerenciar Atividades - Donza',
        description: 'Gerencie todas as atividades e exercícios dos seus cursos. Acompanhe entregas, correções e feedback dos estudantes.',
        keywords: 'gerenciar atividades, exercícios, correções, feedback, acompanhamento'
      },
      '/instructor/assignments/new': {
        title: 'Criar Atividade - Donza',
        description: 'Crie novas atividades avaliativas para seus cursos na plataforma Donza. Desenvolva exercícios práticos e teóricos.',
        keywords: 'criar atividade, exercícios avaliativos, tarefas, assignments, avaliação'
      },
      '/instructor/earnings': {
        title: 'Meus Ganhos - Donza',
        description: 'Acompanhe seus ganhos como instrutor na plataforma Donza. Relatórios detalhados, histórico de pagamentos e métricas financeiras.',
        keywords: 'ganhos, rendimentos, pagamentos, relatórios financeiros, métricas instrutor'
      },
      '/analytics': {
        title: 'Analytics - Donza',
        description: 'Painel analítico completo para instrutores. Métricas de engajamento, desempenho dos estudantes e insights sobre seus cursos.',
        keywords: 'analytics, métricas, desempenho, engajamento, insights, relatórios'
      },

      // Rotas de instituição
      '/institution': {
        title: 'Painel da Instituição - Donza',
        description: 'Painel de gerenciamento para instituições de ensino. Controle cursos, instrutores e analytics educacionais na Donza.',
        keywords: 'instituição, gestão educacional, analytics, relatórios, administração institucional'
      },
      '/institution/dashboard': {
        title: 'Dashboard Institucional - Donza',
        description: 'Visão geral do desempenho institucional na plataforma Donza. Métricas, cursos ativos e progresso educacional consolidado.',
        keywords: 'dashboard institucional, visão geral, métricas consolidadas, desempenho global'
      },
      '/institution/courses': {
        title: 'Cursos da Instituição - Donza',
        description: 'Gerencie todos os cursos oferecidos pela sua instituição na plataforma Donza. Controle, edite e acompanhe o desempenho.',
        keywords: 'cursos instituição, gestão cursos, desempenho institucional, oferta educacional'
      },
      '/institution/instructors': {
        title: 'Instrutores da Instituição - Donza',
        description: 'Gerencie o corpo docente da sua instituição na plataforma Donza. Acompanhe desempenho e alocação em cursos.',
        keywords: 'instrutores instituição, corpo docente, gestão professores, desempenho instrutores'
      },
      '/institution/analytics': {
        title: 'Analytics Institucional - Donza',
        description: 'Analytics completo para instituições de ensino. Métricas educacionais, desempenho global e insights estratégicos.',
        keywords: 'analytics institucional, métricas educacionais, desempenho global, insights estratégicos'
      },
      '/institution/certificates': {
        title: 'Certificados Institucionais - Donza',
        description: 'Gerencie certificados e diplomas emitidos pela sua instituição na plataforma Donza. Controle e personalização de certificações.',
        keywords: 'certificados institucionais, diplomas, emissão certificados, certificações'
      },
      '/institution/billing': {
        title: 'Faturamento Institucional - Donza',
        description: 'Gestão financeira e faturamento da sua instituição na plataforma Donza. Relatórios, pagamentos e controle financeiro.',
        keywords: 'faturamento institucional, gestão financeira, relatórios financeiros, controle pagamentos'
      },
      '/institution/settings': {
        title: 'Configurações Institucionais - Donza',
        description: 'Configure as preferências e políticas da sua instituição na plataforma Donza. Personalize a experiência educacional institucional.',
        keywords: 'configurações institucionais, preferências, políticas, personalização institucional'
      },

      // Pagamento
      '/payment-confirmation': {
        title: 'Confirmação de Pagamento - Donza',
        description: 'Confirmação e detalhes do seu pagamento na plataforma Donza. Acesso liberado aos cursos e recursos adquiridos.',
        keywords: 'confirmação pagamento, detalhes pagamento, compra confirmada, acesso liberado'
      },

      // Admin
      '/admin': {
        title: 'Painel Administrativo - Donza',
        description: 'Painel de administração da plataforma Donza. Gerencie usuários, cursos, instituições e todo o ecossistema educacional.',
        keywords: 'admin, administração, gerenciamento plataforma, moderação, supervisão'
      },
      '/admin/verifications': {
        title: 'Verificações - Donza',
        description: 'Painel de verificação e aprovação de conteúdo na plataforma Donza. Moderação de cursos, instrutores e instituições.',
        keywords: 'verificações, aprovação conteúdo, moderação, validação, controle qualidade'
      },
      '/admin/verifications/:id': {
        title: 'Detalhes da Verificação - Donza',
        description: 'Detalhes completos do processo de verificação na plataforma Donza. Análise e decisão sobre conteúdo e usuários.',
        keywords: 'detalhes verificação, análise conteúdo, processo aprovação, moderação detalhada'
      },

      // Dashboard geral
      '/dashboard': {
        title: 'Dashboard - Donza',
        description: 'Acompanhe seu progresso educacional, cursos em andamento, atividades recentes e recomendações personalizadas na sua dashboard Donza.',
        keywords: 'dashboard, progresso, atividades, cursos, acompanhamento, desempenho educacional'
      },

      // Módulos de conteúdo
      '/courses/:slug/modules/:moduleId': {
        title: 'Conteúdo do Módulo - Donza',
        description: 'Acesse o conteúdo completo deste módulo do curso na plataforma Donza. Aulas, materiais e atividades organizadas sequencialmente.',
        keywords: 'conteúdo módulo, aulas sequenciais, materiais, atividades, progresso módulo'
      },

      // Mensagens e notificações
      '/messages': {
        title: 'Mensagens - Donza',
        description: 'Comunique-se com instrutores, colegas e a comunidade educacional através do sistema de mensagens da Donza.',
        keywords: 'mensagens, comunicação, chat, comunidade, networking educacional'
      },
      '/messages/new': {
        title: 'Nova Conversa - Donza',
        description: 'Inicie uma nova conversa na plataforma Donza. Conecte-se com outros usuários para colaboração e aprendizado conjunto.',
        keywords: 'nova conversa, iniciar chat, conectar usuários, colaboração'
      },
      '/messages/:conversationId': {
        title: 'Conversa - Donza',
        description: 'Continue sua conversa na plataforma Donza. Troque mensagens, arquivos e recursos educacionais com outros usuários.',
        keywords: 'conversa, mensagens, troca arquivos, comunicação contínua'
      },
      '/notifications': {
        title: 'Notificações - Donza',
        description: 'Acompanhe todas as suas notificações importantes. Atividades, atualizações de cursos e interações na comunidade Donza.',
        keywords: 'notificações, alertas, atualizações, atividades, interações'
      },

      // Comunidades
      '/communities': {
        title: 'Comunidades - Donza',
        description: 'Junte-se a comunidades de aprendizado, grupos de estudo e discuta temas de interesse com outros aprendizes na plataforma Donza.',
        keywords: 'comunidades, grupos de estudo, fóruns, discussões, aprendizado colaborativo'
      },
      '/communities/new': {
        title: 'Criar Comunidade - Donza',
        description: 'Crie uma nova comunidade de aprendizado na plataforma Donza. Conecte pessoas com interesses educacionais em comum.',
        keywords: 'criar comunidade, nova comunidade, aprendizado colaborativo, grupo estudo'
      },
      '/communities/:communityId': {
        title: 'Comunidade - Donza',
        description: 'Participe desta comunidade de aprendizado na Donza. Discussões, recursos compartilhados e colaboração educacional.',
        keywords: 'comunidade, discussões, recursos compartilhados, colaboração, interação'
      },
      '/communities/:communityId/groups/:groupId/join': {
        title: 'Participar do Grupo - Donza',
        description: 'Junte-se a este grupo de estudo na comunidade Donza. Colaboração, reuniões e aprendizado em grupo.',
        keywords: 'participar grupo, juntar-se, grupo estudo, colaboração, reuniões'
      },
      '/communities/:communityId/groups/:groupId': {
        title: 'Grupo de Estudo - Donza',
        description: 'Acesse este grupo de estudo na plataforma Donza. Recursos, discussões e atividades de aprendizado colaborativo.',
        keywords: 'grupo estudo, aprendizado colaborativo, recursos grupo, atividades conjuntas'
      },
      '/communities/:communityId/groups/:groupId/edit': {
        title: 'Editar Grupo - Donza',
        description: 'Edite as configurações e informações deste grupo de estudo na plataforma Donza. Gerencie membros e recursos.',
        keywords: 'editar grupo, configurações grupo, gerenciar membros, recursos grupo'
      },
      '/communities/:communityId/groups/:groupId/meetings': {
        title: 'Reuniões do Grupo - Donza',
        description: 'Agende e gerencie reuniões do grupo de estudo na plataforma Donza. Encontros síncronos para aprendizado colaborativo.',
        keywords: 'reuniões grupo, encontros síncronos, agendamento, aprendizado ao vivo'
      },
      '/communities/:communityId/groups/:groupId/manage-members': {
        title: 'Gerenciar Membros - Donza',
        description: 'Gerencie os membros deste grupo de estudo na plataforma Donza. Controle de acesso, permissões e participação.',
        keywords: 'gerenciar membros, controle acesso, permissões, administração grupo'
      },
      '/communities/:communityId/create-post': {
        title: 'Criar Post - Donza',
        description: 'Compartilhe conhecimento e inicie discussões criando um post na comunidade Donza. Conteúdo educacional e colaborativo.',
        keywords: 'criar post, compartilhar conhecimento, iniciar discussão, conteúdo comunidade'
      },
      '/communities/:communityId/posts/:postId': {
        title: 'Post da Comunidade - Donza',
        description: 'Participe da discussão neste post da comunidade Donza. Comentários, interações e aprendizado coletivo.',
        keywords: 'post comunidade, discussão, comentários, interações, aprendizado coletivo'
      },
      '/communities/:communityId/create-group': {
        title: 'Criar Grupo - Donza',
        description: 'Crie um novo grupo de estudo dentro da comunidade Donza. Organize aprendizado colaborativo e atividades em grupo.',
        keywords: 'criar grupo, grupo estudo, aprendizado colaborativo, atividades grupo'
      },
      '/communities/:communityId/study-group': {
        title: 'Grupo de Estudo - Donza',
        description: 'Acesse o grupo de estudo da comunidade Donza. Recursos, discussões específicas e aprendizado focado.',
        keywords: 'grupo estudo, aprendizado focado, recursos específicos, discussões temáticas'
      },

      // Reviews
      '/reviews': {
        title: 'Avaliações - Donza',
        description: 'Avalie cursos, instrutores e experiências educacionais na plataforma Donza. Compartilhe feedback construtivo.',
        keywords: 'avaliações, reviews, feedback, opiniões, classificações educacionais'
      },

      // Configurações
      '/settings': {
        title: 'Configurações - Donza',
        description: 'Personalize sua experiência na plataforma Donza. Configure preferências, notificações e segurança da sua conta.',
        keywords: 'configurações, preferências, privacidade, notificações, segurança da conta'
      },
      '/settings/account': {
        title: 'Configurações da Conta - Donza',
        description: 'Gerencie suas informações pessoais e preferências de conta na plataforma Donza. Atualize dados e personalizações.',
        keywords: 'configurações conta, informações pessoais, preferências, dados usuário'
      },
      '/settings/security': {
        title: 'Segurança - Donza',
        description: 'Gerencie a segurança da sua conta Donza. Senha, autenticação e configurações de privacidade para proteção total.',
        keywords: 'segurança, senha, autenticação, privacidade, proteção conta'
      },
      '/settings/notifications': {
        title: 'Notificações - Donza',
        description: 'Controle suas preferências de notificação na plataforma Donza. Personalize alertas e atualizações recebidas.',
        keywords: 'notificações, alertas, preferências, configurações notificação'
      },
      '/settings/appearance': {
        title: 'Aparência - Donza',
        description: 'Personalize a aparência e tema da plataforma Donza. Modo escuro, cores e layout para melhor experiência visual.',
        keywords: 'aparência, tema, modo escuro, personalização visual, layout'
      },
      '/settings/billing': {
        title: 'Cobrança - Donza',
        description: 'Gerencie informações de cobrança e pagamento na plataforma Donza. Métodos de pagamento e histórico financeiro.',
        keywords: 'cobrança, pagamento, métodos pagamento, histórico financeiro, fatura'
      },

      // Rota padrão fallback
      'default': {
        title: 'Donza - Plataforma Educacional Completa',
        description: 'Aprenda, ensine e cresça com a Donza. Acesse cursos online, materiais educacionais e faça parte de uma comunidade de aprendizagem colaborativa.',
        keywords: 'educação, cursos online, aprendizado, plataforma educacional, Donza, ensino'
      }
    };

    // Encontra a configuração SEO para a rota atual
    const findSeoForRoute = (pathname) => {
      // Primeiro tenta match exato
      if (pageSeoData[pathname]) {
        return pageSeoData[pathname];
      }
      
      // Depois tenta match com parâmetros dinâmicos
      const routeKeys = Object.keys(pageSeoData);
      for (const key of routeKeys) {
        if (key.includes(':')) {
          const pattern = new RegExp('^' + key.replace(/:[^/]+/g, '([^/]+)') + '$');
          if (pattern.test(pathname)) {
            return pageSeoData[key];
          }
        }
      }
      
      // Fallback para default
      return pageSeoData['default'];
    };

    const baseSeo = findSeoForRoute(location.pathname);
    const finalSeo = { ...baseSeo, ...customSeo };
    
    // Atualiza título
    document.title = finalSeo.title;
    
    // Atualiza meta tags
    updateMetaTag('description', finalSeo.description);
    updateMetaTag('keywords', finalSeo.keywords);
    
  }, [location.pathname, customSeo]);
};

// Função auxiliar para atualizar meta tags
const updateMetaTag = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
};

export default usePageTitle;