# Recuperação de Senha (Supabase Auth)

Este documento descreve como a funcionalidade de recuperação de senha está implementada no projeto, quais configurações são necessárias no Supabase e como testar o fluxo completo em desenvolvimento e produção.

## Visão Geral

O fluxo de recuperação de senha utiliza o Supabase Auth para:
- Enviar um e-mail ao usuário com um link seguro de redefinição;
- Validar o token do link e permitir que o usuário defina uma nova senha;
- Redirecionar o usuário de volta ao aplicativo após a redefinição.

Rotas públicas dedicadas:
- `/recuperar-senha`: página para solicitar o link de recuperação;
- `/redefinir-senha`: página para definir a nova senha (acessada via link do e-mail).

Por questões de foco e segurança, o Navbar e o Footer são ocultados nessas rotas.

## Arquivos Alterados/Adicionados

- Serviços de autenticação:
  - `src/services/auth.ts`
    - `requestPasswordReset(email, redirectTo?)`: chama `supabase.auth.resetPasswordForEmail` e configura o `redirectTo` para `/redefinir-senha` por padrão.
    - `updatePassword(newPassword)`: chama `supabase.auth.updateUser` para salvar a nova senha após o acesso pelo link.

- Páginas:
  - `src/pages/ForgotPassword.vue`: formulário para enviar o link de recuperação.
  - `src/pages/ResetPassword.vue`: formulário para definir e confirmar a nova senha.

- Roteador:
  - `src/router/index.ts`
    - Rotas públicas adicionadas: `/recuperar-senha` e `/redefinir-senha`.

- Layout:
  - `src/components/Layout.vue`
    - Oculta Navbar/Footer nas rotas de autenticação e recuperação: `/login`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha`, `/not-found`.

- Store de autenticação (opcional):
  - `src/stores/auth.ts`
    - Exibe um toast ao detectar o evento `PASSWORD_RECOVERY` via `supabase.auth.onAuthStateChange`.

## Configurações no Supabase

No painel do Supabase (Authentication → URL Configuration):
1. Configure o **Site URL** para o domínio do seu app.
   - Em desenvolvimento: `http://localhost:5174` (ajuste conforme sua porta).
2. Em **Additional Redirect URLs**, adicione:
   - `http://localhost:5174/redefinir-senha` (desenvolvimento)
   - `https://seu-dominio.com/redefinir-senha` (produção)

Essas URLs permitem que o link de recuperação redirecione corretamente para sua página `/redefinir-senha`.

## Fluxo do Usuário

1. Usuário clica em “Recuperar senha” na tela de Login e é levado à rota `/recuperar-senha`.
2. Usuário informa seu e-mail e envia o formulário.
   - O sistema chama `requestPasswordReset(email)` e o Supabase envia o e-mail.
3. Usuário abre o e-mail e clica no link.
   - O Supabase valida o token e redireciona para `/redefinir-senha`.
4. Na página “Redefinir senha”, o usuário informa a nova senha e a confirmação.
   - O sistema chama `updatePassword(newPassword)`.
5. Ao sucesso, o usuário é redirecionado para `/login` e pode acessar com a nova senha.

## Testes em Desenvolvimento

1. Inicie o servidor local: `npm run dev` e acesse `http://localhost:5174/`.
2. Vá para `/login` e clique em “Recuperar senha”.
3. Informe um e-mail de usuário válido e envie.
4. Verifique seu e-mail (caixa de entrada/spam). Abra o link.
5. Confirme que ao acessar `/redefinir-senha`:
   - Navbar/Footer não aparecem;
   - Você consegue definir e confirmar a nova senha;
   - Ao salvar, é redirecionado para `/login` e consegue entrar.

## Considerações de Segurança

- A página de recuperação e redefinição não exibe Navbar/Footer para evitar distrações e reduzir superfícies de navegação durante ações sensíveis.
- Mensagens genéricas no envio do e-mail ajudam a não revelar se um e-mail existe ou não (ajuste conforme sua política).
- As rotas de recuperação são públicas; certifique-se de que não tenham `requiresAuth` no router.
- O Supabase Auth gerencia tokens de recuperação e expiração; não é necessário armazenar ou processar tokens manualmente.

## Customizações

- Alterar `redirectTo` em `requestPasswordReset` para diferentes ambientes/domínios.
- Adicionar regras de senha (força mínima, caracteres obrigatórios) na página `ResetPassword.vue`.
- Internacionalização (i18n) das mensagens, se desejado.
- Email templates: personalizar conteúdo e branding dos e-mails no Supabase.

## Problemas Comuns

- “O link abre, mas não consigo salvar a nova senha”:
  - Verifique se as URLs de redirecionamento estão corretamente configuradas no Supabase.
  - Cheque se o domínio do app corresponde ao `Site URL` e ao `redirectTo`.

- “Não recebo o e-mail de recuperação”:
  - Verifique a caixa de spam.
  - Confirme a validade do e-mail informado.
  - Confira as quotas e configurações de SMTP/Email do Supabase.

## Referências

- Supabase Auth – Password Reset: https://supabase.com/docs/guides/auth/passwords
- API do Supabase JS – Auth: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail