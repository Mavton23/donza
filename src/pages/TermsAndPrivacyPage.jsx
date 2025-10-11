import usePageTitle from "@/hooks/usePageTitle";
import { Helmet } from 'react-helmet';
import { Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';

const TermsAndPrivacyPage = () => {
  usePageTitle();
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Helmet>
        <title>Termos de Serviço e Política de Privacidade - Classroom</title>
        <meta name="description" content="Termos de uso e política de privacidade da plataforma educacional Classroom" />
      </Helmet>

      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Termos de Serviço e Política de Privacidade
        </Typography>
        <Typography variant="subtitle1">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </Typography>
      </Box>

      <Box mb={6}>
        <Typography variant="h4" component="h2" gutterBottom>
          1. Termos de Serviço
        </Typography>
        
        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          1.1 Aceitação dos Termos
        </Typography>
        <Typography paragraph>
          Ao acessar e utilizar a plataforma Classroom ("Plataforma"), você concorda com estes Termos de Serviço e com nossa Política de Privacidade. Se você não concordar com qualquer parte destes termos, você não deve usar nossa Plataforma.
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          1.2 Descrição do Serviço
        </Typography>
        <Typography paragraph>
          A Classroom é uma plataforma educacional que conecta alunos, instrutores e instituições de ensino, oferecendo:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• Cursos e materiais educacionais em diversos formatos" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Ferramentas para criação e compartilhamento de conteúdo" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Eventos educacionais online" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Comunidade para interação entre usuários" />
          </ListItem>
        </List>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          1.3 Cadastro e Conta do Usuário
        </Typography>
        <Typography paragraph>
          Para acessar certas funcionalidades, você precisará criar uma conta. Você concorda em:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• Fornecer informações verdadeiras, precisas e completas" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Manter suas credenciais de acesso em sigilo" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Ser responsável por todas as atividades realizadas em sua conta" />
          </ListItem>
        </List>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          1.4 Conduta do Usuário
        </Typography>
        <Typography paragraph>
          Você concorda em não utilizar a Plataforma para:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• Compartilhar conteúdo ilegal, ofensivo ou prejudicial" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Violar direitos autorais ou propriedade intelectual" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Praticar atividades fraudulentas ou enganosas" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Interferir na segurança ou funcionamento da Plataforma" />
          </ListItem>
        </List>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          1.5 Conteúdo Gerado por Usuários
        </Typography>
        <Typography paragraph>
          Instrutores e instituições são responsáveis pelo conteúdo que publicam. A Classroom não endossa nem garante a precisão, qualidade ou integridade de qualquer conteúdo gerado por usuários.
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          1.6 Moderação e Remoção de Conteúdo
        </Typography>
        <Typography paragraph>
          Reservamo-nos o direito de remover qualquer conteúdo ou suspender contas que violem estes Termos, sem aviso prévio.
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          1.7 Propriedade Intelectual
        </Typography>
        <Typography paragraph>
          Todo conteúdo original fornecido pela Classroom é protegido por leis de propriedade intelectual. Conteúdos criados por instrutores permanecem de sua propriedade, mas ao publicar na Plataforma, você concede uma licença não-exclusiva para sua exibição e distribuição através de nossos serviços.
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          1.8 Pagamentos e Reembolsos
        </Typography>
        <Typography paragraph>
          Para cursos pagos, os valores e políticas de reembolso serão claramente informados no momento da compra. Instrutores receberão seus pagamentos conforme acordado nos termos específicos para criadores de conteúdo.
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          1.9 Modificações nos Termos
        </Typography>
        <Typography paragraph>
          Podemos atualizar estes Termos periodicamente. A versão mais recente estará sempre disponível nesta página, com a data da última atualização.
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          1.10 Rescisão
        </Typography>
        <Typography paragraph>
          Podemos encerrar ou suspender seu acesso à Plataforma a qualquer momento, sem aviso prévio, por violação destes Termos.
        </Typography>
      </Box>

      <Box mb={6}>
        <Typography variant="h4" component="h2" gutterBottom>
          2. Política de Privacidade
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          2.1 Informações Coletadas
        </Typography>
        <Typography paragraph>
          Coletamos os seguintes tipos de informações quando você usa nossa Plataforma:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• Informações de cadastro: nome, e-mail, dados de perfil" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Dados de uso: interações com a plataforma, cursos acessados, progresso" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Dados técnicos: endereço IP, tipo de dispositivo, cookies" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Para instrutores: informações de pagamento e documentos para verificação" />
          </ListItem>
        </List>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          2.2 Uso das Informações
        </Typography>
        <Typography paragraph>
          Utilizamos seus dados para:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• Fornecer e melhorar nossos serviços" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Personalizar sua experiência educacional" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Comunicar-se com você sobre sua conta e nossos serviços" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Garantir a segurança e integridade da Plataforma" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Cumprir obrigações legais" />
          </ListItem>
        </List>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          2.3 Compartilhamento de Dados
        </Typography>
        <Typography paragraph>
          Seus dados pessoais não serão compartilhados com terceiros, exceto:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• Com seu consentimento explícito" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Para prestadores de serviços essenciais (hospedagem, pagamentos)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Quando exigido por lei ou para proteger nossos direitos" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Para instrutores: informações necessárias para certificação e verificação" />
          </ListItem>
        </List>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          2.4 Cookies e Tecnologias Semelhantes
        </Typography>
        <Typography paragraph>
          Utilizamos cookies para melhorar sua experiência, analisar o uso da Plataforma e personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do navegador.
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          2.5 Segurança dos Dados
        </Typography>
        <Typography paragraph>
          Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acesso não autorizado, alteração ou destruição.
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          2.6 Retenção de Dados
        </Typography>
        <Typography paragraph>
          Mantemos seus dados apenas pelo tempo necessário para fornecer nossos serviços, cumprir obrigações legais ou resolver disputas.
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          2.7 Seus Direitos
        </Typography>
        <Typography paragraph>
          Conforme a LGPD, você tem direito a:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• Acessar seus dados pessoais" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Corrigir informações incompletas ou desatualizadas" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Solicitar a exclusão de dados desnecessários" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Revogar consentimentos dados" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Solicitar a portabilidade de dados" />
          </ListItem>
        </List>
        <Typography paragraph>
          Para exercer esses direitos, entre em contato através do e-mail: privacidade@classroom.com.br
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          2.8 Menores de Idade
        </Typography>
        <Typography paragraph>
          Nossa Plataforma não é destinada a menores de 16 anos. Ao se cadastrar, você declara ter pelo menos 16 anos ou ter consentimento dos pais/responsáveis.
        </Typography>

        <Typography variant="h5" component="h3" gutterBottom mt={3}>
          2.9 Alterações na Política de Privacidade
        </Typography>
        <Typography paragraph>
          Notificaremos você sobre mudanças significativas em nossa Política de Privacidade. O uso continuado da Plataforma após as alterações constitui aceitação da nova política.
        </Typography>
      </Box>

      <Box mt={4} textAlign="center">
        <Typography variant="h5" component="h3" gutterBottom>
          Contato
        </Typography>
        <Typography paragraph>
          Para quaisquer dúvidas sobre estes Termos ou sobre nossa Política de Privacidade, entre em contato conosco:
        </Typography>
        <Typography>
          E-mail: contato@classroom.com.br
        </Typography>
        <Typography>
          Endereço: Av. Paulista, 1000, São Paulo/SP, CEP 01310-100
        </Typography>
      </Box>
    </Container>
  );
};

export default TermsAndPrivacyPage;