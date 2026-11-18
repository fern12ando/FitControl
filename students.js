/**
 * FITCONTROL — GERENCIAMENTO DE ALUNOS (CADASTRO, FILTROS, MATRÍCULAS E PERFIL)
 */

let allStudents = [];
let currentFilter = "TODOS";
let currentSearch = "";

function initStudentsPage() {
  allStudents = fitStorage.getStudents();
  setupPlanOptions();
  renderStudentsTable();

  // Escuta campo de busca
  const searchInput = document.getElementById("student-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderStudentsTable();
    });
  }

  // Escuta filtro de status
  const filterSelect = document.getElementById("student-status-filter");
  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      currentFilter = e.target.value;
      renderStudentsTable();
    });
  }

  // Máscaras de CPF e Telefone no formulário de cadastro
  const cpfInput = document.getElementById("new-student-cpf");
  if (cpfInput) {
    cpfInput.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
      else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
      else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
      e.target.value = v;
    });
  }

  const phoneInput = document.getElementById("new-student-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3");
      else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,5})/, "($1) $2");
      e.target.value = v;
    });
  }
}

function setupPlanOptions() {
  const plans = fitStorage.getPlans().filter((p) => p.active);
  const selects = [document.getElementById("new-student-plan"), document.getElementById("edit-student-plan")];
  
  selects.forEach((sel) => {
    if (!sel) return;
    sel.innerHTML = plans
      .map(
        (p) =>
          `<option value="${p.id}">${p.name} — ${formatCurrency(p.totalPrice)} (${p.durationMonths} ${
            p.durationMonths === 1 ? "mês" : "meses"
          })</option>`
      )
      .join("");
  });
}

function renderStudentsTable() {
  const tbody = document.getElementById("students-table-body");
  if (!tbody) return;

  const filtered = allStudents.filter((s) => {
    // Filtro de Status
    if (currentFilter !== "TODOS" && s.status !== currentFilter) return false;

    // Filtro de Busca
    if (currentSearch) {
      const name = (s.fullName || "").toLowerCase();
      const cpf = (s.cpf || "").replace(/\D/g, "");
      const phone = (s.phone || "").replace(/\D/g, "");
      const searchClean = currentSearch.replace(/\D/g, "");

      const matchesText = name.includes(currentSearch);
      const matchesCpf = searchClean && cpf.includes(searchClean);
      const matchesPhone = searchClean && phone.includes(searchClean);

      if (!matchesText && !matchesCpf && !matchesPhone) return false;
    }
    return true;
  });

  document.getElementById("students-count-badge").textContent = `${filtered.length} aluno(s)`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div class="empty-state-title">Nenhum aluno encontrado</div>
            <div class="empty-state-desc">Tente alterar os termos da busca ou cadastre um novo aluno.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((s) => {
      const days = daysUntilExpiration(s.membershipEnd);
      let expiryBadge = "";

      if (s.status !== "ATIVO") {
        expiryBadge = `<span class="badge badge-outline">Suspenso/Inativo</span>`;
      } else if (days < 0) {
        expiryBadge = `<span class="badge badge-danger">Vencido há ${Math.abs(days)}d</span>`;
      } else if (days <= 7) {
        expiryBadge = `<span class="badge badge-warning">Vence em ${days}d</span>`;
      } else {
        expiryBadge = `<span class="badge badge-success">${days} dias restantes</span>`;
      }

      const statusBadge =
        s.status === "ATIVO"
          ? `<span class="badge badge-success">Ativo</span>`
          : s.status === "SUSPENSO"
          ? `<span class="badge badge-warning">Suspenso</span>`
          : `<span class="badge badge-danger">${s.status}</span>`;

      return `
      <tr>
        <td>
          <div class="flex items-center gap-3">
            <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">
              ${s.fullName.charAt(0)}
            </div>
            <div>
              <div class="font-semibold">${s.fullName}</div>
              <div class="text-xs text-muted">Cadastrado em: ${formatDateBR(s.registrationDate)}</div>
            </div>
          </div>
        </td>
        <td>${formatCPF(s.cpf)}</td>
        <td>${formatPhone(s.phone)}</td>
        <td>
          <span class="font-medium">${s.planName || "Sem Plano"}</span>
        </td>
        <td>
          <div>${formatDateBR(s.membershipEnd)}</div>
          <div style="margin-top: 3px;">${expiryBadge}</div>
        </td>
        <td>${statusBadge}</td>
        <td class="text-right">
          <div class="flex items-center justify-end gap-1">
            <button class="btn btn-outline btn-sm btn-icon" title="Ver Perfil & Matrícula" onclick="viewStudentProfile('${s.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="btn btn-outline btn-sm btn-icon" title="Editar Aluno" onclick="openEditStudentModal('${s.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            <button class="btn btn-outline btn-sm btn-icon" title="Excluir Aluno" onclick="deleteStudentAction('${s.id}')" style="color: var(--danger);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

// Salvar Novo Aluno com Validações
function handleCreateStudent(e) {
  e.preventDefault();
  const fullName = document.getElementById("new-student-name").value.trim();
  const cpf = document.getElementById("new-student-cpf").value.trim();
  const phone = document.getElementById("new-student-phone").value.trim();
  const email = document.getElementById("new-student-email").value.trim();
  const birthDate = document.getElementById("new-student-birth").value;
  const address = document.getElementById("new-student-address").value.trim();
  const planId = document.getElementById("new-student-plan").value;
  const emergencyName = document.getElementById("new-student-emergency-name").value.trim();
  const emergencyPhone = document.getElementById("new-student-emergency-phone").value.trim();
  const notes = document.getElementById("new-student-notes").value.trim();

  // Validação de CPF
  if (!isValidCPF(cpf)) {
    alert("O CPF informado é inválido. Por favor, verifique os dígitos.");
    return;
  }

  // Previne duplicidade de CPF
  const exists = allStudents.some((s) => s.cpf.replace(/\D/g, "") === cpf.replace(/\D/g, ""));
  if (exists) {
    alert("Já existe um aluno cadastrado com este CPF.");
    return;
  }

  // Busca dados do plano selecionado
  const plan = fitStorage.getPlans().find((p) => p.id === planId);
  const now = new Date();
  const startDateStr = now.toISOString().slice(0, 10);
  const endDateStr = calculateExpirationDate(startDateStr, plan ? plan.durationMonths : 1);

  const newStudent = {
    fullName,
    cpf,
    phone,
    email,
    birthDate,
    address,
    planId,
    planName: plan ? plan.name : "Plano Padrão",
    membershipStart: startDateStr,
    membershipEnd: endDateStr,
    pricePaid: plan ? plan.totalPrice : 130.0,
    status: "ATIVO",
    emergencyContactName: emergencyName,
    emergencyPhone,
    notes,
    biometricConsent: true,
  };

  fitStorage.saveStudent(newStudent);

  // Gera o primeiro pagamento correspondente
  fitStorage.savePayment({
    studentId: newStudent.id,
    studentName: newStudent.fullName,
    planName: newStudent.planName,
    amount: newStudent.pricePaid,
    netAmount: newStudent.pricePaid,
    discount: 0,
    paymentMethod: "PIX",
    status: "PAGO",
    dueDate: startDateStr,
    paidAt: startDateStr,
    notes: `Matrícula inicial — ${newStudent.planName}`,
    operatorName: fitAuth.getCurrentUser()?.name || "Recepção",
  });

  allStudents = fitStorage.getStudents();
  renderStudentsTable();
  closeModal("new-student-modal");
  document.getElementById("new-student-form").reset();
  showToast("Aluno cadastrado com sucesso! Matrícula e pagamento gerados.");
}

// Perfil Detalhado do Aluno
function viewStudentProfile(studentId) {
  const student = fitStorage.getStudentById(studentId);
  if (!student) return;

  const modalBody = document.getElementById("profile-modal-body");
  const days = daysUntilExpiration(student.membershipEnd);

  const payments = fitStorage.getPayments().filter((p) => p.studentId === studentId);
  const accesses = fitStorage.getAccessEvents().filter((a) => a.studentName === student.fullName);

  modalBody.innerHTML = `
    <div style="display: flex; gap: 1.25rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem; margin-bottom: 1.25rem;">
      <div class="user-avatar" style="width: 58px; height: 58px; font-size: 1.3rem;">
        ${student.fullName.charAt(0)}
      </div>
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${student.fullName}</h2>
        <div class="text-sm text-muted">CPF: ${formatCPF(student.cpf)} • Tel: ${formatPhone(student.phone)}</div>
        <div style="margin-top: 0.35rem; display: flex; gap: 0.5rem;">
          <span class="badge ${student.status === "ATIVO" ? "badge-success" : "badge-warning"}">${student.status}</span>
          <span class="badge badge-purple">${student.planName || "Sem Plano"}</span>
        </div>
      </div>
    </div>

    <!-- Status do Plano Atual -->
    <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div class="text-xs text-muted uppercase font-bold">Vigência da Matrícula</div>
          <div style="font-size: 1.05rem; font-weight: 700;">
            ${formatDateBR(student.membershipStart)} até ${formatDateBR(student.membershipEnd)}
          </div>
          <div class="text-xs ${days < 0 ? "text-danger" : "text-muted"}" style="margin-top: 2px;">
            ${days < 0 ? `Vencido há ${Math.abs(days)} dia(s)` : `${days} dia(s) até o vencimento`}
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" onclick="renewStudentMembership('${student.id}')">Renovar Plano</button>
          <button class="btn btn-secondary btn-sm" onclick="toggleStudentStatus('${student.id}')">
            ${student.status === "ATIVO" ? "Suspender" : "Reativar"}
          </button>
        </div>
      </div>
    </div>

    <!-- Dados de Contato e Endereço -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem; margin-bottom: 1.25rem;">
      <div><strong>E-mail:</strong> ${student.email || "-"}</div>
      <div><strong>Nascimento:</strong> ${formatDateBR(student.birthDate)}</div>
      <div><strong>Endereço:</strong> ${student.address || "-"}</div>
      <div><strong>Emergência:</strong> ${student.emergencyContactName || "-"} (${formatPhone(student.emergencyPhone)})</div>
    </div>

    <!-- Histórico de Pagamentos Recentes -->
    <div style="margin-bottom: 1.25rem;">
      <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;">Histórico de Mensalidades</h4>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Método</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${
              payments.length > 0
                ? payments
                    .map(
                      (p) => `
              <tr>
                <td>${formatDateBR(p.dueDate)}</td>
                <td>${formatCurrency(p.netAmount)}</td>
                <td><span class="badge badge-outline">${p.paymentMethod}</span></td>
                <td><span class="badge ${p.status === "PAGO" ? "badge-success" : "badge-warning"}">${p.status}</span></td>
              </tr>
            `
                    )
                    .join("")
                : `<tr><td colspan="4" class="text-center text-muted">Nenhum pagamento registrado</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  openModal("profile-modal");
}

// Renovar Matrícula
function renewStudentMembership(studentId) {
  const student = fitStorage.getStudentById(studentId);
  if (!student) return;

  const plan = fitStorage.getPlans().find((p) => p.id === student.planId) || fitStorage.getPlans()[0];
  const newStart = new Date().toISOString().slice(0, 10);
  const newEnd = calculateExpirationDate(newStart, plan ? plan.durationMonths : 1);

  student.membershipStart = newStart;
  student.membershipEnd = newEnd;
  student.status = "ATIVO";
  fitStorage.saveStudent(student);

  // Registra novo pagamento
  fitStorage.savePayment({
    studentId: student.id,
    studentName: student.fullName,
    planName: plan ? plan.name : student.planName,
    amount: plan ? plan.totalPrice : 130.0,
    netAmount: plan ? plan.totalPrice : 130.0,
    discount: 0,
    paymentMethod: "PIX",
    status: "PAGO",
    dueDate: newStart,
    paidAt: newStart,
    notes: `Renovação de contrato — ${plan ? plan.name : "Plano"}`,
    operatorName: fitAuth.getCurrentUser()?.name || "Recepção",
  });

  allStudents = fitStorage.getStudents();
  renderStudentsTable();
  viewStudentProfile(studentId);
  showToast("Matrícula renovada com sucesso!");
}

// Suspender ou Reativar
function toggleStudentStatus(studentId) {
  const student = fitStorage.getStudentById(studentId);
  if (!student) return;

  student.status = student.status === "ATIVO" ? "SUSPENSO" : "ATIVO";
  fitStorage.saveStudent(student);

  allStudents = fitStorage.getStudents();
  renderStudentsTable();
  viewStudentProfile(studentId);
  showToast(`Status do aluno alterado para: ${student.status}`);
}

// Excluir Aluno
function deleteStudentAction(studentId) {
  const student = fitStorage.getStudentById(studentId);
  if (!student) return;

  if (confirm(`Tem certeza que deseja excluir o cadastro de ${student.fullName}?`)) {
    fitStorage.deleteStudent(studentId);
    allStudents = fitStorage.getStudents();
    renderStudentsTable();
    showToast("Aluno removido com sucesso.");
  }
}
