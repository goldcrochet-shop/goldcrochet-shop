async function loadComponent(elementId, url, callback) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
    if (callback) callback();
  } catch (error) {
    console.error(`Erro ao carregar ${url}:`, error);
  }
}

// Carregar header e footer em todas as páginas
document.addEventListener('DOMContentLoaded', () => {
  // Coloque os placeholders no HTML com esses IDs
  loadComponent('header-placeholder', 'components/header.html', () => {
    // Inicializa efeito de scroll do header
    initHeaderScroll();
  });
  loadComponent('footer-placeholder', 'components/footer.html');
});

// Função para o efeito de recolher/estender o header
function initHeaderScroll() {
  const header = document.getElementById('meuHeader');
  if (!header) return;
  const offset = 80;

  window.addEventListener('scroll', () => {
    if (window.scrollY > offset) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Função para toggle do menu mobile
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}
