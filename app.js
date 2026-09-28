// ===== ONLYBOSSHATS APP =====
sb_publishable_nE1xWjVKxVnFmEpBDuKNqQ_7Hoh7-OL const SUPABASE_URL = 'https://wvoqwpmteurqmtwtvior.supabase.co';
const SUPABASE_KEY = 'PEGA_AQUI_TU_PUBLISHABLE_KEY';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
); const ADMIN_PASSWORD = 'onlyboss2024';
const STORAGE_KEY = 'onlybosshats_products';
const CART_KEY = 'onlybosshats_cart';
const SESSION_KEY = 'onlybosshats_admin';

// Default products (seed)
const DEFAULT_PRODUCTS = [
  {
    id: '1',
    name: 'Boss Classic Black',
    category: 'gorras',
    price: 450,
    salePrice: null,
    stock: 15,
    description: 'Gorra clásica negra con logo bordado en rojo. Ajuste perfecto y tela premium.',
    image: null,
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Red Boss Snapback',
    category: 'gorras',
    price: 480,
    salePrice: 399,
    stock: 8,
    description: 'Snapback rojo intenso. Detalles en blanco. Edición street.',
    image: null,
    createdAt: Date.now()
  },
  {
    id: '3',
    name: 'White Elite Cap',
    category: 'gorras',
    price: 420,
    salePrice: null,
    stock: 0,
    description: 'Gorra blanca limpia con logo negro. Minimal y elegante.',
    image: null,
    createdAt: Date.now()
  },
  {
    id: '4',
    name: 'OnlyBoss Drop #001',
    category: 'drop',
    price: 650,
    salePrice: null,
    stock: 5,
    description: 'Primera pieza del Drop exclusivo. Numerada. Solo 20 unidades.',
    image: null,
    createdAt: Date.now()
  },
  {
    id: '5',
    name: 'OnlyBoss Drop #002 - Blood',
    category: 'drop',
    price: 700,
    salePrice: 599,
    stock: 3,
    description: 'Edición Blood. Rojo sangre y negro mate. Muy limitada.',
    image: null,
    createdAt: Date.now()
  }
];

let products = [];
let cart = [];
let currentImageBase64 = null;
let currentFilter = 'all';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCart();
  renderAll();
  updateCartUI();

  // Check admin session
  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    showAdminPanel();
  }
});

// ===== STORAGE =====
function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    products = JSON.parse(saved);
  } else {
    products = [...DEFAULT_PRODUCTS];
    saveProducts();
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadCart() {
  const saved = localStorage.getItem(CART_KEY);
  cart = saved ? JSON.parse(saved) : [];
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ===== NAVIGATION =====
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (id === 'gorras') renderGorras();
  if (id === 'drop') renderDrop();
  if (id === 'home') renderFeatured();
  if (id === 'about') {
    document.getElementById('statProducts').textContent = products.length;
  }
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ===== RENDER PRODUCTS =====
function renderAll() {
  renderFeatured();
  renderGorras();
  renderDrop();
}

function getDisplayPrice(p) {
  if (p.salePrice && p.salePrice > 0 && p.salePrice < p.price) {
    return { current: p.salePrice, old: p.price, onSale: true };
  }
  return { current: p.price, old: null, onSale: false };
}

function productCardHTML(p) {
  const price = getDisplayPrice(p);
  const soldOut = p.stock <= 0;
  let badge = '';
  if (soldOut) badge = '<span class="product-badge badge-soldout">Sold Out</span>';
  else if (price.onSale) badge = '<span class="product-badge badge-sale">Oferta</span>';
  else if (p.category === 'drop') badge = '<span class="product-badge badge-drop">Drop</span>';

  const img = p.image
    ? `<img src="${p.image}" alt="${p.name}" class="product-img">`
    : `<div class="product-img-placeholder"><i class="fas fa-hat-cowboy"></i></div>`;

  return `
    <div class="product-card" onclick="openProduct('${p.id}')">
      ${badge}
      ${img}
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">
          <span class="price-current ${price.onSale ? 'price-sale' : ''}">$${price.current}</span>
          ${price.old ? `<span class="price-old">$${price.old}</span>` : ''}
        </div>
        <div class="product-actions" onclick="event.stopPropagation()">
          <button class="btn-add" ${soldOut ? 'disabled' : ''} onclick="addToCart('${p.id}')">
            ${soldOut ? 'Agotado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderFeatured() {
  const featured = products.filter(p => p.stock > 0).slice(0, 4);
  document.getElementById('featuredProducts').innerHTML =
    featured.length ? featured.map(productCardHTML).join('') : '<p style="grid-column:1/-1;text-align:center;color:#888">No hay productos aún</p>';
}

function renderGorras() {
  let list = products.filter(p => p.category === 'gorras');
  if (currentFilter === 'in-stock') list = list.filter(p => p.stock > 0);
  if (currentFilter === 'sale') list = list.filter(p => p.salePrice && p.salePrice < p.price);
  document.getElementById('gorrasProducts').innerHTML =
    list.length ? list.map(productCardHTML).join('') : '<p style="grid-column:1/-1;text-align:center;color:#888">No hay gorras en esta categoría</p>';
}

function renderDrop() {
  const list = products.filter(p => p.category === 'drop');
  document.getElementById('dropProducts').innerHTML =
    list.length ? list.map(productCardHTML).join('') : '<p style="grid-column:1/-1;text-align:center;color:#888">Próximamente nuevos drops...</p>';
}

function filterProducts(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGorras();
}

// ===== PRODUCT MODAL =====
function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const price = getDisplayPrice(p);
  const soldOut = p.stock <= 0;

  const img = p.image
    ? `<img src="${p.image}" alt="${p.name}" class="modal-img">`
    : `<div class="modal-img-placeholder"><i class="fas fa-hat-cowboy"></i></div>`;

  document.getElementById('modalBody').innerHTML = `
    ${img}
    <div class="modal-info">
      <h2>${p.name}</h2>
      <div class="product-price">
        <span class="price-current ${price.onSale ? 'price-sale' : ''}">$${price.current}</span>
        ${price.old ? `<span class="price-old">$${price.old}</span>` : ''}
      </div>
      <p>${p.description || 'Sin descripción.'}</p>
      <div class="modal-stock ${soldOut ? 'stock-out' : 'stock-ok'}">
        ${soldOut ? '● Agotado' : `● ${p.stock} en stock`}
      </div>
      <button class="btn-primary btn-block" ${soldOut ? 'disabled' : ''} onclick="addToCart('${p.id}'); closeModal();">
        ${soldOut ? 'Sold Out' : 'Agregar al carrito'}
      </button>
    </div>
  `;
  document.getElementById('productModal').classList.add('open');
}

function closeModal() {
  document.getElementById('productModal').classList.remove('open');
}

// ===== CART =====
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p || p.stock <= 0) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    if (existing.qty < p.stock) existing.qty++;
  } else {
    cart.push({ id: p.id, qty: 1 });
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  const p = products.find(x => x.id === id);
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  if (p && item.qty > p.stock) item.qty = p.stock;
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Tu bolsa está vacía</p></div>`;
    document.getElementById('cartTotal').textContent = '$0';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return '';
    const price = getDisplayPrice(p);
    const sub = price.current * item.qty;
    total += sub;
    const img = p.image
      ? `<img src="${p.image}" alt="${p.name}">`
      : `<div class="cart-item-placeholder"><i class="fas fa-hat-cowboy"></i></div>`;
    return `
      <div class="cart-item">
        ${img}
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">$${price.current}</div>
          <div class="cart-item-qty">
            <button onclick="changeQty('${p.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty('${p.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    `;
  }).join('');
  document.getElementById('cartTotal').textContent = `$${total.toFixed(0)}`;
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}

function closeAll() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  closeModal();
}

function checkout() {
  if (cart.length === 0) return;
  let msg = 'Hola! Quiero pedir estas gorras de OnlyBossHats:%0A%0A';
  let total = 0;
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return;
    const price = getDisplayPrice(p);
    const sub = price.current * item.qty;
    total += sub;
    msg += `• ${p.name} x${item.qty} — $${sub}%0A`;
  });
  msg += `%0ATotal: $${total.toFixed(0)}`;
  // Cambia el número por el tuyo real
  window.open(`https://wa.me/5210000000000?text=${msg}`, '_blank');
}

// ===== ADMIN =====
function loginAdmin() {
  const pass = document.getElementById('adminPassword').value;
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    showAdminPanel();
  } else {
    alert('Contraseña incorrecta');
  }
}

function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById('adminLogin').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminPassword').value = '';
}

function showAdminPanel() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  renderAdminProducts();
}

function showAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('adminProducts').style.display = tab === 'products' ? 'block' : 'none';
  document.getElementById('adminAdd').style.display = tab === 'add' ? 'block' : 'none';
  document.getElementById('adminOrders').style.display = tab === 'orders' ? 'block' : 'none';
  if (tab === 'products') renderAdminProducts();
}

function renderAdminProducts() {
  const search = (document.getElementById('adminSearch')?.value || '').toLowerCase();
  let list = products;
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search));

  const tbody = document.getElementById('adminProductsBody');
  tbody.innerHTML = list.map(p => {
    const price = getDisplayPrice(p);
    let statusClass = 'status-ok';
    let statusText = 'En stock';
    if (p.stock <= 0) { statusClass = 'status-out'; statusText = 'Sold Out'; }
    else if (p.stock <= 3) { statusClass = 'status-low'; statusText = 'Poco stock'; }

    const img = p.image
      ? `<img src="${p.image}" class="admin-thumb" alt="">`
      : `<div class="admin-thumb-ph"><i class="fas fa-hat-cowboy"></i></div>`;

    return `
      <tr>
        <td>${img}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.category === 'drop' ? 'Drop' : 'Gorras'}</td>
        <td>
          $${price.current}
          ${price.old ? `<br><small style="color:#888;text-decoration:line-through">$${price.old}</small>` : ''}
        </td>
        <td>${p.stock}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <div class="action-btns">
            <button onclick="editProduct('${p.id}')" title="Editar"><i class="fas fa-pen"></i></button>
            <button onclick="toggleStock('${p.id}')" title="Cambiar stock"><i class="fas fa-boxes"></i></button>
            <button onclick="deleteProduct('${p.id}')" title="Eliminar"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function previewImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    currentImageBase64 = ev.target.result;
    document.getElementById('imagePreview').innerHTML = `<img src="${currentImageBase64}" alt="preview">`;
  };
  reader.readAsDataURL(file);
}

function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('editId').value = '';
  currentImageBase64 = null;
  document.getElementById('imagePreview').innerHTML = `<i class="fas fa-camera"></i><span>Subir foto</span>`;
  document.getElementById('saveBtn').textContent = 'Guardar Producto';
}

function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('editId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pSalePrice').value = p.salePrice || '';
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pDesc').value = p.description || '';
  currentImageBase64 = p.image;
  if (p.image) {
    document.getElementById('imagePreview').innerHTML = `<img src="${p.image}" alt="preview">`;
  } else {
    document.getElementById('imagePreview').innerHTML = `<i class="fas fa-camera"></i><span>Subir foto</span>`;
  }
  document.getElementById('saveBtn').textContent = 'Actualizar Producto';
  // Switch to add tab
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab')[1].classList.add('active');
  document.getElementById('adminProducts').style.display = 'none';
  document.getElementById('adminAdd').style.display = 'block';
  document.getElementById('adminOrders').style.display = 'none';
}

function saveProduct(e) {
  e.preventDefault();
  const editId = document.getElementById('editId').value;
  const data = {
    name: document.getElementById('pName').value.trim(),
    category: document.getElementById('pCategory').value,
    price: parseFloat(document.getElementById('pPrice').value),
    salePrice: document.getElementById('pSalePrice').value ? parseFloat(document.getElementById('pSalePrice').value) : null,
    stock: parseInt(document.getElementById('pStock').value, 10),
    description: document.getElementById('pDesc').value.trim(),
    image: currentImageBase64
  };

  if (editId) {
    const idx = products.findIndex(x => x.id === editId);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...data };
    }
  } else {
    products.push({
      id: Date.now().toString(),
      ...data,
      createdAt: Date.now()
    });
  }

  saveProducts();
  resetForm();
  renderAll();
  renderAdminProducts();
  alert(editId ? 'Producto actualizado' : 'Producto agregado');
  // Go back to products tab
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab')[0].classList.add('active');
  document.getElementById('adminProducts').style.display = 'block';
  document.getElementById('adminAdd').style.display = 'none';
}

function toggleStock(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const newStock = prompt(`Stock actual de "${p.name}": ${p.stock}\n\nIngresa el nuevo stock:`, p.stock);
  if (newStock === null) return;
  const n = parseInt(newStock, 10);
  if (isNaN(n) || n < 0) {
    alert('Número inválido');
    return;
  }
  p.stock = n;
  saveProducts();
  renderAll();
  renderAdminProducts();
}

function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  products = products.filter(x => x.id !== id);
  cart = cart.filter(c => c.id !== id);
  saveProducts();
  saveCart();
  renderAll();
  renderAdminProducts();
  updateCartUI();
}

// Close modal on escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAll();
});
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  const section = document.getElementById(sectionId);

  if (section) {
    section.classList.add('active');
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.remove('open');
  }
}
