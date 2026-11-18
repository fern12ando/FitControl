/**
 * FITCONTROL — CONFIGURAÇÕES DA ACADEMIA & REGRAS DE NEGÓCIO
 * Dados cadastrais, políticas de tolerância de acesso e restauração de dados.
 */

function initSettingsPage() {
  loadSettingsForm();
}

function loadSettingsForm() {
  const s = fitStorage.getSettings();

  document.getElementById("cfg-gym-name").value = s.gymName || "";
  document.getElementById("cfg-trade-name").value = s.tradeName || "";
  document.getElementById("cfg-cnpj").value = s.cnpj || "";
  document.getElementById("cfg-email").value = s.email || "";
  document.getElementById("cfg-phone").value = s.phone || "";
  document.getElementById("cfg-address").value = s.address || "";
  document.getElementById("cfg-city").value = s.city || "Maceió";
  document.getElementById("cfg-state").value = s.state || "AL";
  document.getElementById("cfg-zip").value = s.zipCode || "";
  document.getElementById("cfg-grace-days").value = s.gracePeriodDays || 2;
  document.getElementById("cfg-offline-access").checked = !!s.allowOfflineAccess;
}

function handleSaveSettings(e) {
  e.preventDefault();

  const settings = {
    gymName: document.getElementById("cfg-gym-name").value.trim(),
    tradeName: document.getElementById("cfg-trade-name").value.trim(),
    cnpj: document.getElementById("cfg-cnpj").value.trim(),
    email: document.getElementById("cfg-email").value.trim(),
    phone: document.getElementById("cfg-phone").value.trim(),
    address: document.getElementById("cfg-address").value.trim(),
    city: document.getElementById("cfg-city").value.trim(),
    state: document.getElementById("cfg-state").value.trim(),
    zipCode: document.getElementById("cfg-zip").value.trim(),
    gracePeriodDays: parseInt(document.getElementById("cfg-grace-days").value) || 0,
    allowOfflineAccess: document.getElementById("cfg-offline-access").checked,
  };

  fitStorage.saveSettings(settings);
  showToast("Configurações da academia salvas com sucesso!");
}

function resetDemoDataAction() {
  if (confirm("Deseja realmente restaurar os dados de demonstração iniciais? Quaisquer alterações locais serão substituídas pelos dados de teste.")) {
    fitStorage.reset();
    loadSettingsForm();
    showToast("Dados de demonstração restaurados com sucesso!");
  }
}
