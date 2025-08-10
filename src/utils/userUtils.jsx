export const roleSpecificFields = {
  student: {
    requiredFields: [
      'username',
      'email',
      'fullName',
      'interests',
      'bio',
      'avatarUrl'
    ],
    optionalFields: [
      'website',
      'socialMedia',
      'contactPhone'
    ],
    validationRules: {
      username: { minLength: 3, maxLength: 30, regex: /^[a-zA-Z0-9_]+$/ },
      fullName: { minLength: 2 },
      interests: { minItems: 1 },
      bio: { minLength: 20 }
    },
    hint: 'Complete seu perfil para receber recomendações personalizadas de cursos',
    completionSteps: [
      'Adicione seus interesses',
      'Escreva uma bio interessante',
      'Adicione uma foto de perfil'
    ]
  },
  instructor: {
    requiredFields: [
      'username',
      'email',
      'fullName',
      'expertise',
      'bio',
      'avatarUrl'
    ],
    optionalFields: [
      'website',
      'socialMedia',
      'contactPhone'
    ],
    validationRules: {
      username: { minLength: 3, maxLength: 30, regex: /^[a-zA-Z0-9_]+$/ },
      fullName: { minLength: 2 },
      expertise: { minItems: 3 },
      bio: { minLength: 50 }
    },
    hint: 'Um perfil completo ajuda a atrair mais alunos para seus cursos',
    completionSteps: [
      'Adicione pelo menos 3 áreas de especialização',
      'Descreva sua experiência profissional',
      'Adicione links para seu portfólio ou redes sociais'
    ]
  },
  institution: {
    requiredFields: [
      'username',
      'email',
      'institutionName',
      'institutionType',
      'academicPrograms',
      'website',
      'avatarUrl'
    ],
    optionalFields: [
      'bio',
      'socialMedia',
      'contactPhone',
      'academicPrograms'
    ],
    validationRules: {
      username: { minLength: 3, maxLength: 30, regex: /^[a-zA-Z0-9_]+$/ },
      institutionName: { minLength: 5 },
      institutionType: { required: true },
      academicPrograms: { minItems: 1 },
      website: { isUrl: true }
    },
    hint: 'Um perfil completo aumenta a visibilidade da sua instituição',
    completionSteps: [
      'Adicione o nome completo da instituição',
      'Selecione o tipo de instituição',
      'Liste os programas acadêmicos oferecidos',
      'Adicione o site oficial'
    ],
    institutionTypes: [
      'Universidade',
      'Faculdade',
      'Escola Técnica',
      'Centro de Pesquisa',
      'Plataforma Online',
      'ONG Educacional',
      'Outro'
    ]
  },
  admin: {
    requiredFields: [
      'username',
      'email'
    ],
    optionalFields: [],
    validationRules: {
      username: { minLength: 3, maxLength: 30, regex: /^[a-zA-Z0-9_]+$/ }
    },
    hint: 'Mantenha seu perfil de administrador atualizado',
    completionSteps: []
  }
};

export const institutionTypes = [
  'Universidade',
  'Faculdade',
  'Escola Técnica',
  'Centro de Pesquisa',
  'Plataforma Online',
  'ONG Educacional',
  'Outro'
];

export const getDefaultInterests = () => [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Artificial Intelligence',
  'Machine Learning',
  'Cybersecurity',
  'Cloud Computing',
  'UI/UX Design',
  'Digital Marketing',
  'Graphic Design',
  'Photography',
  'Music Production',
  'Creative Writing',
  'Languages',
  'Personal Development',
  'Entrepreneurship',
  'Project Management'
];

export const getDefaultExpertise = () => [
  'JavaScript',
  'Python',
  'Java',
  'C#',
  'PHP',
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Django',
  'Flask',
  'Spring Boot',
  'AWS',
  'Azure',
  'Google Cloud',
  'Docker',
  'Kubernetes',
  'Machine Learning',
  'Data Analysis',
  'Cybersecurity'
];

export const getAcademicPrograms = () => [
  'Graduação',
  'Pós-Graduação',
  'Mestrado',
  'Doutorado',
  'MBA',
  'Extensão Universitária',
  'Cursos Técnicos',
  'Educação Continuada',
  'Cursos Livres',
  'Formação de Professores',
  'Educação a Distância (EAD)',
  'Ensino Híbrido'
];

export const notificationPreferencesStructure = {
  email: {
    courseUpdates: true,
    newMessages: true,
    eventReminders: true,
    institutionalNews: false
  },
  inApp: {
    announcements: true,
    deadlineAlerts: true
  },
  push: {
    importantUpdates: true
  }
};

export const socialMediaFields = {
  linkedin: '',
  twitter: '',
  facebook: '',
  instagram: '',
  youtube: '',
  github: '',
  researchGate: '',
  lattes: ''
};

// Função auxiliar para validar campos
export const validateField = (fieldName, value, role) => {
  const rules = roleSpecificFields[role]?.validationRules?.[fieldName];
  if (!rules) return true;

  if (rules.required && !value) return false;
  if (rules.minLength && value?.length < rules.minLength) return false;
  if (rules.maxLength && value?.length > rules.maxLength) return false;
  if (rules.regex && !rules.regex.test(value)) return false;
  if (rules.minItems && Array.isArray(value) && value.length < rules.minItems) return false;
  if (rules.isUrl && value && !/^https?:\/\/.+\..+/.test(value)) return false;

  return true;
};