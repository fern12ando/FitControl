/**
 * FITCONTROL — RELATÓRIOS GERENCIAIS & EXPORTAÇÃO EXCEL OFICIAL
 * Relatórios financeiros, distribuição de alunos e geração de planilha
 * perfeitamente compatível com o Microsoft Excel Brasileiro (ponto e vírgula e decimais em vírgula).
 */

function initReportsPage() {
  renderReportsData();
}

function renderReportsData() {
  const students = fitStorage.getStudents();
  const payments = fitStorage.getPayments();
  const expenses = fitStorage.getExpenses();

  const paidPayments = payments.filter((p) => p.status === "PAGO");
  const totalRevenue = paidPayments.reduce((s, p) => s + (Number(p.netAmount) || 0), 0);

  const paidExpenses = expenses.filter((e) => e.status === "PAGA");
  const totalExpenses = paidExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const netBalance = totalRevenue - totalExpenses;
  const activeStudents = students.filter((s) => s.status === "ATIVO").length;

  document.getElementById("rep-revenue").textContent = formatCurrency(totalRevenue);
  document.getElementById("rep-expenses").textContent = formatCurrency(totalExpenses);
  document.getElementById("rep-net-balance").textContent = formatCurrency(netBalance);
  document.getElementById("rep-active-students").textContent = activeStudents;

  // Receitas por método
  renderMethodsBreakdown(paidPayments);
}

function renderMethodsBreakdown(paidPayments) {
  const container = document.getElementById("methods-breakdown-container");
  if (!container) return;

  const methods = ["PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO", "BOLETO"];
  const totals = {};
  let grandTotal = 0;

  methods.forEach((m) => (totals[m] = 0));
  paidPayments.forEach((p) => {
    totals[p.paymentMethod] = (totals[p.paymentMethod] || 0) + (Number(p.netAmount) || 0);
    grandTotal += Number(p.netAmount) || 0;
  });

  const methodNames = {
    PIX: "PIX Instantâneo",
    DINHEIRO: "Dinheiro em Espécie",
    CARTAO_CREDITO: "Cartão de Crédito",
    CARTAO_DEBITO: "Cartão de Débito",
    BOLETO: "Boleto Bancário",
  };

  container.innerHTML = methods
    .map((m) => {
      const val = totals[m] || 0;
      const pct = grandTotal > 0 ? Math.round((val / grandTotal) * 100) : 0;

      return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-bottom: 1px solid var(--border-color);">
        <div>
          <div class="font-semibold text-sm">${methodNames[m]}</div>
          <div class="text-xs text-muted">${pct}% do total recebido</div>
        </div>
        <div class="font-bold text-sm text-primary">${formatCurrency(val)}</div>
      </div>
    `;
    })
    .join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAÇÃO EXCEL (MODELO OFICIAL AVANÇADO DE GESTÃO DE ACADEMIA)
// Utiliza separador ponto-e-vírgula (;) e formatação brasileira para que o
// Excel abra com cada dado na sua coluna correta!
// ─────────────────────────────────────────────────────────────────────────────

function exportOfficialExcelModel() {
  const students = fitStorage.getStudents();
  const payments = fitStorage.getPayments();
  const expenses = fitStorage.getExpenses();
  const settings = fitStorage.getSettings();

  const paidPayments = payments.filter((p) => p.status === "PAGO");
  const totalRevenue = paidPayments.reduce((s, p) => s + (Number(p.netAmount) || 0), 0);

  const paidExpenses = expenses.filter((e) => e.status === "PAGA");
  const totalExpenses = paidExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const netBalance = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? (netBalance / totalRevenue) * 100 : 0;
  const activeStudentsCount = students.filter((s) => s.status === "ATIVO").length;

  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  // Cálculos por método
  const calcMethod = (m) =>
    paidPayments.filter((p) => p.paymentMethod === m).reduce((s, p) => s + (Number(p.netAmount) || 0), 0);
  const calcCat = (c) =>
    paidExpenses.filter((e) => e.category === c).reduce((s, e) => s + (Number(e.amount) || 0), 0);

  let vencem7 = 0;
  let vencidos = 0;
  students.forEach((s) => {
    if (s.status === "ATIVO") {
      const d = daysUntilExpiration(s.membershipEnd);
      if (d >= 0 && d <= 7) vencem7++;
      if (d < 0) vencidos++;
    }
  });

  const pendentesCount = payments.filter((p) => p.status === "PENDENTE").length;

  // Formatação de números padrão Brasil (vírgula decimal)
  const numBR = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const lines = [];

  // Instrução sep=; no topo para o Excel forçar o separador de colunas
  lines.push("sep=;");

  // 1. TÍTULO E DASHBOARD
  lines.push("FITCONTROL | PAINEL DE GESTÃO;;;;;;;;");
  lines.push('"Visão financeira, recebimentos, despesas, alunos e vencimentos.";;;;;;;;');
  lines.push(";;;;;;;;");
  lines.push(`Período de análise;${period};Altere a data para consultar outro mês;;;;;;`);
  lines.push(";;;;;;;;");

  // Linha de KPIs
  lines.push("RECEITA RECEBIDA;;DESPESAS PAGAS;;LUCRO OPERACIONAL;;MARGEM DE LUCRO;;ALUNOS ATIVOS");
  lines.push(`"R$ ${numBR(totalRevenue)}";;"R$ ${numBR(totalExpenses)}";;"R$ ${numBR(netBalance)}";;"${numBR(margin)}%";;${activeStudentsCount}`);
  lines.push(";;;;;;;;");

  // 2. TABELAS DE COMPOSIÇÃO
  lines.push("RECEITAS POR MÉTODO;;;DESPESAS POR CENTRO DE CUSTO;;;RETENÇÃO & VENCIMENTOS;;");
  lines.push("Método;Total Recebido;;Categoria;Total Pago;;Indicador;Quantidade;");
  lines.push(`PIX;"R$ ${numBR(calcMethod("PIX"))}";;Aluguel;"R$ ${numBR(calcCat("ALUGUEL"))}";;Alunos ativos;${activeStudentsCount};`);
  lines.push(`Dinheiro;"R$ ${numBR(calcMethod("DINHEIRO"))}";;Energia;"R$ ${numBR(calcCat("ENERGIA"))}";;Vencem em até 7 dias;${vencem7};`);
  lines.push(`Cartão de crédito;"R$ ${numBR(calcMethod("CARTAO_CREDITO"))}";;Água;"R$ ${numBR(calcCat("AGUA"))}";;Vencidos (ativos);${vencidos};`);
  lines.push(`Cartão de débito;"R$ ${numBR(calcMethod("CARTAO_DEBITO"))}";;Internet;"R$ ${numBR(calcCat("INTERNET"))}";;Pagamentos pendentes;${pendentesCount};`);
  lines.push(`Boleto;"R$ ${numBR(calcMethod("BOLETO"))}";;Salários;"R$ ${numBR(calcCat("FUNCIONARIOS"))}";;;;`);
  lines.push(`;;;Manutenção;"R$ ${numBR(calcCat("MANUTENCAO"))}";;;;`);
  lines.push(`;;;Marketing;"R$ ${numBR(calcCat("MARKETING"))}";;;;`);
  lines.push(`;;;Outros;"R$ ${numBR(calcCat("OUTRAS"))}";;;;`);
  lines.push(";;;;;;;;");

  // 3. CONTROLE DE RECEITAS
  lines.push("CONTROLE DE RECEITAS;;;;;;;;");
  lines.push("Registre cada recebimento. Valores formatados em padrão brasileiro (R$).;;;;;;;;");
  lines.push(";;;;;;;;");
  lines.push("Data;Aluno;Plano;Descrição;Método de pagamento;Valor (R$);Status;Mês;Ano");

  payments.forEach((p) => {
    const d = p.paidAt || p.dueDate;
    const dateObj = new Date(d);
    const mes = dateObj.toLocaleDateString("pt-BR", { month: "long" });
    const ano = dateObj.getFullYear();

    lines.push(
      `${formatDateBR(d)};"${p.studentName}";"${p.planName}";"${p.notes || "-"}";${p.paymentMethod};"${numBR(p.netAmount)}";${p.status};${mes};${ano}`
    );
  });

  lines.push(";;;;;;;;");

  // 4. CONTROLE DE DESPESAS
  lines.push("CONTROLE DE DESPESAS;;;;;;;");
  lines.push("Registre despesas e acompanhe o que já foi pago ou ainda está pendente.;;;;;;;");
  lines.push(";;;;;;;");
  lines.push("Data;Descrição;Centro de custo;Fornecedor;Forma de pagamento;Valor (R$);Status;Mês");

  expenses.forEach((e) => {
    const d = e.paidAt || e.dueDate;
    const dateObj = new Date(d);
    const mes = dateObj.toLocaleDateString("pt-BR", { month: "long" });

    lines.push(
      `${formatDateBR(d)};"${e.title}";"${e.category}";"${e.recipient || "-"}";${e.paymentMethod || "Dinheiro"};"${numBR(e.amount)}";${e.status};${mes}`
    );
  });

  lines.push(";;;;;;;");

  // 5. CADASTRO DE ALUNOS
  lines.push("CADASTRO DE ALUNOS;;;;;;;;");
  lines.push("Cadastre os alunos e mantenha os vencimentos atualizados.;;;;;;;;");
  lines.push(";;;;;;;;");
  lines.push("Nome completo;Telefone;E-mail;Plano;Início;Vencimento;Mensalidade (R$);Status;Dias até vencer");

  students.forEach((s) => {
    const days = daysUntilExpiration(s.membershipEnd);
    lines.push(
      `"${s.fullName}";"${formatPhone(s.phone)}";"${s.email || "-"}";"${s.planName}";${formatDateBR(s.membershipStart)};${formatDateBR(s.membershipEnd)};"${numBR(s.pricePaid)}";${s.status};${days}`
    );
  });

  lines.push(";;;;;;;;");

  // 6. INSTRUÇÕES & SOBRE O SISTEMA
  lines.push("COMO USAR A PLANILHA FITCONTROL;");
  lines.push('"Planilha gerada automaticamente pelo FitControl com dados do sistema.";');
  lines.push(";");
  lines.push('1. Configurações;"Personalize planos, categorias e configurações na tela de Configurações."');
  lines.push('2. Alunos;"Os dados de contato, vigência e mensalidades são sincronizados automaticamente."');
  lines.push('3. Receitas & Despesas;"Cada transação é discriminada com status e centro de custo."');
  lines.push(`Emitido em;"${formatDateTimeBR(new Date())} - FitControl Maceió"`);

  // Junta com quebras de linha Windows (\r\n) e inclui BOM UTF-8 (\uFEFF)
  const csvContent = "\uFEFF" + lines.join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fitcontrol_painel_de_gestao_${period}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("Planilha no Modelo Oficial exportada com sucesso!");
}
