/**
 * FITCONTROL — GERENCIAMENTO DE SESSÃO & CONTROLE DE ACESSO RBAC
 * Controle de permissões por perfil (Proprietário, Administrador, Recepcionista, Consulta).
 */

const AUTH_STORAGE_KEY = "FITCONTROL_CURRENT_USER";

class FitAuth {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        // Padrão de demonstração comercial: logado como Proprietário
        const defaultUser = {
          id: "usr-1",
          name: "Luis Fernando",
          email: "proprietario@fitcontrol.com",
          role: "PROPRIETARIO",
          phone: "(82) 99999-1001",
        };
        this.setCurrentUser(defaultUser);
      }
    } catch (e) {
      console.error("Falha ao inicializar autenticação:", e);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  switchRole(newRole) {
    const users = fitStorage.getUsers();
    let targetUser = users.find((u) => u.role === newRole);
    if (!targetUser) {
      targetUser = {
        id: "usr-temp",
        name: `Usuário ${newRole}`,
        email: `${newRole.toLowerCase()}@fitcontrol.com`,
        role: newRole,
      };
    }
    this.setCurrentUser(targetUser);
    window.location.reload();
  }

  login(email, password) {
    const users = fitStorage.getUsers();
    const cleanEmail = String(email || "").trim().toLowerCase();
    
    // Procura usuário pelo email
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: "Usuário não encontrado com este e-mail." };
    }
    if (!user.active) {
      return { success: false, error: "Este acesso está desativado pela administração." };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = "login.html";
  }

  getRoleLabel(role) {
    switch (role) {
      case "PROPRIETARIO":
        return "Proprietário";
      case "ADMINISTRADOR":
        return "Administrador";
      case "RECEPCIONISTA":
        return "Recepcionista";
      case "CONSULTA":
        return "Consulta";
      default:
        return role || "Usuário";
    }
  }

  hasAccess(allowedRoles = []) {
    if (!this.currentUser) return false;
    if (this.currentUser.role === "PROPRIETARIO") return true;
    return allowedRoles.includes(this.currentUser.role);
  }

  enforcePageAccess(allowedRoles = []) {
    if (!this.currentUser) {
      window.location.href = "login.html";
      return false;
    }
    if (!this.hasAccess(allowedRoles)) {
      alert(`Acesso Restrito: Seu perfil atual (${this.getRoleLabel(this.currentUser.role)}) não possui permissão para acessar esta área.`);
      window.location.href = "dashboard.html";
      return false;
    }
    return true;
  }
}

// Instância Global de Autenticação
const fitAuth = new FitAuth();
