/**
 * FITCONTROL — GERENCIAMENTO DE INTERFACE (UI, TOASTS, MODAIS & SIMULADOR)
 */

// Toast Notifications
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconSvg =
    type === "success"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
      : type === "error"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

  toast.innerHTML = `
    <span>${iconSvg}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.25s ease-out";
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Modal Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Mobile Sidebar Drawer
function toggleMobileMenu() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  }
}

function closeMobileMenu() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }
}

// Simulador Global de Catraca & Reconhecimento Facial
function openAccessSimulationModal() {
  let modal = document.getElementById("access-simulation-modal");
  if (!modal) {
    modal = createSimulationModalElement();
    document.body.appendChild(modal);
  }
  resetSimulationForm();
  openModal("access-simulation-modal");
}

function createSimulationModalElement() {
  const div = document.createElement("div");
  div.id = "access-simulation-modal";
  div.className = "modal-overlay";
  div.innerHTML = `
    <div class="modal-content" style="max-width: 580px;">
      <div class="modal-header" style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(99, 102, 241, 0.05));">
        <div class="flex items-center gap-3">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(124, 58, 237, 0.2); color: #8b5cf6; display: flex; align-items: center; justify-content: center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-.9-2.2"/><path d="M19 12h-2"/><path d="m16 8-.9 2.2"/><path d="M12 7V5"/><path d="m8 8 .9 2.2"/><path d="M7 12H5"/><path d="m8 16 .9-2.2"/><path d="M12 19v-2"/></svg>
          </div>
          <div>
            <h3 class="modal-title" style="font-size: 1.1rem;">Simulador de Catraca & Facial</h3>
            <span class="badge badge-purple" style="font-size: 0.65rem; margin-top: 2px;">MODO HOMOLOGAÇÃO / DEMO</span>
          </div>
        </div>
        <button class="modal-close-btn" onclick="closeModal('access-simulation-modal')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="text-sm text-muted" style="margin-bottom: 1rem;">
          Valida as regras de negócio de acesso físico (período de tolerância, carência, situação financeira e plano ativo).
        </p>

        <!-- Teste Rápido de Alunos -->
        <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 1rem;">
          <label class="form-label" style="font-size: 0.75rem; margin-bottom: 0.5rem;">Preencher com aluno de teste:</label>
          <div class="flex gap-2 flex-wrap">
            <button type="button" class="btn btn-outline btn-sm" onclick="quickFillSimulation('123.456.789-00')">Luis Fernando (Plano VIP)</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="quickFillSimulation('234.567.890-11')">Mariana Costa (Trimestral)</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="quickFillSimulation('456.789.012-33')">Camila Duarte (Suspenso)</button>
          </div>
        </div>

        <form id="sim-access-form" onsubmit="executeAccessSimulation(event)">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label">CPF ou ID do Aluno <span class="required">*</span></label>
            <input type="text" id="sim-identifier" class="form-input" placeholder="Digite o CPF do aluno..." required />
          </div>

          <div class="grid grid-cols-2 gap-3" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label class="form-label">Dispositivo de Acesso</label>
              <select id="sim-device" class="form-select">
                <option value="Terminal Facial 01">Terminal Facial 01 (Catraca)</option>
                <option value="Catraca Principal (Entrada)">Catraca Principal (Entrada)</option>
                <option value="Leitor Biométrico VIP">Leitor Biométrico VIP</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Sentido do Fluxo</label>
              <select id="sim-event-type" class="form-select">
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full" id="btn-run-sim">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Validar e Liberar Catraca
          </button>
        </form>

        <!-- Resultado da Simulação -->
        <div id="sim-result-box" style="display: none; margin-top: 1.25rem;"></div>
      </div>
    </div>
  `;
  return div;
}

function quickFillSimulation(cpf) {
  const input = document.getElementById("sim-identifier");
  if (input) input.value = cpf;
}

function resetSimulationForm() {
  const box = document.getElementById("sim-result-box");
  if (box) box.style.display = "none";
}

function executeAccessSimulation(e) {
  e.preventDefault();
  const identifier = document.getElementById("sim-identifier").value.trim();
  const deviceName = document.getElementById("sim-device").value;
  const eventType = document.getElementById("sim-event-type").value;
  const resultBox = document.getElementById("sim-result-box");

  if (!identifier) return;

  const students = fitStorage.getStudents();
  const cleanId = identifier.replace(/\D/g, "");

  // Localiza aluno por CPF limpo ou formatado
  const student = students.find((s) => {
    const sCpfClean = String(s.cpf || "").replace(/\D/g, "");
    return sCpfClean === cleanId || s.id === identifier;
  });

  let authorized = false;
  let reason = "";

  if (!student) {
    authorized = false;
    reason = "Aluno não encontrado no banco de dados da academia.";
  } else if (student.status === "SUSPENSO") {
    authorized = false;
    reason = "Acesso negado: matrícula temporariamente suspensa/congelada.";
  } else if (student.status === "INATIVO" || student.status === "BLOQUEADO") {
    authorized = false;
    reason = "Acesso negado: cadastro inativo na administração.";
  } else {
    // Verifica data de vencimento
    const days = daysUntilExpiration(student.membershipEnd);
    const settings = fitStorage.getSettings();
    const gracePeriod = settings.gracePeriodDays || 2;

    if (days < -gracePeriod) {
      authorized = false;
      reason = `Acesso negado: plano vencido há ${Math.abs(days)} dias (tolerância limite de ${gracePeriod} dias excedida).`;
    } else if (days < 0) {
      authorized = true;
      reason = `Acesso liberado sob tolerância (vencido há ${Math.abs(days)} dia(s)). Favor regularizar pagamento no balcão.`;
    } else {
      authorized = true;
      reason = `Acesso autorizado com sucesso! Plano ${student.planName || "Ativo"} válido até ${formatDateBR(student.membershipEnd)}.`;
    }
  }

  // Registra o evento de acesso no log histórico do FitControl
  fitStorage.logAccessEvent({
    studentName: student ? student.fullName : "Desconhecido / Não Cadastrado",
    identifier: identifier,
    deviceName: deviceName,
    eventType: eventType,
    result: authorized ? "AUTORIZADO" : "NEGADO",
    reason: reason,
  });

  // Exibe resultado visual moderno na tela
  resultBox.style.display = "block";
  resultBox.innerHTML = `
    <div style="padding: 1.25rem; border-radius: var(--radius-md); border: 2px solid ${
      authorized ? "var(--success)" : "var(--danger)"
    }; background: ${
    authorized ? "var(--success-bg)" : "var(--danger-bg)"
  }; display: flex; flex-direction: column; gap: 0.5rem;">
      <div class="flex items-center gap-3">
        <div style="width: 36px; height: 36px; border-radius: 50%; background: ${
          authorized ? "var(--success)" : "var(--danger)"
        }; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
          ${
            authorized
              ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`
              : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
          }
        </div>
        <div>
          <div style="font-weight: 700; font-size: 1.05rem; color: ${
            authorized ? "var(--success-text)" : "var(--danger-text)"
          };">
            ${authorized ? "ACESSO LIBERADO — CATRACA ABERTA" : "ACESSO BLOQUEADO"}
          </div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">
            ${student ? student.fullName : "Identificador: " + identifier}
          </div>
        </div>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
        ${reason}
      </p>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted);">
        <span><strong>Dispositivo:</strong> ${deviceName}</span> • 
        <span><strong>Fluxo:</strong> ${eventType}</span> • 
        <span><strong>Horário:</strong> ${formatDateTimeBR(new Date())}</span>
      </div>
    </div>
  `;

  showToast(authorized ? "Catraca Liberada com Sucesso!" : "Acesso Recusado!", authorized ? "success" : "error");

  // Se a página de acesso estiver aberta, atualiza a tabela de logs em tempo real
  if (typeof renderAccessEventsTable === "function") {
    renderAccessEventsTable();
  }
}

// Configura elementos dinâmicos do topo (Seletor de perfis, nome do usuário, etc.)
document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  // Atualiza informações do usuário atual na sidebar e topbar
  const currentUser = fitAuth.getCurrentUser();
  if (currentUser) {
    const userRoleLabels = document.querySelectorAll(".current-user-role");
    userRoleLabels.forEach((el) => {
      el.textContent = fitAuth.getRoleLabel(currentUser.role);
    });

    const userNameLabels = document.querySelectorAll(".current-user-name");
    userNameLabels.forEach((el) => {
      el.textContent = currentUser.name;
    });

    // Seletor de Role na topbar
    const roleSelect = document.getElementById("topbar-role-select");
    if (roleSelect) {
      roleSelect.value = currentUser.role;
      roleSelect.addEventListener("change", (e) => {
        fitAuth.switchRole(e.target.value);
      });
    }
  }
});
