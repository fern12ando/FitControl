/**
 * FITCONTROL — GERADOR DE MENU & LAYOUT NATIVO
 * Injeta dinamicamente a Sidebar e a Topbar em todas as páginas,
 * aplicando regras de permissão RBAC e identificação da página ativa.
 */

function setupNavigation(activePageKey, pageBreadcrumb) {
  const currentUser = fitAuth.getCurrentUser();
  const currentRole = currentUser ? currentUser.role : "PROPRIETARIO";

  // 1. Definição dos Itens de Navegação com ícones SVG nativos e regras de permissão
  const navItems = [
    {
      key: "dashboard",
      title: "Visão Geral",
      href: "dashboard.html",
      icon: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
      roles: ["PROPRIETARIO", "ADMINISTRADOR", "RECEPCIONISTA", "CONSULTA"],
    },
    {
      key: "alunos",
      title: "Alunos",
      href: "alunos.html",
      icon: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      roles: ["PROPRIETARIO", "ADMINISTRADOR", "RECEPCIONISTA", "CONSULTA"],
    },
    {
      key: "planos",
      title: "Planos & Assinaturas",
      href: "planos.html",
      icon: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
      roles: ["PROPRIETARIO", "ADMINISTRADOR", "RECEPCIONISTA", "CONSULTA"],
    },
    {
      key: "pagamentos",
      title: "Pagamentos",
      href: "pagamentos.html",
      icon: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
      roles: ["PROPRIETARIO", "ADMINISTRADOR", "RECEPCIONISTA", "CONSULTA"],
    },
    {
      key: "caixa",
      title: "Caixa Diário",
      href: "caixa.html",
      icon: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
      roles: ["PROPRIETARIO", "ADMINISTRADOR", "RECEPCIONISTA"],
    },
    {
      key: "despesas",
      title: "Despesas",
      href: "despesas.html",
      icon: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>`,
      roles: ["PROPRIETARIO", "ADMINISTRADOR"],
    },
    {
      key: "acesso",
      title: "Controle de Acesso",
      href: "acesso.html",
      icon: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-.9-2.2"/><path d="M19 12h-2"/><path d="m16 8-.9 2.2"/><path d="M12 7V5"/><path d="m8 8 .9 2.2"/><path d="M7 12H5"/><path d="m8 16 .9-2.2"/><path d="M12 19v-2"/></svg>`,
      roles: ["PROPRIETARIO", "ADMINISTRADOR", "RECEPCIONISTA", "CONSULTA"],
    },
    {
      key: "relatorios",
      title: "Relatórios",
      href: "relatorios.html",
      icon: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>`,
      roles: ["PROPRIETARIO", "ADMINISTRADOR"],
    },
    {
      key: "usuarios",
      title: "Equipe & Acessos",
      href: "usuarios.html",
      icon: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><circle cx="19" cy="11" r="2"/><path d="M19 8v1"/><path d="M19 13v1"/></svg>`,
      roles: ["PROPRIETARIO"],
    },
    {
      key: "configuracoes",
      title: "Configurações",
      href: "configuracoes.html",
      icon: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
      roles: ["PROPRIETARIO"],
    },
  ];

  // 2. Renderizar a Sidebar
  const sidebarEl = document.querySelector(".sidebar");
  if (sidebarEl) {
    let navLinksHtml = "";

    navItems.forEach((item) => {
      const isAllowed = currentRole === "PROPRIETARIO" || item.roles.includes(currentRole);
      if (!isAllowed) return;

      const isActive = item.key === activePageKey;
      navLinksHtml += `
        <li class="nav-item">
          <a href="${item.href}" class="nav-link ${isActive ? "active" : ""}">
            ${item.icon}
            <span>${item.title}</span>
          </a>
        </li>
      `;
    });

    sidebarEl.innerHTML = `
      <!-- Brand Header -->
      <div class="sidebar-header">
        <a href="dashboard.html" class="brand-link">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">FitControl</span>
            <span class="brand-subtitle">Gym Management</span>
          </div>
        </a>
      </div>

      <!-- Navigation Links -->
      <div class="sidebar-content">
        <div class="nav-section-title">Navegação Principal</div>
        <ul style="list-style: none;">
          ${navLinksHtml}
        </ul>
      </div>

      <!-- User Profile Footer -->
      <div class="sidebar-footer">
        <div class="user-profile-summary">
          <div class="user-avatar">${currentUser ? currentUser.name.charAt(0) : "U"}</div>
          <div class="user-info">
            <span class="user-name current-user-name">${currentUser ? currentUser.name : "Usuário"}</span>
            <span class="user-role-badge current-user-role">${fitAuth.getRoleLabel(currentRole)}</span>
          </div>
        </div>
        <button type="button" class="btn btn-outline btn-icon" title="Sair do Sistema" onclick="fitAuth.logout()" style="width: 32px; height: 32px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </button>
      </div>
    `;
  }

  // 3. Renderizar a Topbar
  const topbarEl = document.querySelector(".topbar");
  if (topbarEl) {
    topbarEl.innerHTML = `
      <div class="topbar-left">
        <button class="menu-toggle-btn" onclick="toggleMobileMenu()" title="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <div class="page-breadcrumb">
          <span>FitControl</span>
          <span>/</span>
          <strong>${pageBreadcrumb || "Painel"}</strong>
        </div>
      </div>

      <div class="topbar-right">
        <!-- Botão Rápido de Simulação de Catraca -->
        <button type="button" class="btn-simular-acesso" onclick="openAccessSimulationModal()" title="Simular Leitura Facial ou Liberação da Catraca">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Simular Catraca</span>
        </button>

        <!-- Seletor Rápido de Perfil para Demonstração Comercial -->
        <div class="role-switch-container" title="Alternar perfil para testar permissões RBAC">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <select id="topbar-role-select">
            <option value="PROPRIETARIO" ${currentRole === "PROPRIETARIO" ? "selected" : ""}>Proprietário</option>
            <option value="ADMINISTRADOR" ${currentRole === "ADMINISTRADOR" ? "selected" : ""}>Administrador</option>
            <option value="RECEPCIONISTA" ${currentRole === "RECEPCIONISTA" ? "selected" : ""}>Recepcionista</option>
            <option value="CONSULTA" ${currentRole === "CONSULTA" ? "selected" : ""}>Consulta (Somente Leitura)</option>
          </select>
        </div>

        <!-- Alternador de Tema Claro / Escuro -->
        <button type="button" class="theme-toggle-btn" onclick="toggleTheme()" title="Alternar tema"></button>
      </div>
    `;
  }

  // 4. Injetar Banner Informativo de Modo Demonstração (Portátil) no topo da aplicação
  const mainWrapper = document.querySelector(".main-wrapper");
  if (mainWrapper && !document.getElementById("demo-banner-top")) {
    const banner = document.createElement("div");
    banner.id = "demo-banner-top";
    banner.className = "demo-banner";
    banner.innerHTML = `
      <div class="flex items-center gap-2">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
        <span><strong>Versão Comercial Portátil:</strong> Execução nativa (HTML5, CSS3 & Vanilla JS). Todos os módulos operacionais com persistência local.</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs" style="opacity: 0.8;">Maceió - AL</span>
      </div>
    `;
    mainWrapper.insertBefore(banner, topbarEl);
  }

  // 5. Configurar Overlay Mobile
  let overlay = document.querySelector(".sidebar-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    overlay.onclick = closeMobileMenu;
    document.body.appendChild(overlay);
  }
}
