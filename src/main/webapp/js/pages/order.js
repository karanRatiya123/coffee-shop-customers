// --- Velvet Roast Online Order Logic (order.js) ---
// Prepared for Java Servlet + MySQL Backend Integration

// State Management
let cart = [];
let activeCategory = 'All';
let searchQuery = '';
let appliedCoupon = null;
let activeView = 'menu'; // 'menu' | 'history'
let currentProducts = [];
let currentCategories = ['All'];
let currentCustomizingProduct = null;

// On Page Load
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch categories from CategoryServlet
    await loadCategories();

    // 2. Fetch products from MenuServlet
    await loadProducts();

    // 3. Fetch cart from CartServlet (or transient session state)
    await loadCart();

    // 4. Check if user came from product detail "Order Online" click
    checkDirectProductOrder();
});

// Fetch categories from CategoryServlet
async function loadCategories() {
    if (typeof ApiService !== 'undefined' && ApiService.loadCategories) {
        const categoriesData = await ApiService.loadCategories();
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
            currentCategories = ['All', ...categoriesData.map(c => typeof c === 'string' ? c : (c.name || c.categoryName))];
        }
    }
    renderCategories(currentCategories);
}

// TODO: Fetch products from MenuServlet
async function loadProducts() {
    if (typeof ApiService !== 'undefined' && ApiService.loadProducts) {
        currentProducts = await ApiService.loadProducts(activeCategory, searchQuery);
    } else {
        currentProducts = [];
    }
    renderProducts(currentProducts);
}

// TODO: Fetch cart from CartServlet
async function loadCart() {
    if (typeof ApiService !== 'undefined' && ApiService.loadCart) {
        const cartData = await ApiService.loadCart();
        if (Array.isArray(cartData)) {
            cart = cartData;
        }
    }
    renderCart(cart);
}

// TODO: Fetch order history from OrderServlet
async function loadOrderHistory() {
    let orders = [];
    if (typeof ApiService !== 'undefined' && ApiService.getOrderStatus) {
        // Fetch order history from OrderServlet
        const fetched = await ApiService.getOrderStatus('history');
        if (Array.isArray(fetched)) orders = fetched;
    }
    renderOrderHistory(orders);
}

// Populate Category Tabs (accepts dynamic data)
function renderCategories(categories = []) {
    const categoriesContainer = document.getElementById('order-categories-slider');
    if (!categoriesContainer) return;

    const cats = Array.isArray(categories) && categories.length > 0 ? categories : ['All'];
    categoriesContainer.innerHTML = cats.map(cat => `
        <button class="category-tab ${cat === activeCategory ? 'active' : ''}" onclick="filterCategory('${cat}', this)">
            ${cat}
        </button>
    `).join('');
}

// Action Handler: Category Filter
function filterCategory(cat, btn) {
    activeCategory = cat;
    
    // Update active tab styles
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    loadProducts();
}

// Render Order Menu (accepts dynamic products data)
function renderProducts(productsList = []) {
    const gridContainer = document.getElementById('order-grid');
    if (!gridContainer) return;

    const items = Array.isArray(productsList) ? productsList : [];

    const filteredProducts = items.filter(product => {
        const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
        const matchesSearch = !searchQuery || 
                              (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                              (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                              (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    gridContainer.innerHTML = '';

    if (filteredProducts.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; margin-bottom: 1rem; display: block; color: var(--border-color);"></i>
                <p>No products match your search or filter.</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(item => {
        const stock = Number(item.stock || 0);
        const isOutOfStock = stock === 0;
        const dietaryList = Array.isArray(item.dietary) ? item.dietary : [];
        
        // Dietary dots
        const dietaryDots = dietaryList.map(diet => {
            let className = '';
            const dLower = String(diet).toLowerCase();
            if (dLower === 'veg') className = 'veg';
            else if (dLower === 'vegan') className = 'vegan';
            else if (dLower === 'dairy-free') className = 'dairy-free';
            return `<span class="diet-dot ${className}" title="${diet}"></span>`;
        }).join('');

        const card = document.createElement('div');
        card.className = `order-item-card ${isOutOfStock ? 'out-of-stock-card' : ''}`;
        card.innerHTML = `
            <div class="order-item-img-wrapper" onclick="viewProduct('${item.id}')">
                <img src="${item.image || ''}" alt="${item.name || ''}" class="order-item-img" onerror="this.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=300'">
                <span class="order-item-badge">${item.subtitle || item.category || 'Coffee'}</span>
                ${item.isPopular ? '<span class="order-item-popular-badge">Bestseller</span>' : ''}
            </div>
            <div class="order-item-body">
                <div class="order-item-title-row">
                    <h3 class="order-item-title" onclick="viewProduct('${item.id}')">${item.name || ''}</h3>
                    <span class="order-item-price">₹${Number(item.price || 0).toFixed(2)}</span>
                </div>
                <p class="order-item-desc">${item.description || ''}</p>
                <div class="order-item-footer">
                    <div class="dietary-indicators">
                        ${dietaryDots}
                    </div>
                    ${isOutOfStock ? 
                        `<span class="out-of-stock-label">Out of Stock</span>` : 
                        `<button type="button" class="add-to-cart-btn" onclick="addToCart('${item.id}')">
                            <i class="fa-solid fa-plus"></i> Add
                         </button>`
                    }
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

// Action Handler: Search Products
function searchProducts(query) {
    searchQuery = query || '';
    loadProducts();
}

// Action Handler: View Product / Direct Details
function viewProduct(productId) {
    const product = currentProducts.find(p => p.id === productId || String(p.id) === String(productId));
    if (!product) return;
    openCustomizer(product);
}

// Action Handler: Order Now
function orderNow(productId) {
    addToCart(productId);
    proceedToCheckout();
}

// Action Handler: Toggle Wishlist
function toggleWishlist(productId) {
    console.log(`[Wishlist] Toggled wishlist for product ${productId}`);
    // TODO: Send wishlist update to Servlet
}

// Action Handler: Add Item to Cart Flow
async function addToCart(productId) {
    const product = currentProducts.find(p => p.id === productId || String(p.id) === String(productId));
    if (!product) return;

    // TODO: Add to Cart via CartServlet
    if (typeof ApiService !== 'undefined' && ApiService.addToCart) {
        await ApiService.addToCart(productId, 1, {});
    }

    const cartItem = {
        uniqueId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        image: product.image,
        basePrice: product.price,
        price: product.price,
        quantity: 1,
        customizations: {
            optionsText: 'Standard',
            size: 'Regular',
            milk: 'None',
            extras: []
        },
        instructions: ''
    };
    
    // Check if identical item is already in cart
    const existingItem = cart.find(item => 
        item.productId === cartItem.productId && 
        item.customizations.optionsText === cartItem.customizations.optionsText &&
        item.instructions === cartItem.instructions
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push(cartItem);
    }
    
    renderCart(cart);
    showNotification(`${product.name} added to order!`, 'success');
}

// Check for direct order parameter
function checkDirectProductOrder() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        addToCart(productId);
    }
}

// Open Customizer Modal
function openCustomizer(product) {
    currentCustomizingProduct = product;
    
    const modal = document.getElementById('customizer-modal');
    const titleEl = document.getElementById('cust-modal-title');
    const catEl = document.getElementById('cust-modal-category');
    const headerEl = document.getElementById('cust-modal-header');
    
    if (titleEl) titleEl.textContent = product.name || '';
    if (catEl) catEl.textContent = product.category || '';
    if (headerEl) headerEl.style.backgroundImage = `url('${product.image || ''}')`;
    
    const instEl = document.getElementById('cust-special-instructions');
    if (instEl) instEl.value = '';
    
    const optionsContainer = document.getElementById('cust-options-container');
    if (!optionsContainer) return;
    optionsContainer.innerHTML = '';
    
    let optionsHtml = `
        <div>
            <h3 class="cust-section-title">Select Size</h3>
            <div class="options-grid">
                <label class="option-pill-label">
                    <input type="radio" name="cust-size" value="Regular" data-price="0" checked onchange="updateCustomizerPrice()">
                    <span class="option-pill-name">Regular</span>
                    <span class="option-pill-price">Included</span>
                </label>
                <label class="option-pill-label">
                    <input type="radio" name="cust-size" value="Large" data-price="30" onchange="updateCustomizerPrice()">
                    <span class="option-pill-name">Large</span>
                    <span class="option-pill-price">+₹30</span>
                </label>
            </div>
        </div>
    `;
    
    if (['Coffee', 'Tea'].includes(product.category)) {
        optionsHtml += `
            <div style="margin-top: 1.5rem;">
                <h3 class="cust-section-title">Milk Choices</h3>
                <div class="options-grid">
                    <label class="option-pill-label">
                        <input type="radio" name="cust-milk" value="Whole Milk" data-price="0" checked onchange="updateCustomizerPrice()">
                        <span class="option-pill-name">Whole Milk</span>
                        <span class="option-pill-price">Free</span>
                    </label>
                    <label class="option-pill-label">
                        <input type="radio" name="cust-milk" value="Oat Milk" data-price="40" onchange="updateCustomizerPrice()">
                        <span class="option-pill-name">Oat Milk</span>
                        <span class="option-pill-price">+₹40</span>
                    </label>
                    <label class="option-pill-label">
                        <input type="radio" name="cust-milk" value="Almond Milk" data-price="40" onchange="updateCustomizerPrice()">
                        <span class="option-pill-name">Almond Milk</span>
                        <span class="option-pill-price">+₹40</span>
                    </label>
                </div>
            </div>
        `;
    }
    
    optionsContainer.innerHTML = optionsHtml;
    updateCustomizerPrice();
    if (modal) modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCustomizer() {
    const modal = document.getElementById('customizer-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
    currentCustomizingProduct = null;
}

function updateCustomizerPrice() {
    if (!currentCustomizingProduct) return;
    
    let totalPrice = Number(currentCustomizingProduct.price || 0);
    const sizeInput = document.querySelector('input[name="cust-size"]:checked');
    if (sizeInput) totalPrice += parseFloat(sizeInput.getAttribute('data-price') || 0);
    
    const milkInput = document.querySelector('input[name="cust-milk"]:checked');
    if (milkInput) totalPrice += parseFloat(milkInput.getAttribute('data-price') || 0);
    
    const priceText = document.getElementById('cust-modal-total-price');
    if (priceText) priceText.textContent = `₹${totalPrice.toFixed(2)}`;
}

function addCustomizedItemToCart() {
    if (!currentCustomizingProduct) return;
    
    const sizeInput = document.querySelector('input[name="cust-size"]:checked');
    const sizeVal = sizeInput ? sizeInput.value : 'Regular';
    const sizePrice = sizeInput ? parseFloat(sizeInput.getAttribute('data-price') || 0) : 0;
    
    const milkInput = document.querySelector('input[name="cust-milk"]:checked');
    const milkVal = milkInput ? milkInput.value : 'None';
    const milkPrice = milkInput ? parseFloat(milkInput.getAttribute('data-price') || 0) : 0;
    
    const instEl = document.getElementById('cust-special-instructions');
    const specialInstructions = instEl ? instEl.value.trim() : '';
    
    const optionsText = `Size: ${sizeVal}${milkVal !== 'None' ? ' | ' + milkVal : ''}`;
    const finalPrice = Number(currentCustomizingProduct.price || 0) + sizePrice + milkPrice;
    
    const cartItem = {
        uniqueId: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        productId: currentCustomizingProduct.id,
        name: currentCustomizingProduct.name,
        image: currentCustomizingProduct.image,
        basePrice: currentCustomizingProduct.price,
        price: finalPrice,
        quantity: 1,
        customizations: {
            optionsText: optionsText,
            size: sizeVal,
            milk: milkVal,
            extras: []
        },
        instructions: specialInstructions
    };

    cart.push(cartItem);
    renderCart(cart);
    closeCustomizer();
    showNotification(`${currentCustomizingProduct.name} added!`, 'success');
}

// Render Cart (accepts dynamic cart data)
function renderCart(cartItems = []) {
    const container = document.getElementById('cart-items-container');
    const proceedBtn = document.getElementById('proceed-checkout-btn');
    if (!container) return;

    const items = Array.isArray(cartItems) ? cartItems : [];

    if (items.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-state">
                <i class="fa-solid fa-mug-hot cart-empty-icon"></i>
                <p>Your cart is empty.<br>Add some premium brews to get started!</p>
            </div>
        `;
        if (proceedBtn) proceedBtn.disabled = true;
        updateTotals(0);
        return;
    }

    if (proceedBtn) proceedBtn.disabled = false;
    container.innerHTML = '';
    
    let subtotal = 0;

    items.forEach(item => {
        const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
        subtotal += itemTotal;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name || ''}</div>
                <div class="cart-item-customizations">
                    ${item.customizations?.optionsText || 'Standard'}
                    ${item.instructions ? `<div style="font-style: italic; margin-top: 0.15rem; color: var(--text-muted);">"${item.instructions}"</div>` : ''}
                </div>
                <div class="cart-item-price-qty">
                    <span class="cart-item-price">₹${itemTotal.toFixed(2)}</span>
                    <div class="qty-controls">
                        <button type="button" class="qty-btn" onclick="updateQty('${item.uniqueId}', -1)"><i class="fa-solid fa-minus"></i></button>
                        <span class="qty-val">${item.quantity}</span>
                        <button type="button" class="qty-btn" onclick="updateQty('${item.uniqueId}', 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>
            <button type="button" class="cart-item-remove" onclick="removeFromCart('${item.uniqueId}')" title="Remove item">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        container.appendChild(itemEl);
    });

    updateTotals(subtotal);
}

// Update quantities
function updateQty(uniqueId, change) {
    const item = cart.find(item => item.uniqueId === uniqueId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.uniqueId !== uniqueId);
    }
    
    renderCart(cart);
}

function removeFromCart(uniqueId) {
    cart = cart.filter(i => i.uniqueId !== uniqueId);
    renderCart(cart);
}

function clearCart() {
    if (cart.length === 0) return;
    cart = [];
    renderCart(cart);
}

function updateTotals(subtotal) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount');
    const discountRow = document.getElementById('discount-summary-row');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');

    let discountAmount = 0;
    if (appliedCoupon && subtotal > 0) {
        discountAmount = subtotal * (appliedCoupon.discountPercent / 100);
        if (discountEl) discountEl.textContent = `-₹${discountAmount.toFixed(2)}`;
        if (discountRow) discountRow.classList.remove('hidden');
    } else {
        if (discountRow) discountRow.classList.add('hidden');
    }

    const netAmount = subtotal - discountAmount;
    const taxAmount = netAmount * 0.05;
    const totalAmount = netAmount + taxAmount;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `₹${taxAmount.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${totalAmount.toFixed(2)}`;
}

// TODO: Validate coupon via OfferServlet
async function applyCoupon() {
    if (cart.length === 0) {
        showNotification("Add items to your order first.", "error");
        return;
    }

    const input = document.getElementById('coupon-code-input');
    const code = input ? input.value.trim().toUpperCase() : '';
    
    if (code === '') {
        showNotification("Please enter a coupon code.", "error");
        return;
    }

    // Call OfferServlet API
    if (typeof ApiService !== 'undefined' && ApiService.applyCoupon) {
        const result = await ApiService.applyCoupon(code);
        if (result && result.valid) {
            appliedCoupon = { code: code, discountPercent: result.discountPercent || 10 };
            document.getElementById('coupon-area')?.classList.add('hidden');
            const badge = document.getElementById('applied-coupon-badge');
            if (badge) badge.classList.remove('hidden');
            document.getElementById('applied-coupon-name').textContent = code;
            document.getElementById('coupon-discount-percentage').textContent = appliedCoupon.discountPercent;
            
            let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            updateTotals(subtotal);
            showNotification(`Coupon ${code} applied!`, 'success');
            if (input) input.value = '';
            return;
        }
    }

    showNotification("OfferServlet API not connected or invalid code.", "error");
}

function removeCoupon() {
    appliedCoupon = null;
    document.getElementById('coupon-area')?.classList.remove('hidden');
    document.getElementById('applied-coupon-badge')?.classList.add('hidden');
    
    let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    updateTotals(subtotal);
}

// Proceed to Checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification("Your cart is empty.", "error");
        return;
    }

    let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let discountAmount = appliedCoupon ? subtotal * (appliedCoupon.discountPercent / 100) : 0;
    const netAmount = subtotal - discountAmount;
    const taxAmount = netAmount * 0.05;
    const totalAmount = netAmount + taxAmount;

    const checkoutData = {
        cart: cart,
        coupon: appliedCoupon,
        subtotal: subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: totalAmount
    };

    sessionStorage.setItem('velvet_roast_checkout', JSON.stringify(checkoutData));
    window.location.href = 'checkout.html';
}

// Toggle between Menu grid and past orders
function toggleOrderView() {
    const menuView = document.getElementById('menu-order-view');
    const historyView = document.getElementById('history-order-view');
    const titleEl = document.getElementById('page-view-title');
    const descEl = document.getElementById('page-view-desc');
    const btnText = document.getElementById('toggle-btn-text');
    const toggleBtn = document.getElementById('toggle-order-view-btn');

    if (activeView === 'menu') {
        activeView = 'history';
        menuView?.classList.add('hidden');
        historyView?.classList.remove('hidden');
        if (titleEl) titleEl.textContent = 'My Order History';
        if (descEl) descEl.textContent = 'View your recent craft coffee orders and status.';
        if (btnText) btnText.textContent = 'Back to Ordering';
        toggleBtn?.classList.add('active');
        loadOrderHistory();
    } else {
        activeView = 'menu';
        menuView?.classList.remove('hidden');
        historyView?.classList.add('hidden');
        if (titleEl) titleEl.textContent = 'Order Online';
        if (descEl) descEl.textContent = 'Select your favorites, customize to your taste, and pick up fresh at our counter.';
        if (btnText) btnText.textContent = 'Order History';
        toggleBtn?.classList.remove('active');
        renderProducts(currentProducts);
    }
}

// Render Order History (accepts dynamic orders array)
function renderOrderHistory(ordersList = []) {
    const container = document.getElementById('history-list-container');
    if (!container) return;

    const orders = Array.isArray(ordersList) ? ordersList : [];

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="no-history-state">
                <i class="fa-solid fa-mug-hot no-history-icon"></i>
                <h3>No order history found</h3>
                <p>You haven't placed any online order requests yet.</p>
                <button type="button" class="submit-btn" onclick="toggleOrderView()">
                    <span class="btn-text">Start Order Now</span>
                    <span class="btn-glow"></span>
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    orders.forEach(order => {
        const itemsHtml = (order.cart || []).map(item => `
            <div class="history-item-line">
                <span>${item.quantity}x ${item.name}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="history-header">
                <span class="history-id">Order #${order.id}</span>
                <span class="history-status-badge ${order.status}">${order.status}</span>
            </div>
            <div class="history-items">${itemsHtml}</div>
            <div class="history-footer">
                <span class="history-total">Total: ₹${Number(order.total || 0).toFixed(2)}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function showNotification(msg, type = 'info') {
    const successBox = document.getElementById('order-alert-success');
    const successText = document.getElementById('order-alert-success-text');
    if (successBox && successText) {
        successText.textContent = msg;
        successBox.classList.remove('hidden');
        setTimeout(() => successBox.classList.add('hidden'), 3000);
    }
}
