// Dados compartilhados
const products = [
  { id:1, name:'Amigurumi Ursinho', category:'amigurumi', price:65, svg:'<svg viewBox="0 0 24 24"><path d="M12 2c-2.8 0-5 2.2-5 5 0 .6.1 1.2.3 1.7C5.6 10 4.5 12 4.5 14.5 4.5 18 7.5 21 11 21h2c3.5 0 6.5-3 6.5-6.5 0-2.5-1.1-4.5-2.8-5.8.2-.5.3-1.1.3-1.7 0-2.8-2.2-5-5-5zm0 2c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3z"/></svg>' },
  { id:2, name:'Bolsa de Crochê', category:'bolsas', price:120, svg:'<svg viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12L6 6zm1 0l1 3h10l1-3H7zm3-3c0-1.1.9-2 2-2s2 .9 2 2h2c0-2.2-1.8-4-4-4S8-2.8 8 1H7z"/></svg>' },
  { id:3, name:'Manta Ponto Concha', category:'mantas', price:280, svg:'<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zm2 2v10h14V7z"/></svg>' },
  { id:4, name:'Porta-Copos (Jogo de 4)', category:'casa', price:38, svg:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
  { id:5, name:'Chaveiro Flor', category:'acessorios', price:22, svg:'<svg viewBox="0 0 24 24"><path d="M12 2C9 2 7 4 7 6s2 4 5 4 5-2 5-4-2-4-5-4zm0 6c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm-3 6c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm6 0c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm-3-3c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/></svg>' },
  { id:6, name:'Colete Feminino', category:'vestuario', price:195, svg:'<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4zM6 8v8h12V8H6zm2-2l1-2h6l1 2h-2l-1-1h-2l-1 1H8z"/></svg>' }
];

let cart = [];

function loadCart() { try { cart = JSON.parse(localStorage.getItem('gc_cart') || '[]'); } catch(e) { cart = []; } }
function saveCart() { localStorage.setItem('gc_cart', JSON.stringify(cart)); }
function updateCartUI() {
  const count = cart.reduce((s,c)=>s+c.qty,0);
  const total = cart.reduce((s,c)=>s+c.price*c.qty,0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
  const items = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!items) return;
  if (!cart.length) {
    items.innerHTML = '<div class="cart-empty">Sua sacola está vazia</div>';
    footer.style.display = 'none';
    return;
  }
  footer.style.display = 'block';
  document.getElementById('cartTotal').textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
  items.innerHTML = cart.map((item, i) => `
    <div style="display:flex; gap:10px; padding:12px 0; border-bottom:1px solid #f3ead2;">
      <div style="background:#fdf6d6; width:50px; height:50px; border-radius:8px; display:flex; align-items:center; justify-content:center;">${item.svg || '🧶'}</div>
      <div style="flex:1;"><h4 style="font-size:0.9rem;">${item.name}</h4><span style="color:#cda434;">R$ ${item.price},00</span></div>
      <button onclick="removeItem(${i})" style="border:none; background:#fee; color:#c00; border-radius:50%; width:24px; height:24px; cursor:pointer;">×</button>
    </div>
  `).join('');
}
function addToCart(id) {
  const p = products.find(x=>x.id===id);
  if (!p) return;
  cart.push({...p, qty:1});
  saveCart(); updateCartUI();
  alert('✅ ' + p.name + ' adicionado!');
}
function removeItem(i) { cart.splice(i,1); saveCart(); updateCartUI(); }
function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

function renderCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  track.innerHTML = products.slice(0,6).map(p => `
    <div class="carousel-card" onclick="openModal(${p.id})">
      <div class="carousel-card-img">${p.svg}</div>
      <div class="carousel-card-body"><h3>${p.name}</h3><div class="carousel-card-price">R$ ${p.price},00</div></div>
    </div>`).join('');
  // Dots e navegação simples
  const dots = document.getElementById('carouselDots');
  if (dots) {
    dots.innerHTML = products.slice(0,6).map((_,i)=>`<button class="dot ${i===0?'active':''}" onclick="goSlide(${i})"></button>`).join('');
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-img">${p.svg}</div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <div class="product-price">R$ ${p.price},00</div>
        <button class="add-cart-btn" onclick="addToCart(${p.id})">+ Sacola</button>
      </div>
    </div>`).join('');
}

// Modal simples
function openModal(id) {
  const p = products.find(x=>x.id===id);
  if (!p) return;
  document.getElementById('modalTitle').textContent = p.name;
  document.getElementById('modalPrice').textContent = 'R$ ' + p.price + ',00';
  document.getElementById('modalDesc').textContent = 'Peça artesanal exclusiva.';
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  updateCartUI();
  renderCarousel();
  renderProducts();
});
