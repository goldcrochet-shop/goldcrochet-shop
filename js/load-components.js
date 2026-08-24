async function loadComponent(id, url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
    if (id === 'header-placeholder') initHeaderScroll();
  } catch (error) {
    console.error(`Erro ao carregar ${url}:`, error);
  }
}

function initHeaderScroll() {
  const header = document.getElementById('meuHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

// Executa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header-placeholder', 'componentes/header.html');
  loadComponent('footer-placeholder', 'componentes/footer.html');
});
