// --- Velvet Roast Online Menu Catalog Logic (menu.js) ---

// Detailed Menu Catalog (imported from employee POS system)
const products = [
  { 
    id: 'cappuccino', 
    name: 'Cappuccino', 
    category: 'Coffee', 
    subtitle: 'Hot Coffee', 
    price: 120, 
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=300',
    description: 'A classic espresso drink made with equal parts double espresso, steamed milk, and velvety foam. Dusted with dark cocoa powder.',
    dietary: ['Veg'],
    nutrition: { kcal: 120, caffeine: 150, sugar: 8 },
    ingredients: ['Espresso', 'Whole Milk', 'Cocoa Powder'],
    stock: 25,
    isPopular: true
  },
  { 
    id: 'latte', 
    name: 'Latte', 
    category: 'Coffee', 
    subtitle: 'Hot Coffee', 
    price: 130, 
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=300',
    description: 'A smooth and creamy blend of fresh espresso, steamed milk, and a thin, delicate layer of microfoam on top.',
    dietary: ['Veg'],
    nutrition: { kcal: 190, caffeine: 150, sugar: 15 },
    ingredients: ['Espresso', 'Steamed Milk', 'Vanilla syrup (optional)'],
    stock: 35,
    isPopular: false
  },
  { 
    id: 'americano', 
    name: 'Americano', 
    category: 'Coffee', 
    subtitle: 'Hot Coffee', 
    price: 110, 
    image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&q=80&w=300',
    description: 'Rich, full-bodied espresso diluted with hot water to create a robust, drip-style coffee with crema.',
    dietary: ['Veg', 'Vegan', 'Dairy-Free'],
    nutrition: { kcal: 15, caffeine: 225, sugar: 0 },
    ingredients: ['Espresso', 'Filtered Hot Water'],
    stock: 50,
    isPopular: false
  },
  { 
    id: 'mocha', 
    name: 'Mocha', 
    category: 'Coffee', 
    subtitle: 'Hot Coffee', 
    price: 140, 
    image: 'https://images.unsplash.com/photo-1596078841242-12e73dc697c4?auto=format&fit=crop&q=80&w=300',
    description: 'Decadent chocolate syrup combined with fresh espresso, steamed milk, and finished with whipped cream.',
    dietary: ['Veg'],
    nutrition: { kcal: 320, caffeine: 150, sugar: 32 },
    ingredients: ['Espresso', 'Steamed Milk', 'Chocolate Ganache', 'Whipped Cream'],
    stock: 18,
    isPopular: true
  },
  { 
    id: 'iced-coffee', 
    name: 'Iced Coffee', 
    category: 'Cold Drinks', 
    subtitle: 'Cold Drink', 
    price: 150, 
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=300',
    description: 'Freshly brewed espresso cooled and served over ice, sweetened with simple syrup and dairy cream.',
    dietary: ['Veg'],
    nutrition: { kcal: 140, caffeine: 150, sugar: 12 },
    ingredients: ['Espresso', 'Ice Cubes', 'Whole Milk', 'Cane Syrup'],
    stock: 22,
    isPopular: true
  },
  { 
    id: 'cold-chocolate', 
    name: 'Cold Chocolate', 
    category: 'Cold Drinks', 
    subtitle: 'Cold Drink', 
    price: 160, 
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=300',
    description: 'Premium chilled milk blended with rich Swiss chocolate powder, cocoa shavings, and a scoop of vanilla ice cream.',
    dietary: ['Veg'],
    nutrition: { kcal: 380, caffeine: 5, sugar: 40 },
    ingredients: ['Chilled Milk', 'Cocoa Powder', 'Vanilla Ice Cream', 'Chocolate Drizzle'],
    stock: 12,
    isPopular: false
  },
  { 
    id: 'lemon-iced-tea', 
    name: 'Lemon Iced Tea', 
    category: 'Cold Drinks', 
    subtitle: 'Cold Drink', 
    price: 120, 
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=300',
    description: 'Refreshing organic black tea brewed with fresh lemon juice, sweetened and served over crushed ice with fresh mint.',
    dietary: ['Veg', 'Vegan', 'Dairy-Free'],
    nutrition: { kcal: 90, caffeine: 40, sugar: 22 },
    ingredients: ['Brewed Black Tea', 'Fresh Lemon Juice', 'Mint Leaves', 'Ice'],
    stock: 30,
    isPopular: true
  },
  { 
    id: 'green-tea', 
    name: 'Green Tea', 
    category: 'Tea', 
    subtitle: 'Hot Tea', 
    price: 100, 
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=300',
    description: 'Steeped organic Sencha green tea leaves offering a grassy, clean flavor profile packed with antioxidants.',
    dietary: ['Veg', 'Vegan', 'Dairy-Free'],
    nutrition: { kcal: 2, caffeine: 35, sugar: 0 },
    ingredients: ['Japanese Sencha Green Tea Leaves', 'Hot Water'],
    stock: 45,
    isPopular: false
  },
  { 
    id: 'chocolate-cake', 
    name: 'Chocolate Cake', 
    category: 'Desserts', 
    subtitle: 'Dessert', 
    price: 180, 
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=300',
    description: 'A decadent slice of triple-layered chocolate fudge cake, filled and frosted with dark chocolate ganache.',
    dietary: ['Veg'],
    nutrition: { kcal: 450, caffeine: 10, sugar: 48 },
    ingredients: ['Wheat Flour', 'Dark Cocoa', 'Butter', 'Sugar', 'Baking Powder'],
    stock: 8,
    isPopular: true
  },
  { 
    id: 'blueberry-muffin', 
    name: 'Blueberry Muffin', 
    category: 'Desserts', 
    subtitle: 'Dessert', 
    price: 120, 
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=300',
    description: 'Moist, golden muffin baked with fresh blueberries and topped with a sweet, crunchy sugar streusel.',
    dietary: ['Veg'],
    nutrition: { kcal: 280, caffeine: 0, sugar: 20 },
    ingredients: ['Fresh Blueberries', 'Wheat Flour', 'Butter', 'Brown Sugar'],
    stock: 14,
    isPopular: false
  },
  { 
    id: 'veg-sandwich', 
    name: 'Veg Sandwich', 
    category: 'Snacks', 
    subtitle: 'Snacks', 
    price: 150, 
    image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&q=80&w=300',
    description: 'Fresh cucumbers, tomatoes, and bell peppers layered with cream cheese and spicy green chutney on sourdough bread.',
    dietary: ['Veg'],
    nutrition: { kcal: 310, caffeine: 0, sugar: 4 },
    ingredients: ['Sourdough Bread', 'Cucumber', 'Tomato', 'Bell Pepper', 'Cream Cheese'],
    stock: 0, // Out of Stock to show empty stock state
    isPopular: true
  },
  { 
    id: 'cheese-burger', 
    name: 'Cheese Burger', 
    category: 'Snacks', 
    subtitle: 'Snacks', 
    price: 160, 
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
    description: 'A grilled potato patty topped with cheddar cheese, crisp lettuce, red onions, gherkins, and house secret sauce.',
    dietary: ['Veg'],
    nutrition: { kcal: 420, caffeine: 0, sugar: 6 },
    ingredients: ['Brioche Bun', 'Potato Patty', 'Cheddar Slice', 'Lettuce', 'Secret Sauce'],
    stock: 16,
    isPopular: false
  }
];

// Search & Filter State
let searchFilter = '';
let currentCategoryFilter = 'All';

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
  // Render Category Tabs
  renderCategoryTabs();
  
  // Render Stats & Catalog
  renderMenu();
});

// Render Category Tabs Dynamically
function renderCategoryTabs() {
  const tabsContainer = document.getElementById('menu-category-tabs');
  if (!tabsContainer) return;

  const categories = ['All', 'Coffee', 'Cold Drinks', 'Tea', 'Snacks', 'Desserts'];
  tabsContainer.innerHTML = categories.map(cat => `
    <button class="view-menu-tab ${cat === currentCategoryFilter ? 'active' : ''}" onclick="selectCategory('${cat}', this)">
      ${cat}
    </button>
  `).join('');
}

function selectCategory(category, button) {
  currentCategoryFilter = category;
  
  // Update active state of tabs
  const tabs = document.querySelectorAll('.view-menu-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  if (button) button.classList.add('active');

  renderMenu();
}

// Render stats and items
function renderMenu() {
  const gridContainer = document.getElementById('view-menu-grid');
  const countEl = document.getElementById('menu-item-count');
  const statsContainer = document.getElementById('menu-stats-row');

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = currentCategoryFilter === 'All' || product.category === currentCategoryFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 1. Update count label
  if (countEl) {
    countEl.textContent = `${filteredProducts.length} Items`;
  }

  // 2. Render statistics row
  if (statsContainer) {
    const totalCount = products.length;
    const uniqueCategories = [...new Set(products.map(p => p.category))].length;
    const popularCount = products.filter(p => p.isPopular).length;
    
    // Calculate Price Range
    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = `₹${minPrice.toFixed(0)} - ₹${maxPrice.toFixed(0)}`;

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
    let stockClass = 'in-stock';
    let stockText = `In Stock (${item.stock})`;
    if (item.stock === 0) {
      stockClass = 'out-of-stock';
      stockText = 'Out of Stock';
    } else if (item.stock <= 10) {
      stockClass = 'low-stock';
      stockText = `Low Stock (${item.stock})`;
    }

    // Dietary badges HTML
    const dietBadgesHtml = item.dietary.map(diet => `
      <span class="diet-label ${diet.toLowerCase()}">${diet}</span>
    `).join(' ');

    const card = document.createElement('div');
    card.className = `view-menu-card ${item.stock === 0 ? 'inactive-card' : ''}`;
    card.setAttribute('onclick', `openProductModal('${item.id}')`);
    card.innerHTML = `
      <div class="view-menu-card-img-wrapper">
        <img src="${item.image}" alt="${item.name}" class="view-menu-card-img" onerror="this.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=300'">
        <span class="view-menu-card-badge">${item.subtitle || item.category}</span>
        ${item.isPopular ? '<span class="view-menu-card-popular">Popular</span>' : ''}
      </div>
      
      <div class="view-menu-card-body">
        <span class="view-menu-card-category">${item.category}</span>
        <div class="view-menu-card-title-row">
          <h3 class="view-menu-card-title">${item.name}</h3>
          <span class="view-menu-card-price">₹${item.price.toFixed(2)}</span>
        </div>
        
        <p class="view-menu-card-desc">${item.description}</p>
        
        <div class="view-menu-card-details">
          <div class="view-menu-card-specs">
            <span>Kcal: <strong>${item.nutrition.kcal}</strong></span>
            <span>Caffeine: <strong>${item.nutrition.caffeine}mg</strong></span>
            <span>Sugar: <strong>${item.nutrition.sugar}g</strong></span>
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

// Search Bar Filtering
function filterMenuBySearch() {
  const searchInput = document.getElementById('view-menu-search');
  if (searchInput) {
    searchFilter = searchInput.value;
    renderMenu();
  }
}

// Product Detail Modal Handlers
function openProductModal(id) {
  const item = products.find(p => p.id === id);
  if (!item) return;

  // Set image and basic info
  const imgEl = document.getElementById('modal-product-img');
  const titleEl = document.getElementById('modal-product-title');
  const priceEl = document.getElementById('modal-product-price');
  const descEl = document.getElementById('modal-product-desc');
  const categoryEl = document.getElementById('modal-product-category');
  const badgeEl = document.getElementById('modal-product-badge');

  if (imgEl) imgEl.src = item.image;
  if (titleEl) titleEl.textContent = item.name;
  if (priceEl) priceEl.textContent = `₹${item.price.toFixed(2)}`;
  if (descEl) descEl.textContent = item.description;
  if (categoryEl) categoryEl.textContent = item.category;
  if (badgeEl) badgeEl.textContent = item.subtitle || item.category;

  // Render ingredients
  const ingredientsContainer = document.getElementById('modal-product-ingredients');
  if (ingredientsContainer) {
    ingredientsContainer.innerHTML = item.ingredients.map(ing => `
      <span class="ingredient-tag">${ing}</span>
    `).join('');
  }

  // Render nutrition
  const kcalEl = document.getElementById('modal-nutrition-kcal');
  const caffeineEl = document.getElementById('modal-nutrition-caffeine');
  const sugarEl = document.getElementById('modal-nutrition-sugar');

  if (kcalEl) kcalEl.textContent = `${item.nutrition.kcal}`;
  if (caffeineEl) caffeineEl.textContent = `${item.nutrition.caffeine}mg`;
  if (sugarEl) sugarEl.textContent = `${item.nutrition.sugar}g`;

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

// Global modal close key listeners
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductModal();
  }
});
