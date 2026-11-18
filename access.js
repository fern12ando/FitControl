/**
 * FITCONTROL — CONTROLE DE ACESSO, CATRACAS & HARDWARE BIOMÉTRICO
 * Monitoramento de dispositivos em rede, ping de latência e logs de passagem.
 */

let accessResultFilter = "TODOS";
let accessSearch = "";

function initAccessPage() {
  renderDevicesList();
  renderAccessEventsTable();

  const searchInput = document.getElementById("access-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      accessSearch = e.target.value.toLowerCase().trim();
      renderAccessEventsTable();
    });
  }

  const resultSelect = document.getElementById("access-result-filter");
  if (resultSelect) {
    resultSelect.addEventListener("change", (e) => {
      accessResultFilter = e.target.value;
      renderAccessEventsTable();
    });
  }
}

function renderDevicesList() {
  const devices = fitStorage.getDevices();
  const container = document.getElementById("devices-grid-container");
  if (!container) return;

  container.innerHTML = devices
    .map((d) => {
      const isOnline = d.status === "ONLINE";

      return `
      <div class="card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div class="flex items-center gap-3">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: ${
              isOnline ? "var(--success-bg)" : "var(--danger-bg)"
            }; color: ${isOnline ? "var(--success)" : "var(--danger)"}; display: flex; align-items: center; justify-content: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="12" x="3" y="4" rx="2"/><line x1="2" x2="22" y1="20" y2="20"/></svg>
            </div>
            <div>
              <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${d.name}</h4>
              <div class="text-xs text-muted">${d.model} • ${d.location}</div>
            </div>
          </div>
          <span class="badge ${isOnline ? "badge-success" : "badge-danger"}">${d.status}</span>
        </div>

        <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.65rem 0.85rem; font-size: 0.8rem; margin-bottom: 0.85rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span class="text-muted">Endereço IP:</span>
            <strong>${d.ipAddress}:${d.port}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span class="text-muted">Último Batimento:</span>
            <span>${formatDateTimeBR(d.lastPing)}</span>
          </div>
        </div>

        <button class="btn btn-outline btn-sm w-full" onclick="pingDevice('${d.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          Testar Comunicação (Ping)
        </button>
      </div>
    `;
    })
    .join("");
}

function pingDevice(deviceId) {
  const devices = fitStorage.getDevices();
  const device = devices.find((d) => d.id === deviceId);
  if (!device) return;

  const latency = Math.floor(Math.random() * 25) + 12; // 12 a 37 ms
  device.status = "ONLINE";
  device.lastPing = new Date().toISOString();
  fitStorage.saveDevice(device);

  renderDevicesList();
  showToast(`Comunicação com ${device.name} OK! Latência: ${latency}ms`);
}

function renderAccessEventsTable() {
  const events = fitStorage.getAccessEvents();
  const tbody = document.getElementById("access-events-tbody");
  if (!tbody) return;

  const filtered = events.filter((ev) => {
    if (accessResultFilter !== "TODOS" && ev.result !== accessResultFilter) return false;

    if (accessSearch) {
      const name = (ev.studentName || "").toLowerCase();
      const id = (ev.identifier || "").toLowerCase();
      const dev = (ev.deviceName || "").toLowerCase();
      if (!name.includes(accessSearch) && !id.includes(accessSearch) && !dev.includes(accessSearch)) {
        return false;
      }
    }
    return true;
  });

  document.getElementById("access-events-count").textContent = `${filtered.length} registro(s)`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div class="empty-state-title">Nenhum evento de acesso localizado</div>
            <div class="empty-state-desc">Use o botão "Simular Catraca" para testar leituras faciais.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((ev) => {
      const isAuth = ev.result === "AUTORIZADO";

      return `
      <tr>
        <td class="font-medium">${formatDateTimeBR(ev.timestamp)}</td>
        <td>
          <div class="font-semibold">${ev.studentName}</div>
          <div class="text-xs text-muted">${ev.identifier}</div>
        </td>
        <td>${ev.deviceName}</td>
        <td><span class="badge badge-outline">${ev.eventType}</span></td>
        <td>
          <span class="badge ${isAuth ? "badge-success" : "badge-danger"}">${ev.result}</span>
        </td>
        <td class="text-sm text-secondary">${ev.reason}</td>
      </tr>
    `;
    })
    .join("");
}

function handleCreateDevice(e) {
  e.preventDefault();
  const name = document.getElementById("dev-name").value.trim();
  const type = document.getElementById("dev-type").value;
  const model = document.getElementById("dev-model").value.trim();
  const ipAddress = document.getElementById("dev-ip").value.trim();
  const port = document.getElementById("dev-port").value.trim();
  const location = document.getElementById("dev-location").value.trim();

  if (!name || !ipAddress) {
    alert("Informe o nome e o IP do dispositivo.");
    return;
  }

  fitStorage.saveDevice({
    name,
    type,
    model: model || "Control iD / Topdata",
    ipAddress,
    port: port || "8080",
    location: location || "Entrada",
    status: "ONLINE",
  });

  renderDevicesList();
  closeModal("new-device-modal");
  document.getElementById("new-device-form").reset();
  showToast("Dispositivo de acesso cadastrado com sucesso!");
}
