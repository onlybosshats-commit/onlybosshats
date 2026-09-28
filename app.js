// ONLYBOSSHATS APP
const SUPABASE_URL = 'https://wvoqwpmteurqmtwtvior.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nE1xWjVKxVnFmEpBDuKNqQ_7Hoh7-OL';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const ADMIN_PASSWORD = 'onlyboss2024';
const STORAGE_KEY = 'onlybosshats_products';
const CART_KEY = 'onlybosshats_cart';
const SESSION_KEY = 'onlybosshats_admin';

// ===== DEFAULT PRODUCTS =====
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

  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    showAdminPanel();
  }
});

// ===== STORAGE =====
function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      products = JSON.parse(saved);
    } else {
      products = [...DEFAULT_PRODUCTS];
      saveProducts();
    }
  } catch (error) {
    console.error('Error cargando productos:', error);
    products = [...DEFAULT_PRODUCTS];
    saveProducts();
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    cart = saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error cargando carrito:', error);
    cart = [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ===== NAVIGATION =====
function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  const section = document.getElementById(id);

  if (!section) return;

  section.classList.add('active');

  const navLinks = document.getElementById('navLinks');

  if (navLinks) {
    navLinks.classList.remove('open');
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  if (id === 'gorras') renderGorras();
  if (id === 'drop') renderDrop();
  if (id === 'home') renderFeatured();

  if (id === 'about') {
    const statProducts = document.getElementById('statProducts');

    if (statProducts) {
      statProducts.textContent = products.length;
    }
  }
}

function toggleMenu() {
  const navLinks = document.getElementById('navLinks');

  if (navLinks) {
    navLinks.classList.toggle('open');
  }
}

// ===== RENDER PRODUCTS =====
function renderAll() {
  renderFeatured();
  renderGorras();
  renderDrop();
}

function getDisplayPrice(product) {
  if (
    product.salePrice &&
    product.salePrice > 0 &&
    product.salePrice < product.price
  ) {
    return {
      current: product.salePrice,
      old: product.price,
      onSale: true
    };
  }

  return {
    current: product.price,
    old: null,
    onSale: false
  };
}

function productCardHTML(product) {
  const price = getDisplayPrice(product);
  const soldOut = product.stock <= 0;

  let badge = '';

  if (soldOut) {
    badge = '<span class="product-badge badge-soldout">Sold Out</span>';
  } else if (price.onSale) {
    badge = '<span class="product-badge badge-sale">Oferta</span>';
  } else if (product.category === 'drop') {
    badge = '<span class="product-badge badge-drop">Drop</span>';
  }

  const image = product.image
    ? `<img src="${product.image}" alt="${product.name}" class="product-img">`
    : `<div class="product-img-placeholder"><i class="fas fa-hat-cowboy"></i></div>`;

  return `
    <div class="product-card" onclick="openProduct('${product.id}')">
      ${badge}
      ${image}

      <div class="product-info">
        <div class="product-name">${product.name}</div>

        <div class="product-price">
          <span class="price-current ${price.onSale ? 'price-sale' : ''}">
            $${price.current}
          </span>

          ${
            price.old
              ? `<span class="price-old">$${price.old}</span>`
              : ''
          }
        </div>

        <div class="product-actions" onclick="event.stopPropagation()">
          <button
            class="btn-add"
            ${soldOut ? 'disabled' : ''}
            onclick="addToCart('${product.id}')"
          >
            ${soldOut ? 'Agotado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderFeatured() {
  const container = document.getElementById('featuredProducts');

  if (!container) return;

  const featured = products
    .filter(product => product.stock > 0)
    .slice(0, 4);

  container.innerHTML = featured.length
    ? featured.map(productCardHTML).join('')
    : '<p style="grid-column:1/-1;text-align:center;color:#888">No hay productos aún</p>';
}

function renderGorras() {
  const container = document.getElementById('gorrasProducts');

  if (!container) return;

  let list = products.filter(
    product => product.category === 'gorras'
  );

  if (currentFilter === 'in-stock') {
    list = list.filter(product => product.stock > 0);
  }

  if (currentFilter === 'sale') {
    list = list.filter(
      product =>
        product.salePrice &&
        product.salePrice < product.price
    );
  }

  container.innerHTML = list.length
    ? list.map(productCardHTML).join('')
    : '<p style="grid-column:1/-1;text-align:center;color:#888">No hay gorras en esta categoría</p>';
}

function renderDrop() {
  const container = document.getElementById('dropProducts');

  if (!container) return;

  const list = products.filter(
    product => product.category === 'drop'
  );

  container.innerHTML = list.length
    ? list.map(productCardHTML).join('')
    : '<p style="grid-column:1/-1;text-align:center;color:#888">Próximamente nuevos drops...</p>';
}

function filterProducts(filter, btn) {
  currentFilter = filter;

  document.querySelectorAll('.filter-btn').forEach(button => {
    button.classList.remove('active');
  });

  if (btn) {
    btn.classList.add('active');
  }

  renderGorras();
}

// ===== PRODUCT MODAL =====
function openProduct(id) {
  const product = products.find(item => item.id === id);

  if (!product) return;

  const price = getDisplayPrice(product);
  const soldOut = product.stock <= 0;

  const image = product.image
    ? `<img src="${product.image}" alt="${product.name}" class="modal-img">`
    : `<div class="modal-img-placeholder"><i class="fas fa-hat-cowboy"></i></div>`;

  const modalBody = document.getElementById('modalBody');
  const productModal = document.getElementById('productModal');

  if (!modalBody || !productModal) return;

  modalBody.innerHTML = `
    ${image}

    <div class="modal-info">
      <h2>${product.name}</h2>

      <div class="product-price">
        <span class="price-current ${price.onSale ? 'price-sale' : ''}">
          $${price.current}
        </span>

        ${
          price.old
            ? `<span class="price-old">$${price.old}</span>`
            : ''
        }
      </div>

      <p>${product.description || 'Sin descripción.'}</p>

      <div class="modal-stock ${soldOut ? 'stock-out' : 'stock-ok'}">
        ${
          soldOut
            ? '● Agotado'
            : `● ${product.stock} en stock`
        }
      </div>

      <button
        class="btn-primary btn-block"
        ${soldOut ? 'disabled' : ''}
        onclick="addToCart('${product.id}'); closeModal();"
      >
        ${soldOut ? 'Sold Out' : 'Agregar al carrito'}
      </button>
    </div>
  `;

  productModal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('productModal');

  if (modal) {
    modal.classList.remove('open');
  }
}

// ===== CART =====
function addToCart(id) {
  const product = products.find(item => item.id === id);

  if (!product || product.stock <= 0) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    if (existing.qty < product.stock) {
      existing.qty++;
    }
  } else {
    cart.push({
      id: product.id,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);

  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(cartItem => cartItem.id === id);

  if (!item) return;

  const product = products.find(productItem => productItem.id === id);

  item.qty += delta;

  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  if (product && item.qty > product.stock) {
    item.qty = product.stock;
  }

  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const container = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  const count = cart.reduce(
    (total, item) => total + item.qty,
    0
  );

  if (cartCount) {
    cartCount.textContent = count;
  }

  if (!container || !cartTotal) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-bag"></i>
        <p>Tu bolsa está vacía</p>
      </div>
    `;

    cartTotal.textContent = '$0';
    return;
  }

  let total = 0;

  container.innerHTML = cart
    .map(item => {
      const product = products.find(
        productItem => productItem.id === item.id
      );

      if (!product) return '';

      const price = getDisplayPrice(product);
      const subtotal = price.current * item.qty;

      total += subtotal;

      const image = product.image
        ? `<img src="${product.image}" alt="${product.name}">`
        : `<div class="cart-item-placeholder"><i class="fas fa-hat-cowboy"></i></div>`;

      return `
        <div class="cart-item">
          ${image}

          <div class="cart-item-info">
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-price">$${price.current}</div>

            <div class="cart-item-qty">
              <button onclick="changeQty('${product.id}', -1)">−</button>
              <span>${item.qty}</span>
              <button onclick="changeQty('${product.id}', 1)">+</button>
            </div>
          </div>

          <button
            class="cart-item-remove"
            onclick="removeFromCart('${product.id}')"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    })
    .join('');

  cartTotal.textContent = `$${total.toFixed(0)}`;
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('overlay');

  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

function closeAll() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('overlay');

  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');

  closeModal();
}

function checkout() {
  if (cart.length === 0) return;

  let message =
    'Hola! Quiero pedir estas gorras de OnlyBossHats:\n\n';

  let total = 0;

  cart.forEach(item => {
    const product = products.find(
      productItem => productItem.id === item.id
    );

    if (!product) return;

    const price = getDisplayPrice(product);
    const subtotal = price.current * item.qty;

    total += subtotal;

    message += `• ${product.name} x${item.qty} — $${subtotal}\n`;
  });

  message += `\nTotal: $${total.toFixed(0)}`;

  const encodedMessage = encodeURIComponent(message);

  window.open(
  'https://www.instagram.com/onlybosshats/',
  '_blank'
); 
}

// ===== ADMIN =====
function loginAdmin() {
  const passwordInput =
    document.getElementById('adminPassword');

  if (!passwordInput) return;

  const password = passwordInput.value;

  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    showAdminPanel();
  } else {
    alert('Contraseña incorrecta');
  }
}

function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);

  const login = document.getElementById('adminLogin');
  const panel = document.getElementById('adminPanel');
  const password = document.getElementById('adminPassword');

  if (login) login.style.display = 'flex';
  if (panel) panel.style.display = 'none';
  if (password) password.value = '';
}

function showAdminPanel() {
  const login = document.getElementById('adminLogin');
  const panel = document.getElementById('adminPanel');

  if (login) login.style.display = 'none';
  if (panel) panel.style.display = 'block';

  renderAdminProducts();
}

function showAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(
    element => element.classList.remove('active')
  );

  if (btn) {
    btn.classList.add('active');
  }

  const productsSection =
    document.getElementById('adminProducts');

  const addSection =
    document.getElementById('adminAdd');

  const ordersSection =
    document.getElementById('adminOrders');

  if (productsSection) {
    productsSection.style.display =
      tab === 'products' ? 'block' : 'none';
  }

  if (addSection) {
    addSection.style.display =
      tab === 'add' ? 'block' : 'none';
  }

  if (ordersSection) {
    ordersSection.style.display =
      tab === 'orders' ? 'block' : 'none';
  }

  if (tab === 'products') {
    renderAdminProducts();
  }
}

function renderAdminProducts() {
  const searchInput =
    document.getElementById('adminSearch');

  const tbody =
    document.getElementById('adminProductsBody');

  if (!tbody) return;

  const search =
    (searchInput?.value || '').toLowerCase();

  let list = products;

  if (search) {
    list = list.filter(product =>
      product.name.toLowerCase().includes(search)
    );
  }

  tbody.innerHTML = list
    .map(product => {
      const price = getDisplayPrice(product);

      let statusClass = 'status-ok';
      let statusText = 'En stock';

      if (product.stock <= 0) {
        statusClass = 'status-out';
        statusText = 'Sold Out';
      } else if (product.stock <= 3) {
        statusClass = 'status-low';
        statusText = 'Poco stock';
      }

      const image = product.image
        ? `<img src="${product.image}" class="admin-thumb" alt="">`
        : `<div class="admin-thumb-ph"><i class="fas fa-hat-cowboy"></i></div>`;

      return `
        <tr>
          <td>${image}</td>

          <td>
            <strong>${product.name}</strong>
          </td>

          <td>
            ${product.category === 'drop' ? 'Drop' : 'Gorras'}
          </td>

          <td>
            $${price.current}

            ${
              price.old
                ? `<br><small style="color:#888;text-decoration:line-through">$${price.old}</small>`
                : ''
            }
          </td>

          <td>${product.stock}</td>

          <td>
            <span class="status-badge ${statusClass}">
              ${statusText}
            </span>
          </td>

          <td>
            <div class="action-btns">
              <button
                onclick="editProduct('${product.id}')"
                title="Editar"
              >
                <i class="fas fa-pen"></i>
              </button>

              <button
                onclick="toggleStock('${product.id}')"
                title="Cambiar stock"
              >
                <i class="fas fa-boxes"></i>
              </button>

              <button
                onclick="deleteProduct('${product.id}')"
                title="Eliminar"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// ===== IMAGE =====
function previewImage(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = event => {
    currentImageBase64 = event.target.result;

    const preview =
      document.getElementById('imagePreview');

    if (preview) {
      preview.innerHTML = `
        <img src="${currentImageBase64}" alt="preview">
      `;
    }
  };

  reader.readAsDataURL(file);
}

// ===== PRODUCT FORM =====
function resetForm() {
  const form = document.getElementById('productForm');
  const editId = document.getElementById('editId');
  const preview = document.getElementById('imagePreview');
  const saveButton = document.getElementById('saveBtn');

  if (form) form.reset();

  if (editId) editId.value = '';

  currentImageBase64 = null;

  if (preview) {
    preview.innerHTML = `
      <i class="fas fa-camera"></i>
      <span>Subir foto</span>
    `;
  }

  if (saveButton) {
    saveButton.textContent = 'Guardar Producto';
  }
}

function editProduct(id) {
  const product = products.find(
    item => item.id === id
  );

  if (!product) return;

  document.getElementById('editId').value = product.id;
  document.getElementById('pName').value = product.name;
  document.getElementById('pCategory').value = product.category;
  document.getElementById('pPrice').value = product.price;
  document.getElementById('pSalePrice').value =
    product.salePrice || '';
  document.getElementById('pStock').value = product.stock;
  document.getElementById('pDesc').value =
    product.description || '';

  currentImageBase64 = product.image;

  const preview =
    document.getElementById('imagePreview');

  if (preview) {
    preview.innerHTML = product.image
      ? `<img src="${product.image}" alt="preview">`
      : `<i class="fas fa-camera"></i><span>Subir foto</span>`;
  }

  const saveButton =
    document.getElementById('saveBtn');

  if (saveButton) {
    saveButton.textContent = 'Actualizar Producto';
  }

  document.querySelectorAll('.admin-tab').forEach(
    tab => tab.classList.remove('active')
  );

  const tabs =
    document.querySelectorAll('.admin-tab');

  if (tabs[1]) {
    tabs[1].classList.add('active');
  }

  const adminProducts =
    document.getElementById('adminProducts');

  const adminAdd =
    document.getElementById('adminAdd');

  const adminOrders =
    document.getElementById('adminOrders');

  if (adminProducts) adminProducts.style.display = 'none';
  if (adminAdd) adminAdd.style.display = 'block';
  if (adminOrders) adminOrders.style.display = 'none';
}

function saveProduct(event) {
  event.preventDefault();

  const editId =
    document.getElementById('editId').value;

  const data = {
    name: document.getElementById('pName').value.trim(),

    category:
      document.getElementById('pCategory').value,

    price:
      parseFloat(
        document.getElementById('pPrice').value
      ),

    salePrice:
      document.getElementById('pSalePrice').value
        ? parseFloat(
            document.getElementById('pSalePrice').value
          )
        : null,

    stock:
      parseInt(
        document.getElementById('pStock').value,
        10
      ),

    description:
      document.getElementById('pDesc').value.trim(),

    image: currentImageBase64
  };

  if (!data.name || isNaN(data.price) || isNaN(data.stock)) {
    alert('Completa correctamente los datos del producto.');
    return;
  }

  if (editId) {
    const index = products.findIndex(
      product => product.id === editId
    );

    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...data
      };
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

  alert(
    editId
      ? 'Producto actualizado'
      : 'Producto agregado'
  );

  document.querySelectorAll('.admin-tab').forEach(
    tab => tab.classList.remove('active')
  );

  const tabs =
    document.querySelectorAll('.admin-tab');

  if (tabs[0]) {
    tabs[0].classList.add('active');
  }

  const adminProducts =
    document.getElementById('adminProducts');

  const adminAdd =
    document.getElementById('adminAdd');

  if (adminProducts) adminProducts.style.display = 'block';
  if (adminAdd) adminAdd.style.display = 'none';
}

// ===== STOCK =====
function toggleStock(id) {
  const product = products.find(
    item => item.id === id
  );

  if (!product) return;

  const newStock = prompt(
    `Stock actual de "${product.name}": ${product.stock}\n\nIngresa el nuevo stock:`,
    product.stock
  );

  if (newStock === null) return;

  const stock = parseInt(newStock, 10);

  if (isNaN(stock) || stock < 0) {
    alert('Número inválido');
    return;
  }

  product.stock = stock;

  saveProducts();
  renderAll();
  renderAdminProducts();
  updateCartUI();
}

// ===== DELETE PRODUCT =====
function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto?')) return;

  products = products.filter(
    product => product.id !== id
  );

  cart = cart.filter(
    item => item.id !== id
  );

  saveProducts();
  saveCart();

  renderAll();
  renderAdminProducts();
  updateCartUI();
}

// ===== ESCAPE =====
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeAll();
  }
});// ===== ACCESO ADMIN SECRETO =====
function checkSecretAdmin() {
  if (window.location.hash === '#onlyboss-admin') {
    showSection('admin');
  }
}

window.addEventListener('load', checkSecretAdmin);
window.addEventListener('hashchange', checkSecretAdmin);
