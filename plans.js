/**
 * FITCONTROL — GERENCIAMENTO DE PLANOS & ASSINATURAS
 * Criação, edição, descontos e cálculo de valor total do contrato.
 */

let allPlans = [];

function initPlansPage() {
  renderPlansGrid();

  // Escuta inputs do modal para cálculo automático em tempo real
  const durationInput = document.getElementById("plan-duration");
  const priceInput = document.getElementById("plan-monthly-price");
  const discountInput = document.getElementById("plan-discount");

  [durationInput, priceInput, discountInput].forEach((input) => {
    if (input) {
      input.addEventListener("input", calculatePlanPreview);
    }
  });
}

function calculatePlanPreview() {
  const duration = parseInt(document.getElementById("plan-duration").value) || 1;
  const monthly = parseFloat(document.getElementById("plan-monthly-price").value) || 0;
  const discount = parseFloat(document.getElementById("plan-discount").value) || 0;

  const rawTotal = duration * monthly;
  const discountAmount = rawTotal * (discount / 100);
  const finalTotal = Math.max(0, rawTotal - discountAmount);

  document.getElementById("preview-total-price").textContent = formatCurrency(finalTotal);
  document.getElementById("preview-discount-val").textContent = `Desconto de ${formatCurrency(discountAmount)} (${discount}%)`;
}

function renderPlansGrid() {
  allPlans = fitStorage.getPlans();
  const container = document.getElementById("plans-grid-container");
  if (!container) return;

  const students = fitStorage.getStudents();

  container.innerHTML = allPlans
    .map((p) => {
      const studentCount = students.filter((s) => s.planId === p.id && s.status === "ATIVO").length;
      const isPopular = p.promotionalTag && p.promotionalTag.toLowerCase().includes("popular");

      return `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; position: relative; ${
        isPopular ? "border-color: var(--accent-primary); box-shadow: 0 4px 20px var(--accent-glow);" : ""
      }">
        ${
          p.promotionalTag
            ? `<div style="position: absolute; top: 12px; right: 12px;"><span class="badge badge-purple">${p.promotionalTag}</span></div>`
            : ""
        }

        <div class="card-body">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">
            ${p.name}
          </h3>
          <p class="text-sm text-muted" style="min-height: 40px; margin-bottom: 1.25rem;">
            ${p.description || "Acesso completo à estrutura da academia."}
          </p>

          <div style="margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: baseline; gap: 0.35rem;">
              <span style="font-size: 1.85rem; font-weight: 800; color: var(--text-primary);">${formatCurrency(p.totalPrice)}</span>
              <span class="text-xs text-muted">/ contrato</span>
            </div>
            <div class="text-xs text-muted" style="margin-top: 2px;">
              ${p.durationMonths} ${p.durationMonths === 1 ? "mês" : "meses"} de vigência (${formatCurrency(p.monthlyPrice)}/mês)
              ${p.discountPercent > 0 ? `• <span class="text-success font-semibold">${p.discountPercent}% OFF</span>` : ""}
            </div>
          </div>

          <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem; font-size: 0.8rem; display: flex; justify-content: space-between;">
            <span>Alunos Ativos:</span>
            <strong>${studentCount} matriculado(s)</strong>
          </div>
        </div>

        <div class="card-footer">
          <span class="badge ${p.active ? "badge-success" : "badge-outline"}">${p.active ? "Disponível" : "Inativo"}</span>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm" onclick="openEditPlanModal('${p.id}')">Editar</button>
            <button class="btn btn-secondary btn-sm" onclick="togglePlanStatus('${p.id}')">
              ${p.active ? "Desativar" : "Ativar"}
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

function openCreatePlanModal() {
  document.getElementById("plan-modal-title").textContent = "Criar Novo Plano";
  document.getElementById("plan-id").value = "";
  document.getElementById("plan-name").value = "";
  document.getElementById("plan-description").value = "";
  document.getElementById("plan-duration").value = "3";
  document.getElementById("plan-monthly-price").value = "120";
  document.getElementById("plan-discount").value = "5";
  document.getElementById("plan-tag").value = "Mais Popular";
  calculatePlanPreview();
  openModal("plan-modal");
}

function openEditPlanModal(planId) {
  const plan = allPlans.find((p) => p.id === planId);
  if (!plan) return;

  document.getElementById("plan-modal-title").textContent = "Editar Plano";
  document.getElementById("plan-id").value = plan.id;
  document.getElementById("plan-name").value = plan.name;
  document.getElementById("plan-description").value = plan.description || "";
  document.getElementById("plan-duration").value = plan.durationMonths;
  document.getElementById("plan-monthly-price").value = plan.monthlyPrice;
  document.getElementById("plan-discount").value = plan.discountPercent || 0;
  document.getElementById("plan-tag").value = plan.promotionalTag || "";
  calculatePlanPreview();
  openModal("plan-modal");
}

function handleSavePlan(e) {
  e.preventDefault();
  const id = document.getElementById("plan-id").value;
  const name = document.getElementById("plan-name").value.trim();
  const description = document.getElementById("plan-description").value.trim();
  const durationMonths = parseInt(document.getElementById("plan-duration").value) || 1;
  const monthlyPrice = parseFloat(document.getElementById("plan-monthly-price").value) || 0;
  const discountPercent = parseFloat(document.getElementById("plan-discount").value) || 0;
  const promotionalTag = document.getElementById("plan-tag").value.trim();

  const rawTotal = durationMonths * monthlyPrice;
  const discountAmount = rawTotal * (discountPercent / 100);
  const totalPrice = Math.max(0, Math.round((rawTotal - discountAmount) * 100) / 100);

  const planData = {
    name,
    description,
    durationMonths,
    monthlyPrice,
    discountPercent,
    totalPrice,
    promotionalTag,
    active: true,
  };

  if (id) planData.id = id;

  fitStorage.savePlan(planData);
  renderPlansGrid();
  closeModal("plan-modal");
  showToast(id ? "Plano atualizado com sucesso!" : "Novo plano criado com sucesso!");
}

function togglePlanStatus(planId) {
  const plan = allPlans.find((p) => p.id === planId);
  if (!plan) return;

  plan.active = !plan.active;
  fitStorage.savePlan(plan);
  renderPlansGrid();
  showToast(`Plano ${plan.active ? "ativado" : "desativado"} com sucesso.`);
}
