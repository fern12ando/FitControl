/**
 * FITCONTROL — GERENCIAMENTO DE PAGAMENTOS & EMISSÃO DE RECIBOS
 * Controle de recebimentos, baixas manuais, filtros por método e comprovantes.
 */

let allPayments = [];
let paymentStatusFilter = "TODOS";
let paymentMethodFilter = "TODOS";
let paymentSearch = "";

function initPaymentsPage() {
  allPayments = fitStorage.getPayments();
  setupStudentSelectOptions();
  renderPaymentsTable();

  // Busca
  const searchInput = document.getElementById("payment-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      paymentSearch = e.target.value.toLowerCase().trim();
      renderPaymentsTable();
    });
  }

  // Filtros
  const statusSelect = document.getElementById("payment-status-filter");
  if (statusSelect) {
    statusSelect.addEventListener("change", (e) => {
      paymentStatusFilter = e.target.value;
      renderPaymentsTable();
    });
  }

  const methodSelect = document.getElementById("payment-method-filter");
  if (methodSelect) {
    methodSelect.addEventListener("change", (e) => {
      paymentMethodFilter = e.target.value;
      renderPaymentsTable();
    });
  }
}

function setupStudentSelectOptions() {
  const students = fitStorage.getStudents();
  const sel = document.getElementById("new-pay-student");
  if (!sel) return;

  sel.innerHTML = `<option value="">Selecione o aluno...</option>` +
    students
      .map((s) => `<option value="${s.id}" data-amount="${s.pricePaid || 130}">${s.fullName} (${formatCPF(s.cpf)})</option>`)
      .join("");

  sel.addEventListener("change", (e) => {
    const selectedOption = sel.options[sel.selectedIndex];
    const defaultAmount = selectedOption.getAttribute("data-amount");
    if (defaultAmount) {
      document.getElementById("new-pay-amount").value = defaultAmount;
    }
  });
}

function renderPaymentsTable() {
  allPayments = fitStorage.getPayments();
  const tbody = document.getElementById("payments-table-body");
  if (!tbody) return;

  const filtered = allPayments.filter((p) => {
    if (paymentStatusFilter !== "TODOS" && p.status !== paymentStatusFilter) return false;
    if (paymentMethodFilter !== "TODOS" && p.paymentMethod !== paymentMethodFilter) return false;

    if (paymentSearch) {
      const studentName = (p.studentName || "").toLowerCase();
      const plan = (p.planName || "").toLowerCase();
      const notes = (p.notes || "").toLowerCase();
      if (!studentName.includes(paymentSearch) && !plan.includes(paymentSearch) && !notes.includes(paymentSearch)) {
        return false;
      }
    }
    return true;
  });

  document.getElementById("payments-count-badge").textContent = `${filtered.length} lançamento(s)`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <div class="empty-state-title">Nenhum pagamento encontrado</div>
            <div class="empty-state-desc">Ajuste os filtros ou cadastre um novo recebimento.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((p) => {
      const badgeClass =
        p.status === "PAGO"
          ? "badge-success"
          : p.status === "PENDENTE"
          ? "badge-warning"
          : "badge-danger";

      return `
      <tr>
        <td>
          <div class="font-semibold">${p.studentName || "Aluno Avulso"}</div>
          <div class="text-xs text-muted">${p.planName || "Mensalidade"}</div>
        </td>
        <td>${formatDateBR(p.dueDate)}</td>
        <td>${p.paidAt ? formatDateBR(p.paidAt) : '<span class="text-muted">-</span>'}</td>
        <td><span class="badge badge-outline">${p.paymentMethod}</span></td>
        <td class="font-semibold">${formatCurrency(p.netAmount)}</td>
        <td><span class="badge ${badgeClass}">${p.status}</span></td>
        <td class="text-right">
          <div class="flex items-center justify-end gap-1">
            ${
              p.status !== "PAGO"
                ? `<button class="btn btn-outline btn-sm" title="Confirmar Recebimento (Dar Baixa)" onclick="confirmPaymentAction('${p.id}')" style="color: var(--success); border-color: var(--success);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Baixa</span>
                  </button>`
                : ""
            }
            <button class="btn btn-outline btn-sm btn-icon" title="Imprimir Recibo" onclick="printReceipt('${p.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

function handleCreatePayment(e) {
  e.preventDefault();
  const studentId = document.getElementById("new-pay-student").value;
  const amount = parseFloat(document.getElementById("new-pay-amount").value) || 0;
  const discount = parseFloat(document.getElementById("new-pay-discount").value) || 0;
  const paymentMethod = document.getElementById("new-pay-method").value;
  const dueDate = document.getElementById("new-pay-date").value;
  const status = document.getElementById("new-pay-status").value;
  const notes = document.getElementById("new-pay-notes").value.trim();

  if (!studentId || amount <= 0) {
    alert("Selecione um aluno e informe um valor válido.");
    return;
  }

  const student = fitStorage.getStudentById(studentId);
  const netAmount = Math.max(0, amount - discount);
  const currentUser = fitAuth.getCurrentUser();

  const payment = {
    studentId,
    studentName: student ? student.fullName : "Aluno",
    planName: student ? student.planName : "Mensalidade",
    amount,
    discount,
    netAmount,
    paymentMethod,
    status,
    dueDate,
    paidAt: status === "PAGO" ? dueDate : null,
    notes,
    operatorName: currentUser?.name || "Recepção",
  };

  fitStorage.savePayment(payment);

  // Se o pagamento for em dinheiro e estiver pago, movimenta o caixa diário se estiver aberto
  if (status === "PAGO" && paymentMethod === "DINHEIRO") {
    const cash = fitStorage.getCash();
    if (cash && cash.status === "ABERTO") {
      fitStorage.addCashMovement("ENTRADA", netAmount, `Mensalidade Dinheiro — ${payment.studentName}`, currentUser?.name);
    }
  }

  renderPaymentsTable();
  closeModal("new-payment-modal");
  document.getElementById("new-payment-form").reset();
  showToast("Recebimento registrado com sucesso!");
}

function confirmPaymentAction(paymentId) {
  const p = fitStorage.confirmPayment(paymentId);
  if (p) {
    const currentUser = fitAuth.getCurrentUser();
    // Se recebido em dinheiro, soma no caixa
    if (p.paymentMethod === "DINHEIRO") {
      const cash = fitStorage.getCash();
      if (cash && cash.status === "ABERTO") {
        fitStorage.addCashMovement("ENTRADA", p.netAmount, `Recebimento Dinheiro — ${p.studentName}`, currentUser?.name);
      }
    }

    renderPaymentsTable();
    showToast("Baixa de pagamento confirmada!");
  }
}

// Emissão e Impressão de Recibo
function printReceipt(paymentId) {
  const payment = fitStorage.getPayments().find((p) => p.id === paymentId);
  if (!payment) return;

  const settings = fitStorage.getSettings();
  const student = fitStorage.getStudentById(payment.studentId);
  const modalBody = document.getElementById("receipt-modal-body");

  modalBody.innerHTML = `
    <div class="receipt-wrapper" id="printable-receipt-area">
      <div class="receipt-header">
        <div class="receipt-gym-name">${settings.gymName || "FitControl Academia"}</div>
        <div class="text-xs" style="color: #64748b; margin-top: 2px;">CNPJ: ${settings.cnpj} • ${settings.address}, ${settings.city} - ${settings.state}</div>
        <div class="receipt-title">Comprovante de Pagamento</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <div class="receipt-row">
          <span>Recibo Nº:</span>
          <strong>${payment.id.toUpperCase()}</strong>
        </div>
        <div class="receipt-row">
          <span>Data de Emissão:</span>
          <strong>${formatDateTimeBR(new Date())}</strong>
        </div>
        <div class="receipt-row">
          <span>Aluno:</span>
          <strong>${payment.studentName}</strong>
        </div>
        <div class="receipt-row">
          <span>CPF do Aluno:</span>
          <strong>${student ? formatCPF(student.cpf) : "-"}</strong>
        </div>
        <div class="receipt-row">
          <span>Referência / Plano:</span>
          <strong>${payment.planName}</strong>
        </div>
        <div class="receipt-row">
          <span>Forma de Pagamento:</span>
          <strong>${payment.paymentMethod}</strong>
        </div>
        <div class="receipt-row">
          <span>Operador Responsável:</span>
          <strong>${payment.operatorName || "Recepção"}</strong>
        </div>
      </div>

      <div class="receipt-total">
        <span>VALOR PAGO:</span>
        <span>${formatCurrency(payment.netAmount)}</span>
      </div>

      <div style="text-align: center; margin-top: 1.5rem; font-size: 0.75rem; color: #64748b;">
        <p>Agradecemos a sua preferência!</p>
        <p style="margin-top: 4px;">FitControl — Sistema Integrado de Gestão de Academias</p>
      </div>
    </div>
  `;

  openModal("receipt-modal");
}

function executePrintReceipt() {
  window.print();
}
