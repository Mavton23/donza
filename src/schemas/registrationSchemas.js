import * as yup from 'yup';

// Função auxiliar para validar tipos de arquivo
function isValidFileType(file) {
  const validTypes = [
    'application/pdf', 
    'image/jpeg', 
    'image/png',
    'image/jpg'
  ];
  return file instanceof File && validTypes.includes(file.type);
}


// Esquemas de validação
export const emailPasswordSchema = yup.object().shape({
  email: yup.string()
  .email('Email inválido')
  .required('Email é obrigatório')
  .when('role', (role, schema) => {
      return role === 'institution'
      ? schema.matches(
        /\.(edu|gov)\.mz$/i, 
        'Email institucional recomendado (ex: @escola.edu.mz)'
      )
      : schema
    }),
  password: yup.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/, 'Deve conter pelo menos um número')
    .required('Senha é obrigatória')
});

export const institutionSchema = yup.object().shape({
  username: yup.string()
    .min(3, 'Username deve ter no mínimo 3 caracteres')
    .max(20, 'Username deve ter no máximo 20 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username pode conter apenas letras, números e underscores')
    .required('Username é obrigatório'),
  
  nuit: yup.string()
    .required('NUIT é obrigatório')
    .matches(/^\d{9}$/, 'NUIT deve conter exatamente 9 dígitos'),
  
  legalRepresentative: yup.string()
    .required('Responsável legal é obrigatório')
    .min(5, 'Nome deve ter pelo menos 5 caracteres'),
  
  // Documentos individuais
  alvara: yup.mixed()
    .required('Alvará de funcionamento é obrigatório')
    .test('fileType', 'Formato inválido (PDF, JPG, PNG)', value => {
      if (!value) return false;
      if (typeof value === 'string') return true;
      return isValidFileType(value);
    }),
  
  credenciamento: yup.mixed()
    .required('Credenciamento institucional é obrigatório')
    .test('fileType', 'Formato inválido (PDF, JPG, PNG)', value => {
      if (!value) return false;
      if (typeof value === 'string') return true;
      return isValidFileType(value);
    }),
  
  estatutos: yup.mixed()
    .required('Estatutos/Contrato social é obrigatório')
    .test('fileType', 'Formato inválido (PDF, JPG, PNG)', value => {
      if (!value) return false;
      if (typeof value === 'string') return true;
      return isValidFileType(value);
    }),
  
  endereco: yup.mixed()
    .required('Comprovante de endereço é obrigatório')
    .test('fileType', 'Formato inválido (PDF, JPG, PNG)', value => {
      if (!value) return false;
      if (typeof value === 'string') return true;
      return isValidFileType(value);
    })
});

export const instructorSchema = yup.object().shape({
  username: yup.string()
    .min(3, 'Username deve ter no mínimo 3 caracteres')
    .max(20, 'Username deve ter no máximo 20 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username pode conter apenas letras, números e underscores')
    .required('Username é obrigatório'),
  fullName: yup.string().required('Nome completo é obrigatório'),
  educationLevel: yup.string().required('Nível de formação é obrigatório'),
  educationField: yup.string().required('Área de formação é obrigatória'),
  qualifications: yup.array()
    .of(
      yup.mixed()
        .test('fileType', 'Formato de arquivo inválido', (value) => {
          if (!value) return false;
          if (typeof value === 'string') return true;
          return value instanceof File &&
            ['application/pdf', 'image/jpeg', 'image/png'].includes(value.type);
        })
    )
    .min(2, 'Pelo menos diploma e comprovante de experiência devem ser enviados')
    // .required('Qualificações são obrigatórias')
});