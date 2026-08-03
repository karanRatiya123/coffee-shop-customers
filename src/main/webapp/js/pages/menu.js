// --- Velvet Roast Online Menu Catalog Logic (menu.js) ---
// Prepared for Java Servlet + MySQL Backend Integration

// Search & Filter State
let searchFilter = '';
let currentCategoryFilter = 'All';
let currentProducts = [];
let currentCategories = ['All'];

// On Page Load
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Fetch categories dynamically from CategoryServlet
  await loadCategories();
  
  // 2. Fetch products dynamically from MenuServlet
  await loadProducts();
});

// Fetch categories from CategoryServlet
async function loadCategories() {
  if (typeof ApiService !== 'undefined' && ApiService.loadCategories) {
    const fetchedCategories = await ApiService.loadCategories();
    if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
      currentCategories = ['All', ...fetchedCategories.map(c => typeof c === 'string' ? c : (c.name || c.categoryName))];
    }
  }
  renderCategoryTabs(currentCategories);
}

// Fetch products from MenuServlet
async function loadProducts() {
  if (typeof ApiService !== 'undefined' && ApiService.loadProducts) {
    currentProducts = await ApiService.loadProducts(currentCategoryFilter, searchFilter);
  } else {
    currentProducts = [];
  }
  renderMenu(currentProducts);
}

// Render Category Tabs Dynamically (accepting dynamic categories data)
function renderCategoryTabs(categories = []) {
  const tabsContainer = document.getElementById('menu-category-tabs');
  if (!tabsContainer) return;

  const catsToRender = Array.isArray(categories) && categories.length > 0 ? categories : ['All'];
  tabsContainer.innerHTML = catsToRender.map(cat => `
    <button class="view-menu-tab ${cat === currentCategoryFilter ? 'active' : ''}" onclick="selectCategory('${cat}', this)">
      ${cat}
    </button>
  `).join('');
}

// Action Handler: Category Filter
function selectCategory(category, button) {
  currentCategoryFilter = category;
  
  // Update active state of tabs
  const tabs = document.querySelectorAll('.view-menu-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  if (button) button.classList.add('active');

  loadProducts();
}

// Render stats and items (accepting dynamic products data)
function renderMenu(productsToRender = []) {
  const gridContainer = document.getElementById('view-menu-grid');
  const countEl = document.getElementById('menu-item-count');
  const statsContainer = document.getElementById('menu-stats-row');

  const productsList = Array.isArray(productsToRender) ? productsToRender : [];

  // Filter products locally if needed
  const filteredProducts = productsList.filter(product => {
    const matchesCategory = currentCategoryFilter === 'All' || product.category === currentCategoryFilter;
    const matchesSearch = !searchFilter || 
                          (product.name && product.name.toLowerCase().includes(searchFilter.toLowerCase())) || 
                          (product.description && product.description.toLowerCase().includes(searchFilter.toLowerCase())) ||
                          (product.category && product.category.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // 1. Update count label
  if (countEl) {
    countEl.textContent = `${filteredProducts.length} Items`;
  }

  // 2. Render statistics row
  if (statsContainer) {
    const totalCount = productsList.length;
    const uniqueCategories = [...new Set(productsList.map(p => p.category))].filter(Boolean).length;
    const popularCount = productsList.filter(p => p.isPopular || p.bestseller).length;
    
    // Calculate Price Range
    const prices = productsList.map(p => Number(p.price || 0));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const priceRange = prices.length > 0 ? `₹${minPrice.toFixed(0)} - ₹${maxPrice.toFixed(0)}` : '₹0';

    statsContainer.innerHTML = `
      <div class="view-menu-stat-card">
        <div class="view-menu-stat-icon total">
          <i class="fa-solid fa-mug-hot"></i>
        </div>
        <div class="view-menu-stat-details">
          <span class="view-menu-stat-value">${totalCount}</span>
          <span class="view-menu-stat-label">Total Products</span>
        </div>
      </div>
      <div class="view-menu-stat-card">
        <div class="view-menu-stat-icon categories">
          <i class="fa-solid fa-list"></i>
        </div>
        <div class="view-menu-stat-details">
          <span class="view-menu-stat-value">${uniqueCategories}</span>
          <span class="view-menu-stat-label">Categories</span>
        </div>
      </div>
      <div class="view-menu-stat-card">
        <div class="view-menu-stat-icon popular">
          <i class="fa-solid fa-star"></i>
        </div>
        <div class="view-menu-stat-details">
          <span class="view-menu-stat-value">${popularCount}</span>
          <span class="view-menu-stat-label">Bestsellers</span>
        </div>
      </div>
      <div class="view-menu-stat-card">
        <div class="view-menu-stat-icon pricerange">
          <i class="fa-solid fa-indian-rupee-sign"></i>
        </div>
        <div class="view-menu-stat-details">
          <span class="view-menu-stat-value">${priceRange}</span>
          <span class="view-menu-stat-label">Price Range</span>
        </div>
      </div>
    `;
  }

  // 3. Render grid items
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  if (filteredProducts.length === 0) {
    gridContainer.innerHTML = `
      <div class="view-menu-empty">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3>No menu items found</h3>
        <p>No products match your search or selected category.</p>
      </div>
    `;
    return;
  }

  filteredProducts.forEach(item => {
    // Stock status class and text
    const stock = Number(item.stock || 0);
    let stockClass = 'in-stock';
    let stockText = `In Stock (${stock})`;
    if (stock === 0) {
      stockClass = 'out-of-stock';
      stockText = 'Out of Stock';
    } else if (stock <= 10) {
      stockClass = 'low-stock';
      stockText = `Low Stock (${stock})`;
    }

    // Dietary badges HTML
    const dietaryList = Array.isArray(item.dietary) ? item.dietary : [];
    const dietBadgesHtml = dietaryList.map(diet => `
      <span class="diet-label ${String(diet).toLowerCase()}">${diet}</span>
    `).join(' ');

    const nutrition = item.nutrition || { kcal: 0, caffeine: 0, sugar: 0 };

    const card = document.createElement('div');
    card.className = `view-menu-card ${stock === 0 ? 'inactive-card' : ''}`;
    card.setAttribute('onclick', `openProductModal('${item.id}')`);
    card.innerHTML = `
      <div class="view-menu-card-img-wrapper">
        <img src="${item.image || ''}" alt="${item.name || ''}" class="view-menu-card-img" onerror="this.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=300'">
        <span class="view-menu-card-badge">${item.subtitle || item.category || 'Coffee'}</span>
        ${item.isPopular ? '<span class="view-menu-card-popular">Popular</span>' : ''}
      </div>
      
      <div class="view-menu-card-body">
        <span class="view-menu-card-category">${item.category || ''}</span>
        <div class="view-menu-card-title-row">
          <h3 class="view-menu-card-title">${item.name || ''}</h3>
          <span class="view-menu-card-price">₹${Number(item.price || 0).toFixed(2)}</span>
        </div>
        
        <p class="view-menu-card-desc">${item.description || ''}</p>
        
        <div class="view-menu-card-details">
          <div class="view-menu-card-specs">
            <span>Kcal: <strong>${nutrition.kcal || 0}</strong></span>
            <span>Caffeine: <strong>${nutrition.caffeine || 0}mg</strong></span>
            <span>Sugar: <strong>${nutrition.sugar || 0}g</strong></span>
          </div>
          
          <div class="view-menu-card-footer">
            <div class="view-menu-card-dietary">${dietBadgesHtml}</div>
            <span class="view-menu-card-stock ${stockClass}">${stockText}</span>
          </div>
        </div>
      </div>
    `;
    gridContainer.appendChild(card);
  });
}

// Action Handler: Search Bar Filtering
function filterMenuBySearch() {
  const searchInput = document.getElementById('view-menu-search');
  if (searchInput) {
    searchFilter = searchInput.value;
    loadProducts();
  }
}

// Action Handler: View Product / Open Modal
function openProductModal(id) {
  const item = currentProducts.find(p => p.id === id || String(p.id) === String(id));
  if (!item) return;

  // Set image and basic info
  const imgEl = document.getElementById('modal-product-img');
  const titleEl = document.getElementById('modal-product-title');
  const priceEl = document.getElementById('modal-product-price');
  const descEl = document.getElementById('modal-product-desc');
  const categoryEl = document.getElementById('modal-product-category');
  const badgeEl = document.getElementById('modal-product-badge');

  if (imgEl) imgEl.src = item.image || '';
  if (titleEl) titleEl.textContent = item.name || '';
  if (priceEl) priceEl.textContent = `₹${Number(item.price || 0).toFixed(2)}`;
  if (descEl) descEl.textContent = item.description || '';
  if (categoryEl) categoryEl.textContent = item.category || '';
  if (badgeEl) badgeEl.textContent = item.subtitle || item.category || '';

  const orderBtn = document.querySelector('.order-now-modal-btn');
  if (orderBtn) {
    orderBtn.href = `../order/order.html?product=${item.id}`;
  }

  // Render ingredients
  const ingredientsContainer = document.getElementById('modal-product-ingredients');
  if (ingredientsContainer) {
    const ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];
    ingredientsContainer.innerHTML = ingredients.map(ing => `
      <span class="ingredient-tag">${ing}</span>
    `).join('');
  }

  // Render nutrition
  const nutrition = item.nutrition || { kcal: 0, caffeine: 0, sugar: 0 };
  const kcalEl = document.getElementById('modal-nutrition-kcal');
  const caffeineEl = document.getElementById('modal-nutrition-caffeine');
  const sugarEl = document.getElementById('modal-nutrition-sugar');

  if (kcalEl) kcalEl.textContent = `${nutrition.kcal || 0}`;
  if (caffeineEl) caffeineEl.textContent = `${nutrition.caffeine || 0}mg`;
  if (sugarEl) sugarEl.textContent = `${nutrition.sugar || 0}g`;

  // Show Modal
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  }
}

function closeProductModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Action Handler: Wishlist toggle
function toggleWishlist(productId) {
  console.log(`[Wishlist] Toggled item ${productId}`);
  // TODO: Send wishlist update to Servlet
}

// Global modal close key listeners
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductModal();
  }
});
