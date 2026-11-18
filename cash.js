/**
 * FITCONTROL — GERENCIAMENTO DE CAIXA DIÁRIO & MOVIMENTAÇÕES
 * Abertura, fechamento com conferência física, sangrias, suprimentos e auditoria.
 */

function initCashPage() {
  renderCashStatus();
}

function renderCashStatus() {
  const cash = fitStorage.getCash();
  const isAberto = cash && cash.status === "ABERTO";

  // Indicador de Status
  const statusBadge = document.getElementById("cash-status-badge");
  const openBtn = document.getElementById("btn-open-cash");
  const closeBtn = document.getElementById("btn-close-cash");
  const sangriaBtn = document.getElementById("btn-sangria");
  const suprimentoBtn = document.getElementById("btn-suprimento");

  if (isAberto) {
    statusBadge.className = "badge badge-success";
    statusBadge.textContent = "Caixa Aberto";
    if (openBtn) openBtn.style.display = "none";
    if (closeBtn) closeBtn.style.display = "inline-flex";
    if (sangriaBtn) sangriaBtn.disabled = false;
    if (suprimentoBtn) suprimentoBtn.disabled = false;
  } else {
    statusBadge.className = "badge badge-outline";
    statusBadge.textContent = "Caixa Fechado";
    if (openBtn) openBtn.style.display = "inline-flex";
    if (closeBtn) closeBtn.style.display = "none";
    if (sangriaBtn) sangriaBtn.disabled = true;
    if (suprimentoBtn) suprimentoBtn.disabled = true;
  }

  // Cálculos de Movimentações
  const movements = (cash && cash.movements) || [];
  let totalEntradas = 0;
  let totalSaidas = 0;
  let totalSuprimentos = 0;
  let totalSangrias = 0;

  movements.forEach((m) => {
    const val = Number(m.amount) || 0;
    if (m.type === "ENTRADA") totalEntradas += val;
    else if (m.type === "SAIDA") totalSaidas += val;
    else if (m.type === "SUPRIMENTO") totalSuprimentos += val;
    else if (m.type === "SANGRIA") totalSangrias += val;
  });

  const saldoInicial = Number(cash.initialAmount) || 0;
  const saldoEsperado = saldoInicial + totalEntradas + totalSuprimentos - totalSaidas - totalSangrias;

  document.getElementById("cash-initial-amount").textContent = formatCurrency(saldoInicial);
  document.getElementById("cash-total-inflows").textContent = formatCurrency(totalEntradas + totalSuprimentos);
  document.getElementById("cash-total-outflows").textContent = formatCurrency(totalSaidas + totalSangrias);
  document.getElementById("cash-expected-balance").textContent = formatCurrency(saldoEsperado);

  document.getElementById("cash-opened-by").textContent = cash.openedBy || "-";
  document.getElementById("cash-opened-at").textContent = cash.openedAt || "-";

  renderMovementsTable(movements);
}

function renderMovementsTable(movements) {
  const tbody = document.getElementById("cash-movements-tbody");
  if (!tbody) return;

  if (movements.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhuma movimentação registrada no turno atual</td></tr>`;
    return;
  }

  tbody.innerHTML = movements
    .slice()
    .reverse()
    .map((m) => {
      const isPositive = m.type === "ENTRADA" || m.type === "SUPRIMENTO";
      const badgeClass =
        m.type === "ENTRADA"
          ? "badge-success"
          : m.type === "SUPRIMENTO"
          ? "badge-info"
          : "badge-danger";

      return `
      <tr>
        <td>${m.timestamp}</td>
        <td><span class="badge ${badgeClass}">${m.type}</span></td>
        <td>${m.description}</td>
        <td class="font-semibold ${isPositive ? "text-success" : "text-danger"}">
          ${isPositive ? "+" : "-"} ${formatCurrency(m.amount)}
        </td>
        <td>${m.operator}</td>
      </tr>
    `;
    })
    .join("");
}

// Abrir Caixa
function handleOpenCashSubmit(e) {
  e.preventDefault();
  const initial = parseFloat(document.getElementById("open-initial-amount").value) || 0;
  const currentUser = fitAuth.getCurrentUser();

  fitStorage.openCash(initial, currentUser ? currentUser.name : "Operador");
  renderCashStatus();
  closeModal("open-cash-modal");
  showToast("Caixa diário aberto com sucesso!");
}

// Fechar Caixa com Conferência
function openCloseCashModal() {
  const cash = fitStorage.getCash();
  const movements = cash.movements || [];

  let totalEntradas = 0;
  let totalSaidas = 0;
  movements.forEach((m) => {
    const val = Number(m.amount) || 0;
    if (m.type === "ENTRADA" || m.type === "SUPRIMENTO") totalEntradas += val;
    else totalSaidas += val;
  });

  const saldoEsperado = (Number(cash.initialAmount) || 0) + totalEntradas - totalSaidas;
  document.getElementById("close-expected-amount").textContent = formatCurrency(saldoEsperado);
  document.getElementById("close-actual-amount").value = saldoEsperado.toFixed(2);
  openModal("close-cash-modal");
}

function handleCloseCashSubmit(e) {
  e.preventDefault();
  const actualAmount = parseFloat(document.getElementById("close-actual-amount").value) || 0;
  const notes = document.getElementById("close-notes").value.trim();
  const currentUser = fitAuth.getCurrentUser();

  fitStorage.closeCash(actualAmount, currentUser ? currentUser.name : "Operador", notes);
  renderCashStatus();
  closeModal("close-cash-modal");
  showToast("Caixa fechado com conferência registrada.");
}

// Movimentação (Sangria ou Suprimento)
function openMovementModal(type) {
  document.getElementById("movement-type").value = type;
  document.getElementById("movement-modal-title").textContent =
    type === "SANGRIA" ? "Realizar Sangria (Retirada)" : "Realizar Suprimento (Aporte)";
  document.getElementById("movement-amount").value = "";
  document.getElementById("movement-desc").value = "";
  openModal("cash-movement-modal");
}

function handleMovementSubmit(e) {
  e.preventDefault();
  const type = document.getElementById("movement-type").value;
  const amount = parseFloat(document.getElementById("movement-amount").value) || 0;
  const desc = document.getElementById("movement-desc").value.trim();

  if (amount <= 0 || !desc) {
    alert("Informe um valor e a justificativa da movimentação.");
    return;
  }

  const currentUser = fitAuth.getCurrentUser();
  fitStorage.addCashMovement(type, amount, desc, currentUser ? currentUser.name : "Operador");

  renderCashStatus();
  closeModal("cash-movement-modal");
  showToast(`${type === "SANGRIA" ? "Sangria" : "Suprimento"} registrado com sucesso!`);
}
