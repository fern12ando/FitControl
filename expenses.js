/**
 * FITCONTROL — GESTÃO DE DESPESAS & CONTROLE DE CUSTOS
 * Lançamento de despesas operacionais, centros de custo e baixas financeiras.
 */

let allExpenses = [];
let expenseCategoryFilter = "TODAS";
let expenseStatusFilter = "TODOS";
let expenseSearch = "";

const categoryLabels = {
  ALUGUEL: "Aluguel",
  ENERGIA: "Energia Elétrica",
  AGUA: "Água & Saneamento",
  INTERNET: "Internet & Telefonia",
  FUNCIONARIOS: "Salários & Equipe",
  MANUTENCAO: "Manutenção",
  MARKETING: "Marketing & Anúncios",
  EQUIPAMENTOS: "Equipamentos",
  IMPOSTOS: "Impostos & Taxas",
  OUTRAS: "Outras Despesas",
};

function initExpensesPage() {
  allExpenses = fitStorage.getExpenses();
  renderExpensesMetrics();
  renderExpensesTable();

  // Busca
  const searchInput = document.getElementById("expense-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      expenseSearch = e.target.value.toLowerCase().trim();
      renderExpensesTable();
    });
  }

  // Filtros
  const catSelect = document.getElementById("expense-category-filter");
  if (catSelect) {
    catSelect.addEventListener("change", (e) => {
      expenseCategoryFilter = e.target.value;
      renderExpensesTable();
    });
  }

  const statSelect = document.getElementById("expense-status-filter");
  if (statSelect) {
    statSelect.addEventListener("change", (e) => {
      expenseStatusFilter = e.target.value;
      renderExpensesTable();
    });
  }
}

function renderExpensesMetrics() {
  allExpenses = fitStorage.getExpenses();

  const paidExpenses = allExpenses.filter((e) => e.status === "PAGA");
  const pendingExpenses = allExpenses.filter((e) => e.status === "PENDENTE");

  const totalPaid = paidExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalPending = pendingExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // Maior Categoria
  const catSums = {};
  allExpenses.forEach((e) => {
    catSums[e.category] = (catSums[e.category] || 0) + (Number(e.amount) || 0);
  });

  let topCategory = "-";
  let topAmount = 0;
  Object.keys(catSums).forEach((cat) => {
    if (catSums[cat] > topAmount) {
      topAmount = catSums[cat];
      topCategory = categoryLabels[cat] || cat;
    }
  });

  document.getElementById("kpi-expenses-paid").textContent = formatCurrency(totalPaid);
  document.getElementById("kpi-expenses-pending").textContent = formatCurrency(totalPending);
  document.getElementById("kpi-expenses-top-cat").textContent = topCategory;
}

function renderExpensesTable() {
  allExpenses = fitStorage.getExpenses();
  const tbody = document.getElementById("expenses-table-body");
  if (!tbody) return;

  const filtered = allExpenses.filter((e) => {
    if (expenseCategoryFilter !== "TODAS" && e.category !== expenseCategoryFilter) return false;
    if (expenseStatusFilter !== "TODOS" && e.status !== expenseStatusFilter) return false;

    if (expenseSearch) {
      const title = (e.title || "").toLowerCase();
      const rec = (e.recipient || "").toLowerCase();
      if (!title.includes(expenseSearch) && !rec.includes(expenseSearch)) return false;
    }
    return true;
  });

  document.getElementById("expenses-count-badge").textContent = `${filtered.length} despesa(s)`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/></svg>
            </div>
            <div class="empty-state-title">Nenhuma despesa encontrada</div>
            <div class="empty-state-desc">Ajuste os filtros ou registre um novo custo operacional.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((e) => {
      const badgeClass =
        e.status === "PAGA" ? "badge-success" : e.status === "PENDENTE" ? "badge-warning" : "badge-danger";

      return `
      <tr>
        <td>
          <div class="font-semibold">${e.title}</div>
          <div class="text-xs text-muted">${e.recipient || "Fornecedor não especificado"}</div>
        </td>
        <td>
          <span class="badge badge-purple">${categoryLabels[e.category] || e.category}</span>
        </td>
        <td>${formatDateBR(e.dueDate)}</td>
        <td><span class="badge badge-outline">${e.paymentMethod || "Dinheiro"}</span></td>
        <td class="font-semibold text-danger">${formatCurrency(e.amount)}</td>
        <td><span class="badge ${badgeClass}">${e.status}</span></td>
        <td class="text-right">
          ${
            e.status === "PENDENTE"
              ? `<button class="btn btn-outline btn-sm" title="Marcar como Paga" onclick="markExpensePaid('${e.id}')" style="color: var(--success); border-color: var(--success);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Pagar</span>
                </button>`
              : `<span class="text-xs text-muted">Concluída</span>`
          }
        </td>
      </tr>
    `;
    })
    .join("");
}

function handleCreateExpense(e) {
  e.preventDefault();
  const title = document.getElementById("expense-title").value.trim();
  const category = document.getElementById("expense-category").value;
  const amount = parseFloat(document.getElementById("expense-amount").value) || 0;
  const dueDate = document.getElementById("expense-due-date").value;
  const recipient = document.getElementById("expense-recipient").value.trim();
  const paymentMethod = document.getElementById("expense-method").value;
  const status = document.getElementById("expense-status").value;
  const notes = document.getElementById("expense-notes").value.trim();

  if (!title || amount <= 0) {
    alert("Informe o título e o valor da despesa.");
    return;
  }

  const expense = {
    title,
    category,
    amount,
    dueDate,
    paidAt: status === "PAGA" ? dueDate : null,
    recipient,
    paymentMethod,
    status,
    notes,
  };

  fitStorage.saveExpense(expense);
  renderExpensesMetrics();
  renderExpensesTable();
  closeModal("new-expense-modal");
  document.getElementById("new-expense-form").reset();
  showToast("Despesa cadastrada com sucesso!");
}

function markExpensePaid(id) {
  const expense = allExpenses.find((e) => e.id === id);
  if (!expense) return;

  expense.status = "PAGA";
  expense.paidAt = new Date().toISOString().slice(0, 10);
  fitStorage.saveExpense(expense);

  renderExpensesMetrics();
  renderExpensesTable();
  showToast("Despesa marcada como paga!");
}
