/**
 * FITCONTROL — GERENCIAMENTO DE EQUIPE & CONTROLE DE USUÁRIOS
 * Cadastro de funcionários, atribuição de perfis e controle de acesso.
 */

let allUsers = [];

function initUsersPage() {
  renderUsersTable();
}

function renderUsersTable() {
  allUsers = fitStorage.getUsers();
  const tbody = document.getElementById("users-table-body");
  if (!tbody) return;

  tbody.innerHTML = allUsers
    .map((u) => {
      const badgeClass =
        u.role === "PROPRIETARIO"
          ? "badge-purple"
          : u.role === "ADMINISTRADOR"
          ? "badge-info"
          : u.role === "RECEPCIONISTA"
          ? "badge-success"
          : "badge-outline";

      return `
      <tr>
        <td>
          <div class="flex items-center gap-3">
            <div class="user-avatar" style="width: 34px; height: 34px; font-size: 0.8rem;">
              ${u.name.charAt(0)}
            </div>
            <div>
              <div class="font-semibold">${u.name}</div>
              <div class="text-xs text-muted">${u.phone || "Sem telefone"}</div>
            </div>
          </div>
        </td>
        <td>${u.email}</td>
        <td><span class="badge ${badgeClass}">${fitAuth.getRoleLabel(u.role)}</span></td>
        <td>
          <span class="badge ${u.active ? "badge-success" : "badge-danger"}">${u.active ? "Ativo" : "Bloqueado"}</span>
        </td>
        <td class="text-right">
          <button class="btn btn-outline btn-sm" onclick="toggleUserStatus('${u.id}')">
            ${u.active ? "Bloquear" : "Ativar"}
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

function handleCreateUser(e) {
  e.preventDefault();
  const name = document.getElementById("user-name").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const role = document.getElementById("user-role").value;
  const phone = document.getElementById("user-phone").value.trim();

  if (!name || !email) {
    alert("Informe o nome e o e-mail do colaborador.");
    return;
  }

  fitStorage.saveUser({
    name,
    email,
    role,
    phone,
    active: true,
  });

  renderUsersTable();
  closeModal("new-user-modal");
  document.getElementById("new-user-form").reset();
  showToast("Colaborador cadastrado com sucesso!");
}

function toggleUserStatus(userId) {
  const user = allUsers.find((u) => u.id === userId);
  if (!user) return;

  user.active = !user.active;
  fitStorage.saveUser(user);
  renderUsersTable();
  showToast(`Acesso de ${user.name} ${user.active ? "ativado" : "bloqueado"}.`);
}
