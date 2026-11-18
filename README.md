# FitControl — Versão Portátil (HTML5, CSS3 & JavaScript Puro)

Sistema completo de gestão de academias desenvolvido exclusivamente em tecnologias web nativas (Vanilla HTML, CSS e JavaScript), com **estrutura plana (sem subpastas)** para facilitar o upload direto no GitHub via navegador.

---

## 🎯 Visão Geral do Projeto

Esta versão do **FitControl** foi construída para facilidade de envio e publicação no GitHub Pages:
- **Estrutura 100% Plana:** Todos os arquivos (`.html`, `.css`, `.js`) ficam na raiz, permitindo que você arraste e solte todos os arquivos de uma vez no GitHub pelo navegador ("Upload files").
- **Zero Dependências:** Abra com dois cliques em `index.html` ou `dashboard.html` em qualquer computador.
- **Persistência Completa no Navegador:** CRUD funcional com armazenamento no `localStorage`.
- **Compatível com GitHub Pages:** Hospede gratuitamente com 1 clique.
- **Simulador de Catraca & Facial Integrado:** Validações de acesso e carência em tempo real.
- **Exportação para Microsoft Excel:** Planilha no modelo oficial com separador `;` e decimais em vírgula.

---

## 📁 Lista de Arquivos (Na Raiz do Projeto)

### Páginas do Sistema (HTML):
- `index.html` — Ponto de entrada e redirecionamento inicial
- `login.html` — Login com atalhos de 1 clique para demonstração
- `dashboard.html` — Painel com métricas, gráficos e transações recentes
- `alunos.html` — Cadastro de alunos, busca, filtros e histórico de mensalidades
- `planos.html` — Gerenciador de planos com cálculo automático de descontos
- `pagamentos.html` — Controle de recebimentos e emissão de recibos para impressão
- `caixa.html` — Caixa diário, abertura, fechamento com conferência e sangrias
- `despesas.html` — Gestão de contas a pagar e centros de custo operacionais
- `acesso.html` — Monitoramento de catracas e logs de passagem
- `relatorios.html` — DRE consolidado e exportação de planilha para Excel
- `usuarios.html` — Gestão de equipe e controle de perfis (RBAC)
- `configuracoes.html` — Parâmetros cadastrais e tolerância de carência

### Estilos Visuais (CSS):
- `global.css` — Variáveis de cores (Dark Navy, Charcoal, Roxo), reset e fontes
- `layout.css` — Estrutura de sidebar, topbar e navegação
- `components.css` — Cards, tabelas, formulários, modais, badges e recibo
- `responsive.css` — Adaptação para celulares, tablets e regras de impressão limpa

### Lógica e Funcionalidades (JavaScript):
- `storage.js` — Camada de banco de dados local (`localStorage`) e utilitários
- `auth.js` — Controle de login, logout e permissões por perfil (RBAC)
- `theme.js` — Alternador de tema claro e escuro persistente
- `ui.js` — Toasts, controle de modais e simulador de catraca
- `navigation.js` — Injeção dinâmica de menu lateral e barra de topo
- `dashboard.js` — Métricas em tempo real e gráficos gerenciais
- `students.js` — Validação de CPF, cálculo de vencimento e ficha do aluno
- `plans.js` — Criação e cálculo de planos
- `payments.js` — Lançamento de pagamentos e impressão de comprovantes
- `cash.js` — Abertura, fechamento e movimentações de caixa
- `expenses.js` — Contas a pagar e centros de custo
- `access.js` — Dispositivos de acesso e testes de ping
- `reports.js` — Relatórios e exportação Excel (.CSV oficial)
- `users.js` — Gestão de operadores do sistema
- `settings.js` — Configurações institucionais e restauração de dados

---

## 🚀 Como Enviar Facilmente para o GitHub (Sem Linha de Comando)

Como todos os arquivos estão na raiz (sem pastas), você pode enviar diretamente pelo site do GitHub:

1. Acesse o seu repositório no [GitHub](https://github.com).
2. Clique no botão **"Add file"** e selecione **"Upload files"**.
3. Extraia o arquivo `FitControl-HTML-Completo.zip` na sua máquina.
4. Selecione **todos os arquivos** dentro da pasta e arraste para a área de upload do GitHub.
5. Clique em **"Commit changes"**.
6. Para ativar o site:
   - Vá em **Settings** > **Pages**.
   - Em **Branch**, selecione `main` e `/ (root)`.
   - Clique em **Save**.
7. O GitHub gerará o link público gratuito para você apresentar o FitControl!

---

## 💻 Como Abrir no Computador Local

Basta dar dois cliques no arquivo `index.html` (ou `login.html` / `dashboard.html`). O sistema abrirá imediatamente em qualquer navegador moderno.
