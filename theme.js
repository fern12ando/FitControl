/**
 * FITCONTROL — GERENCIAMENTO DE TEMA (CLARO & ESCURO)
 * Padrão: Tema Escuro (Dark Navy & Charcoal com Violeta)
 */

const THEME_KEY = "FITCONTROL_THEME";

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  // Padrão do FitControl é o modo escuro
  const isDark = saved ? saved === "dark" : true;

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  updateThemeIcons(isDark);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  updateThemeIcons(isDark);
}

function updateThemeIcons(isDark) {
  const btns = document.querySelectorAll(".theme-toggle-btn");
  btns.forEach((btn) => {
    btn.innerHTML = isDark
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    btn.title = isDark ? "Alternar para Tema Claro" : "Alternar para Tema Escuro";
  });
}

// Executa imediatamente para evitar flash de tela branca
initTheme();
