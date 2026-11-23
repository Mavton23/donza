# Donza Web (Next.js)

Frontend da Donza: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 4 · componentes estilo shadcn/ui (Radix) · TanStack Query · react-hook-form + zod.

## Arranque

```bash
cp .env.example .env.local     # API_URL aponta para a API Nest (sem /api)
npm install
npm run dev                    # http://localhost:3000
npm run build && npm start     # produção
```

A API tem de estar a correr (`donza-api`, porta 3001) e `FRONTEND_URL` da API deve conter o URL do site.

## Decisões

1. **Mesma origem para a API.** `next.config.mjs` reencaminha `/api/*` para `API_URL`. O browser só fala com o Next, por isso o cookie `refreshToken` (httpOnly, path `/api/auth`) funciona sem CORS nem cookies de terceiros.
2. **Sessão.** O access token vive só em memória (`lib/api/client.ts`). No arranque, `POST /auth/refresh` restaura a sessão a partir do cookie. Refresh *single-flight*: pedidos simultâneos com 401 partilham um único refresh.
3. **Guarda de rotas** no cliente (`app/(app)/layout.tsx`), porque o token não existe no servidor. Terminar sessão de propósito não redirecciona para o login.
4. **Páginas públicas em servidor** (início, detalhe do curso) com `revalidate` de 60 s e metadados/SEO; o estado do utilizador (matriculado, progresso) vem do cliente.
5. **Emails da API** apontam para `/register/verify` e `/reset-password`; o Next redirecciona para `/registar/verificar` e `/redefinir`.
6. **Redirecções seguras**: `?next=` só aceita caminhos internos (`lib/safe-next.ts`).
7. **Pagamentos**: `components/courses/checkout-dialog.tsx` usa `Idempotency-Key`, valida o telefone, retoma pagamentos pendentes (`PAYMENT_PENDING`), faz polling até ao webhook confirmar e abre o curso.
8. **Acessibilidade**: foco visível, `aria-live` nos erros de formulário, link "saltar para o conteúdo", `prefers-reduced-motion`, modo escuro.
9. TypeScript fixado em 5.9 (a 7.x ainda não é suportada pelo Next 15).

## Estado (fase 1)

Feito: design system (claro/escuro), início, catálogo com filtros na URL, detalhe do curso, checkout (M-Pesa, e-Mola, cartão, transferência), registo em 2 passos com documentos, login/recuperação, painel de aluno e de instrutor (leitura), leitor de aulas com progresso, meus cursos, notificações, perfil público com seguir/pedir para seguir, definições (perfil, privacidade com gestão de pedidos, segurança).

Por fazer: criação/edição de cursos e biblioteca (instrutor), trabalhos e certificados, comunidades, grupos de estudo, mensagens, eventos e calendário, avaliações, administração, ajuda/contacto.

## Verificação

`tsc --noEmit` e `next build` limpos; fluxo completo no Chromium contra a API real (29 verificações: registo com verificação de email, sessão após reload, guarda de rotas, matrícula, progresso, pagamento por transferência e M-Pesa com webhook, pedido de seguimento aceite por outro utilizador, notificações, painel de instrutor, telemóvel e modo escuro).

## Fase 2 — Área do instrutor

- `/gestao/novo` (criar curso, capa obrigatória) e `/gestao/[courseId]` com separadores Detalhes / Currículo / Publicação.
- Currículo: módulos e aulas (criar, editar, eliminar, rascunho/publicado, subir/descer), adicionar até 50 aulas de uma vez.
- Upload de vídeo/áudio/PDF directo ao Cloudinary com assinatura da API e barra de progresso (`components/manage/media-upload.tsx`). **Não testado contra o Cloudinary real** (o ambiente de teste não tem acesso).
- Publicação: publicar, passar a rascunho, arquivar, eliminar (409 com alunos → mensagem a sugerir arquivar).
- Verificado em Chromium: criar curso com capa → módulo → aula → lote → reordenar → publicar → visível no catálogo → eliminar.
- Biblioteca (`/biblioteca`, `/biblioteca/[moduleId]`): módulos sem curso, aulas, publicar, juntar a um curso, eliminar.
- Ganhos (`/ganhos`): resumo por moeda, histórico de pagamentos, destino (M-Pesa/e-Mola/banco) e submissão de NUIT. Os cartões de resumo só foram vistos vazios (sem vendas no seed).
- Navegação "Biblioteca" e "Ganhos" só para instrutores/instituições.

## Fase 3 — Trabalhos e certificados

- Aluno: `/trabalhos` (todos os trabalhos dos cursos inscritos, entregar texto/ficheiro, ver nota e comentário), `/certificados` (lista, PDF autenticado, copiar ligação).
- Instrutor: separador **Trabalhos** em `/gestao/[courseId]` (criar/editar/eliminar, prazo, penalização, tipos de ficheiro, entregas e avaliação).
- Público: `/verificar/[id]` (o link do certificado emitido pela API, `/certificates/verify/:id`, redirecciona para aqui).
- Verificado em Chromium: criar trabalho → aluno entrega → instrutor avalia → aluno vê nota; concluir curso → certificado → PDF válido → verificação pública.
- Quizzes: a API não tem endpoints de quiz (só existe no schema), por isso não há interface.
- Upload de anexo na entrega não foi testado contra o armazenamento real.

## Fase 4 — Comunidades

- `/comunidades` (descobrir / as minhas, pesquisa), `/comunidades/nova`, `/comunidades/[slug]` (feed com filtros, entrar/sair/pedir para entrar, novo tópico), `/comunidades/[slug]/[postId]` (reacções, comentários com resposta aninhada, aceitar resposta em perguntas, eliminar).
- O conteúdo dos tópicos é sempre mostrado como texto simples (a API aceita HTML de outros clientes; nunca o interpretamos).
- Verificado em Chromium com dois utilizadores (9 passos).
- Ainda sem interface: moderação (membros, pedidos de adesão, papéis, convites), edição de tópicos/comentários, imagens da comunidade, anexos e tópicos rascunho.

## Fase 5 — Grupos de estudo

- `/grupos` (os meus / descobrir), `/grupos/nova`, `/grupos/[groupId]` com separadores Geral (objectivos, membros, classificação), Reuniões (marcar, RSVP, cancelar), Tarefas (criar/atribuir, concluir a sua parte, estado) e Discussões (tópicos, respostas, votos, solução).
- Entrar: público directo; com aprovação ou privado pede-se (código/mensagem); só por convite exige código.
- Verificado em Chromium com dois utilizadores (11 passos).
- Sem interface ainda: moderação (pedidos de adesão, convites, papéis, remover/transferir liderança), conteúdos partilhados (ficheiros), relatórios, conquistas e capa do grupo.

## Fase 6 — Mensagens

- `/mensagens`: conversas 1:1 + separador Pedidos (aceitar/recusar), chat com envio por Enter, anexo, editar/eliminar as suas, carregar anteriores, lido (✓✓). Em ecrãs pequenos mostra lista ou conversa.
- Botão **Mensagem** no perfil: tenta mensagem directa; se o destinatário exigir pedido (`MESSAGE_REQUEST_REQUIRED`), muda para pedido com assunto.
- Separador **Chat** nos grupos de estudo (mesmo componente).
- A API não tem tempo-real (sem WebSocket/SSE): o chat consulta a cada 5 s com o separador aberto; contadores a cada 15 s. Se a API ganhar SSE, basta trocar o `refetchInterval` em `components/messages/chat-panel.tsx`.
- Sem interface: chat da comunidade, silenciar conversas, responder a uma mensagem (citação), moderação de mensagens.

## Fase 7 — Eventos e calendário

- `/eventos` (próximos com filtros, as minhas inscrições, organizados), `/eventos/novo`, `/eventos/[eventId]`: inscrição, cancelar, ligação da sessão só para inscritos, adicionar ao calendário (.ics). Eventos pagos reutilizam o `CheckoutDialog` (agora aceita `event`); a moeda é `NEXT_PUBLIC_DEFAULT_CURRENCY` (tem de coincidir com `PAYMENTS_DEFAULT_CURRENCY` da API, por omissão MZN, porque a API não devolve a moeda do evento).
- Organizador: editar, iniciar, concluir, cancelar, presença (só com o evento a decorrer ou concluído, regra da API) e emitir certificados.
- `/calendario`: vista mensal com eventos, prazos de trabalhos e tarefas; exportar .ics; subscrever por URL (gerar nova ligação).
- `/events/:id` (link vindo da API) redirecciona para `/eventos/:id`.
- Verificado em Chromium (11 passos). O pagamento do evento só foi verificado até à abertura do checkout.

## Fase 8 — Avaliações

- `components/reviews/entity-reviews.tsx`: secção pública de avaliações (média, distribuição clicável como filtro, ordenação, paginação) usada na página do curso (`/cursos/[slug]`) e do evento. Quem é elegível (curso concluído / evento frequentado) publica, edita e elimina a sua avaliação; os restantes vêem o motivo.
- `/avaliacoes` (instrutor/instituição): métricas (média, total, por responder), nota por curso e lista das avaliações recebidas com filtros, responder, editar e eliminar resposta.
- Texto dos utilizadores é sempre renderizado como texto simples.
- A moderação (visibilidade) fica na área de administração.

## Fase 9 — Administração

Área `/admin` (só `admin`; os outros perfis são reencaminhados para `/painel`) com separadores:

- **Visão geral**: estatísticas, itens por tratar, gráficos de actividade (7d/30d/90d/12m), estado e métricas do sistema.
- **Utilizadores**: pesquisa e filtros, detalhe, suspender (com motivo) / reactivar, criar novo administrador.
  Por decisão de projecto **não** existe alterar perfil nem eliminar utilizadores.
- **Verificações**: aprovar/recusar contas de instrutores e instituições (motivo obrigatório ao recusar), rever e abrir documentos.
- **Pagamentos**: relatório financeiro por moeda, lista filtrável, confirmar transferência bancária, reembolsar.
- **Levantamentos**: executar elegíveis ou um a um (pendente → em processamento), marcar pago/falhado, repetir; separador KYC.
- **Avaliações**: ocultar/mostrar avaliações (deixam de aparecer no público).
- **Registos**: auditoria de acções de administração e actividade da plataforma.

Todas as acções que exigem motivo usam um diálogo com validação (nunca `window.confirm`).

## Fase 10 — Ajuda, contacto e testemunhos

Público:
- `/ajuda`: pesquisa em tempo real, categorias com contagem, temas populares e lista por categoria. `/ajuda/[slug]`: artigo (renderizador próprio e seguro: `## título`, `- lista`, `1. lista`, parágrafos; HTML é sempre mostrado como texto) com «Foi útil?» para quem tem sessão.
- `/contacto`: email, conversa ou pedido de chamada (telefone e hora preferida); pré-preenche com a conta e mostra «Os seus pedidos» e o estado.
- `/testemunhos`: lista pública; quem tem sessão envia, edita e elimina o seu (fica «Em análise» até ser aprovado). Destaques na página inicial (cache de 60 s).
- Links no rodapé, no cabeçalho e no menu da aplicação («Ajuda»).

Administração (`/admin/ajuda`, `/admin/contactos`, `/admin/testemunhos`):
- Artigos (criar/editar/estado/eliminar), categorias (CRUD) e opiniões dos leitores.
- Pedidos de contacto com filtros e mudança de estado (recebido → em tratamento → resolvido).
- Testemunhos: publicar, publicar em destaque, destacar/retirar destaque, recusar e criar testemunhos externos.

## Fase 11 — Tempo real (WebSocket)

- `lib/realtime/realtime-provider.tsx` liga a `NEXT_PUBLIC_WS_URL` + `/ws` (por defeito `http://localhost:3001`) com o access token em memória e converte os eventos do servidor (`message:*`, `chat:read`, `notification:new`) em invalidações do React Query: chats, caixa de entrada, contador de não lidas e notificações actualizam sozinhos (~0,4 s medidos).
- O Next **não** faz proxy de WebSockets, por isso o browser liga directamente à API: defina `NEXT_PUBLIC_WS_URL` em produção e garanta que `FRONTEND_URL` da API inclui o site.
- Token expirado → renova a sessão uma vez e volta a ligar; ao religar depois de uma quebra, refaz as consultas para recuperar o que se perdeu.
- Sem WebSocket (bloqueado, API em baixo) as consultas voltam ao polling original (5 s no chat, 15 s no contador…); com ele ligado ficam só como rede de segurança (60 s).

## Fase 12 — Moderação de comunidades

Em `/comunidades/[slug]` há agora os separadores **Publicações | Membros | Gestão**.

- **Membros**: pesquisa, alteração de papel base (só admins da comunidade), atribuição de papéis personalizados, silenciar/reactivar, banir e remover (com confirmação em diálogo).
- **Gestão** (admins e moderadores): *Pedidos* (aprovar/rejeitar), *Convites* (por email, listar e revogar). Só admins vêem *Papéis* (5 permissões: managePosts, manageEvents, inviteMembers, removeMembers, editCommunity) e *Definições* (editar, arquivar/reactivar, eliminar, mudança de slug com redirecionamento).
- Código: `components/community/manage.tsx`, `components/ui/confirm-dialog.tsx`.
- Limitação: a API não lista membros banidos, por isso não é possível desbanir pela interface.

## Fase 13 — Moderação de grupos de estudo

`/grupos/[groupId]` ganha os separadores **Membros** (todos) e **Gestão** (líder, co-líder e moderadores).

- **Membros**: pesquisa; liderança e moderadores vêem também banidos. Papel (membro/moderador/co-líder), avisar, silenciar (moderadores até 24 h, liderança até 30 dias), banir/desbanir, remover (confirmação) e transferir liderança (só o líder). Avisar/silenciar/banir pedem motivo e ficam no registo.
- **Gestão → Pedidos / Convites**: aprovar ou rejeitar pedidos; convidar por pesquisa de utilizadores e revogar convites.
- **Gestão → Moderação**: Resumo (indicadores), Denúncias de tópicos (resolver), Análises automáticas (período e sensibilidade; falso positivo, revisto ou remover conteúdo), Recursos (aceitar/rejeitar com nota) e Registo filtrável.
- **Gestão → Definições** (liderança): editar dados, privacidade e estado (só o líder), código de convite (copiar/gerar novo), eliminar (grupo sem outros membros).
- Em **Geral**, o membro vê “As minhas sanções” e pode recorrer.
- Código: `components/groups/{manage,moderation}.tsx`.

## Fase 14 — Chat das comunidades

Os membros activos vêem o separador **Chat** em `/comunidades/[slug]`. Reutiliza o `ChatPanel` (mensagens, edição, anexos, lido, paginação) sobre `communities/:id/messages`, com actualização em tempo real por WebSocket (ou polling de 5 s sem ele). Quem não é membro não vê o separador e a API devolve 403.

## Fase 15 — Recursos, relatórios e conquistas dos grupos

- **Recursos** (separador para todos os membros): lista paginada com pesquisa, filtro por tipo e ordenação (recentes / mais descarregados). Partilha de ficheiro (PDF, slides, imagem, vídeo, código) ou de link; o autor edita e apaga os seus, a moderação apaga os de qualquer pessoa. “Descarregar/Abrir” regista a abertura e abre o recurso noutro separador. Membros silenciados não partilham.
- **Gestão → Relatórios** (líder e co-líder): semanal e mensal (actual/anterior), tarefas (7/30/90 dias) e histórico guardado com detalhe; botão **Avaliar conquistas**.
- **Conquistas**: botão por membro na lista de Membros e cartão “As minhas conquistas” em Geral (obtidas e por conquistar).
- Código: `components/groups/{contents,reports}.tsx`. A API passou a devolver `membershipId` na lista de membros do grupo.

## Passagem final

- **Qualidade**: `tsc` limpo; ESLint configurado (`.eslintrc.json`, `next/core-web-vitals` + `next/typescript`; `npm run lint`) sem erros (1 aviso conhecido: `any` ao ler JSON no cliente HTTP).
- **Segurança**: cabeçalhos HSTS e CSP parcial (`frame-ancestors`, `base-uri`, `object-src`, `form-action`) além dos existentes. CSP completa de scripts exigiria nonces.
- **Deploy**: `Dockerfile` incluído; ver `donza-deploy/` (compose, `.env.example` e `DEPLOY.md` com checklist).
- **Verificação**: regressão de browser (Playwright/Chromium) das fases 3 a 15 e do tempo real, sem falhas.

## Identidade visual

A Donza tem identidade própria: um **D que guarda o sol**, cores de **Mar** (verde-azulado) e **Sol** (âmbar), títulos em **Outfit** e texto em **Geist**. O guia completo (logótipos, cores, tipografia, regras de uso) está registado como Design System.

| Peça | Onde está |
| --- | --- |
| Tokens de cor (claro/escuro), fontes, raios | `src/app/globals.css` (`:root` e `.dark`, em OKLCH; contrastes validados ≥ 4,5:1) |
| Logótipo na UI | `src/components/layout/logo.tsx` (`Logo`, `LogoLockup`, `LogoMark`; `light` para fundos escuros fixos) |
| Dispositivo "Horizonte" | `src/components/layout/brand-arcs.tsx` (`BrandArcs`, `tone="light"` em fundos escuros) |
| Desenho oficial (caminhos) | `src/lib/brand-paths.ts` (gerado por `brand/`) |
| Ícones, favicon, manifesto, imagem de partilha | `src/app/icon.svg`, `favicon.ico`, `apple-icon.png`, `opengraph-image.png`, `twitter-image.png`, `manifest.ts` |
| Kit para download | `public/brand/` (`svg/`, `png/`, `icons/`, `email/`) |
| Tipo de letra dos títulos | `src/app/fonts/` (Outfit, licença OFL incluída); Geist vem do pacote `geist` |

Regras rápidas: botões e ligações em `primary` (Mar); `accent` (Sol) só como destaque e com texto `accent-foreground`; títulos (`h1`–`h3`) usam Outfit automaticamente; sobre fundos escuros fixos use `<Logo light />`. As capas de curso sem imagem usam gradientes da paleta.

O gerador do símbolo e do wordmark está em `brand/` (ver `brand/README.md`). Nos emails da API o logótipo é carregado de `/brand/email/email-logo-reverse.png`, por isso esse caminho tem de ser público.
