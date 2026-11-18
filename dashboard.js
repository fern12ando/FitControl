/**
 * FITCONTROL — DASHBOARD ADMINISTRATIVO (LÓGICA E MÉTRICAS)
 * Consolida métricas financeiras, operacionais e de acesso em tempo real.
 */

function initDashboard() {
  const students = fitStorage.getStudents();
  const payments = fitStorage.getPayments();
  const expenses = fitStorage.getExpenses();
  const accessEvents = fitStorage.getAccessEvents();
  const plans = fitStorage.getPlans();

  // 1. Cálculos de Alunos
  const activeStudents = students.filter((s) => s.status === "ATIVO");
  const inactiveStudents = students.filter((s) => s.status !== "ATIVO");

  let expiringSoonCount = 0;
  let overdueCount = 0;

  students.forEach((s) => {
    if (s.status === "ATIVO") {
      const days = daysUntilExpiration(s.membershipEnd);
      if (days >= 0 && days <= 7) expiringSoonCount++;
      if (days < 0) overdueCount++;
    }
  });

  // 2. Cálculos Financeiros
  const paidPayments = payments.filter((p) => p.status === "PAGO");
  const totalRevenue = paidPayments.reduce((acc, p) => acc + (Number(p.netAmount) || 0), 0);

  const paidExpenses = expenses.filter((e) => e.status === "PAGA");
  const totalExpenses = paidExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  const netBalance = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netBalance / totalRevenue) * 100 : 0;

  // 3. Acessos do Dia
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayAccess = accessEvents.filter((ev) => ev.timestamp && ev.timestamp.startsWith(todayISO));
  const authorizedToday = todayAccess.filter((ev) => ev.result === "AUTORIZADO").length;
  const deniedToday = todayAccess.filter((ev) => ev.result === "NEGADO").length;

  // Atualizar Elementos no DOM
  document.getElementById("kpi-active-students").textContent = activeStudents.length;
  document.getElementById("kpi-inactive-students").textContent = inactiveStudents.length;
  document.getElementById("kpi-expiring-soon").textContent = expiringSoonCount;
  document.getElementById("kpi-overdue-students").textContent = overdueCount;

  document.getElementById("kpi-revenue").textContent = formatCurrency(totalRevenue);
  document.getElementById("kpi-expenses").textContent = formatCurrency(totalExpenses);
  
  const balanceEl = document.getElementById("kpi-net-balance");
  balanceEl.textContent = formatCurrency(netBalance);
  if (netBalance >= 0) {
    balanceEl.classList.remove("text-danger");
    balanceEl.classList.add("text-success");
  } else {
    balanceEl.classList.remove("text-success");
    balanceEl.classList.add("text-danger");
  }

  document.getElementById("kpi-margin").textContent = profitMargin.toFixed(1) + "%";
  document.getElementById("kpi-access-today").textContent = todayAccess.length;
  document.getElementById("kpi-access-auth").textContent = authorizedToday;
  document.getElementById("kpi-access-denied").textContent = deniedToday;

  // Renderizar Gráficos SVG Nativos (Sem dependência de rede)
  renderRevenueChart(totalRevenue, totalExpenses);
  renderPlansPieChart(students, plans);

  // Renderizar Tabelas Recentes
  renderRecentPayments(payments.slice(0, 5));
  renderRecentStudents(students.slice(0, 5));
}

// Gráfico de Barras Financeiro em SVG Puro
function renderRevenueChart(revenue, expenses) {
  const container = document.getElementById("revenue-chart-container");
  if (!container) return;

  const maxVal = Math.max(revenue, expenses, 1000);
  const revHeight = Math.max(15, Math.round((revenue / maxVal) * 180));
  const expHeight = Math.max(15, Math.round((expenses / maxVal) * 180));

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; justify-content: center; gap: 3rem; height: 220px; padding-top: 1rem;">
      <!-- Barra de Receitas -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.8rem; font-weight: 700; color: #10b981;">${formatCurrency(revenue)}</span>
        <div style="width: 58px; height: ${revHeight}px; background: linear-gradient(180deg, #10b981, #059669); border-radius: 8px 8px 0 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);"></div>
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Receitas</span>
      </div>

      <!-- Barra de Despesas -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.8rem; font-weight: 700; color: #ef4444;">${formatCurrency(expenses)}</span>
        <div style="width: 58px; height: ${expHeight}px; background: linear-gradient(180deg, #ef4444, #dc2626); border-radius: 8px 8px 0 0; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);"></div>
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Despesas</span>
      </div>
    </div>
  `;
}

// Distribuição de Planos em Barras Horizontais com Percentuais
function renderPlansPieChart(students, plans) {
  const container = document.getElementById("plans-chart-container");
  if (!container) return;

  const total = students.length || 1;
  const planCounts = {};

  plans.forEach((p) => {
    planCounts[p.name] = 0;
  });

  students.forEach((s) => {
    const name = s.planName || "Sem Plano";
    planCounts[name] = (planCounts[name] || 0) + 1;
  });

  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];
  let html = `<div style="display: flex; flex-direction: column; gap: 0.85rem; padding: 0.5rem 0;">`;

  Object.keys(planCounts).forEach((planName, idx) => {
    const count = planCounts[planName];
    const pct = Math.round((count / total) * 100);
    const color = colors[idx % colors.length];

    html += `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.825rem; font-weight: 600; margin-bottom: 0.35rem;">
          <span style="color: var(--text-primary);">${planName}</span>
          <span style="color: var(--text-muted);">${count} alunos (${pct}%)</span>
        </div>
        <div style="width: 100%; height: 8px; background: var(--bg-hover); border-radius: 999px; overflow: hidden;">
          <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 999px;"></div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// Pagamentos Recentes
function renderRecentPayments(payments) {
  const tbody = document.getElementById("recent-payments-tbody");
  if (!tbody) return;

  if (payments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum pagamento registrado</td></tr>`;
    return;
  }

  tbody.innerHTML = payments
    .map((p) => {
      const badgeClass =
        p.status === "PAGO"
          ? "badge-success"
          : p.status === "PENDENTE"
          ? "badge-warning"
          : "badge-danger";

      return `
      <tr>
        <td><strong>${p.studentName || "Aluno Avulso"}</strong></td>
        <td>${p.planName || "-"}</td>
        <td><span class="badge badge-outline">${p.paymentMethod}</span></td>
        <td class="font-semibold">${formatCurrency(p.netAmount)}</td>
        <td><span class="badge ${badgeClass}">${p.status}</span></td>
      </tr>
    `;
    })
    .join("");
}

// Alunos Recentes
function renderRecentStudents(students) {
  const tbody = document.getElementById("recent-students-tbody");
  if (!tbody) return;

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum aluno cadastrado</td></tr>`;
    return;
  }

  tbody.innerHTML = students
    .map((s) => {
      const badgeClass =
        s.status === "ATIVO"
          ? "badge-success"
          : s.status === "SUSPENSO"
          ? "badge-warning"
          : "badge-danger";

      return `
      <tr>
        <td>
          <div class="font-semibold">${s.fullName}</div>
          <div class="text-xs text-muted">${formatCPF(s.cpf)}</div>
        </td>
        <td>${s.planName || "-"}</td>
        <td>${formatDateBR(s.membershipEnd)}</td>
        <td><span class="badge ${badgeClass}">${s.status}</span></td>
      </tr>
    `;
    })
    .join("");
}
