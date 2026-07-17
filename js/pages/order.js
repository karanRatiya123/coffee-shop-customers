// --- Velvet Roast Online Order Logic (order.js) ---

// State Management
let cart = [];
let activeCategory = 'All';
let searchQuery = '';
let appliedCoupon = null;
let activeView = 'menu'; // 'menu' | 'history'

// Available Coupons
const VALID_COUPONS = {
    'VELVET20': 20,
    'BREW10': 10,
    'FIRSTBREW': 15
};

// Customizer State
let currentCustomizingProduct = null;

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Populate category tabs
    renderCategories();
    
    // 2. Render order catalog
    renderMenu();
    
    // 3. Load cart from localStorage if exists
    loadCartFromStorage();
    
    // 4. Populate pickup time options
    populatePickupTimes();

    // 5. Check if user came from product detail "Order Online" click
    checkDirectProductOrder();
});

// Populate Category Tabs
function renderCategories() {
    const categoriesContainer = document.getElementById('order-categories-slider');
    if (!categoriesContainer) return;

    const categories = ['All', 'Coffee', 'Cold Drinks', 'Tea', 'Snacks', 'Desserts'];
    categoriesContainer.innerHTML = categories.map(cat => `
        <button class="category-tab ${cat === activeCategory ? 'active' : ''}" onclick="selectCategory('${cat}', this)">
            ${cat}
        </button>
    `).join('');
}

function selectCategory(cat, btn) {
    activeCategory = cat;
    
    // Update active tab styles
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    renderMenu();
}

// Render Order Menu
function renderMenu() {
    const gridContainer = document.getElementById('order-grid');
    if (!gridContainer) return;

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              product.category.toLowerCase().includes(searchQuery.toLowerCase());
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
        const isOutOfStock = item.stock === 0;
        
        // Dietary dots
        const dietaryDots = item.dietary.map(diet => {
            let className = '';
            if (diet === 'Veg') className = 'veg';
            else if (diet === 'Vegan') className = 'vegan';
            else if (diet === 'Dairy-Free') className = 'dairy-free';
            return `<span class="diet-dot ${className}" title="${diet}"></span>`;
        }).join('');

        const card = document.createElement('div');
        card.className = `order-item-card ${isOutOfStock ? 'out-of-stock-card' : ''}`;
        card.innerHTML = `
            <div class="order-item-img-wrapper">
                <img src="${item.image}" alt="${item.name}" class="order-item-img" onerror="this.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=300'">
                <span class="order-item-badge">${item.subtitle || item.category}</span>
                ${item.isPopular ? '<span class="order-item-popular-badge">Bestseller</span>' : ''}
            </div>
            <div class="order-item-body">
                <div class="order-item-title-row">
                    <h3 class="order-item-title">${item.name}</h3>
                    <span class="order-item-price">₹${item.price}</span>
                </div>
                <p class="order-item-desc">${item.description}</p>
                <div class="order-item-footer">
                    <div class="dietary-indicators">
                        ${dietaryDots}
                    </div>
                    ${isOutOfStock ? 
                        `<span class="out-of-stock-label">Out of Stock</span>` : 
                        `<button type="button" class="add-to-cart-btn" onclick="triggerAddItem('${item.id}')">
                            <i class="fa-solid fa-plus"></i> Add
                         </button>`
                    }
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}


// Load cart from Storage
function loadCartFromStorage() {
    const storedCart = localStorage.getItem('velvet_roast_cart');
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
            renderCart();
        } catch (e) {
            console.error("Error parsing cart", e);
            cart = [];
        }
    }
}

// Save cart to storage
function saveCartToStorage() {
    localStorage.setItem('velvet_roast_cart', JSON.stringify(cart));
}

// Check for direct order parameter (e.g. from the product details modal redirect)
function checkDirectProductOrder() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId) {
        // Clear parameter from URL without refreshing the page
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        // Open customizer or add directly
        triggerAddItem(productId);
    }
}

// Add Item flow
function triggerAddItem(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if product requires customization (disabled to add items directly)
    const requiresCustomization = false;
    
    if (requiresCustomization) {
        openCustomizer(product);
    } else {
        // Add food/desserts directly with standard options
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
        
        saveCartToStorage();
        renderCart();
        showNotification(`${product.name} added to order!`, 'success');
    }
}

// Open Customizer Modal
function openCustomizer(product) {
    currentCustomizingProduct = product;
    
    // Set Header
    const modal = document.getElementById('customizer-modal');
    const titleEl = document.getElementById('cust-modal-title');
    const catEl = document.getElementById('cust-modal-category');
    const headerEl = document.getElementById('cust-modal-header');
    
    titleEl.textContent = product.name;
    catEl.textContent = product.category;
    headerEl.style.backgroundImage = `url('${product.image}')`;
    
    // Clear instructions
    document.getElementById('cust-special-instructions').value = '';
    
    // Build options dynamically based on category
    const optionsContainer = document.getElementById('cust-options-container');
    optionsContainer.innerHTML = '';
    
    let optionsHtml = '';
    
    // 1. Size Section (Applies to all drinks)
    optionsHtml += `
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
    
    // 2. Milk Section (Applies to Coffee and Tea)
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
    
    // 3. Extras Section
    let extras = [];
    if (['Coffee', 'Tea'].includes(product.category)) {
        extras = [
            { id: 'extra-espresso', name: 'Extra Shot', price: 30 },
            { id: 'whipped-cream', name: 'Whipped Cream', price: 25 },
            { id: 'caramel-drizzle', name: 'Caramel Drizzle', price: 20 },
            { id: 'vanilla-syrup', name: 'Vanilla Syrup', price: 20 }
        ];
    } else if (product.category === 'Cold Drinks') {
        extras = [
            { id: 'whipped-cream', name: 'Whipped Cream', price: 25 },
            { id: 'caramel-drizzle', name: 'Caramel Drizzle', price: 20 },
            { id: 'chocolate-chips', name: 'Choco Chips', price: 20 }
        ];
    }
    
    if (extras.length > 0) {
        const extrasGridHtml = extras.map(ext => `
            <label class="option-pill-label">
                <input type="checkbox" name="cust-extra" value="${ext.name}" data-price="${ext.price}" onchange="updateCustomizerPrice()">
                <span class="option-pill-name">${ext.name}</span>
                <span class="option-pill-price">+₹${ext.price}</span>
            </label>
        `).join('');
        
        optionsHtml += `
            <div style="margin-top: 1.5rem;">
                <h3 class="cust-section-title">Add Extras</h3>
                <div class="options-grid">
                    ${extrasGridHtml}
                </div>
            </div>
        `;
    }
    
    optionsContainer.innerHTML = optionsHtml;
    
    // Update price and open modal
    updateCustomizerPrice();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCustomizer() {
    const modal = document.getElementById('customizer-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
    currentCustomizingProduct = null;
}

// Calculate customizer price
function updateCustomizerPrice() {
    if (!currentCustomizingProduct) return;
    
    let totalPrice = currentCustomizingProduct.price;
    
    // Add Size pricing
    const sizeInput = document.querySelector('input[name="cust-size"]:checked');
    if (sizeInput) {
        totalPrice += parseFloat(sizeInput.getAttribute('data-price') || 0);
    }
    
    // Add Milk pricing
    const milkInput = document.querySelector('input[name="cust-milk"]:checked');
    if (milkInput) {
        totalPrice += parseFloat(milkInput.getAttribute('data-price') || 0);
    }
    
    // Add Extras pricing
    const checkedExtras = document.querySelectorAll('input[name="cust-extra"]:checked');
    checkedExtras.forEach(chk => {
        totalPrice += parseFloat(chk.getAttribute('data-price') || 0);
    });
    
    const priceText = document.getElementById('cust-modal-total-price');
    if (priceText) {
        priceText.textContent = `₹${totalPrice.toFixed(2)}`;
    }
}

// Confirm customized item addition
function addCustomizedItemToCart() {
    if (!currentCustomizingProduct) return;
    
    const sizeInput = document.querySelector('input[name="cust-size"]:checked');
    const sizeVal = sizeInput ? sizeInput.value : 'Regular';
    const sizePrice = sizeInput ? parseFloat(sizeInput.getAttribute('data-price') || 0) : 0;
    
    const milkInput = document.querySelector('input[name="cust-milk"]:checked');
    const milkVal = milkInput ? milkInput.value : 'None';
    const milkPrice = milkInput ? parseFloat(milkInput.getAttribute('data-price') || 0) : 0;
    
    const checkedExtras = document.querySelectorAll('input[name="cust-extra"]:checked');
    const extrasList = [];
    let extrasPrice = 0;
    checkedExtras.forEach(chk => {
        extrasList.push(chk.value);
        extrasPrice += parseFloat(chk.getAttribute('data-price') || 0);
    });
    
    const specialInstructions = document.getElementById('cust-special-instructions').value.trim();
    
    // Construct Options Summary Text
    let optionsTextList = [];
    optionsTextList.push(`Size: ${sizeVal}`);
    if (milkVal !== 'None' && milkVal !== 'Whole Milk') {
        optionsTextList.push(milkVal);
    }
    if (extrasList.length > 0) {
        optionsTextList.push(`Add: ${extrasList.join(', ')}`);
    }
    const optionsText = optionsTextList.join(' | ') || 'Standard';
    
    const finalPrice = currentCustomizingProduct.price + sizePrice + milkPrice + extrasPrice;
    
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
            extras: extrasList
        },
        instructions: specialInstructions
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
    
    saveCartToStorage();
    renderCart();
    closeCustomizer();
    showNotification(`${currentCustomizingProduct.name} customized & added!`, 'success');
}

// Render Cart
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const proceedBtn = document.getElementById('proceed-checkout-btn');
    if (!container) return;

    if (cart.length === 0) {
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

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-customizations">
                    ${item.customizations.optionsText}
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
    
    saveCartToStorage();
    renderCart();
}

function removeFromCart(uniqueId) {
    cart = cart.filter(i => i.uniqueId !== uniqueId);
    saveCartToStorage();
    renderCart();
}

function clearCart() {
    if (cart.length === 0) return;
    if (confirm("Are you sure you want to clear your current order?")) {
        cart = [];
        saveCartToStorage();
        renderCart();
        showNotification("Order cleared.", "success");
    }
}

// Update Totals (Prices)
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
    const taxAmount = netAmount * 0.05; // 5% GST
    const totalAmount = netAmount + taxAmount;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `₹${taxAmount.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${totalAmount.toFixed(2)}`;
}

// Apply Coupon code
function applyCoupon() {
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

    if (VALID_COUPONS.hasOwnProperty(code)) {
        appliedCoupon = {
            code: code,
            discountPercent: VALID_COUPONS[code]
        };

        // UI toggles
        document.getElementById('coupon-area').classList.add('hidden');
        const badge = document.getElementById('applied-coupon-badge');
        badge.classList.remove('hidden');
        document.getElementById('applied-coupon-name').textContent = code;
        document.getElementById('coupon-discount-percentage').textContent = VALID_COUPONS[code];

        // Recalculate totals
        let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        updateTotals(subtotal);
        showNotification(`Coupon ${code} applied successfully!`, 'success');
        
        if (input) input.value = '';
    } else {
        showNotification("Invalid coupon code.", "error");
    }
}

function removeCoupon() {
    appliedCoupon = null;
    document.getElementById('coupon-area').classList.remove('hidden');
    document.getElementById('applied-coupon-badge').classList.add('hidden');
    
    let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    updateTotals(subtotal);
    showNotification("Coupon removed.", "success");
}

// Populate pickup select picker with intervals
function populatePickupTimes() {
    const select = document.getElementById('pickup-time-select');
    if (!select) return;

    select.innerHTML = '';
    
    const now = new Date();
    // Add 15 mins buffer
    now.setMinutes(now.getMinutes() + 15);
    
    // Round minutes to next 5 or 15 mins block
    let minutes = now.getMinutes();
    let roundMins = Math.ceil(minutes / 15) * 15;
    now.setMinutes(roundMins);
    now.setSeconds(0);
    
    // Add 15-minute slots for the next 4 hours
    for (let i = 0; i < 16; i++) {
        let hr = now.getHours();
        let min = now.getMinutes();
        let ampm = hr >= 12 ? 'PM' : 'AM';
        
        let hrFormatted = hr % 12;
        hrFormatted = hrFormatted ? hrFormatted : 12; // if 0, write 12
        let minFormatted = min < 10 ? '0' + min : min;
        
        const timeStr = `${hrFormatted}:${minFormatted} ${ampm}`;
        const option = document.createElement('option');
        option.value = timeStr;
        option.textContent = timeStr + (i === 0 ? ' (Earliest)' : '');
        select.appendChild(option);
        
        // Increment by 15 mins
        now.setMinutes(now.getMinutes() + 15);
    }
}

// Proceed to Checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification("Your cart is empty.", "error");
        return;
    }

    const select = document.getElementById('pickup-time-select');
    const pickupTime = select ? select.value : '';

    // Calculate checkout state variables
    let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let discountAmount = 0;
    if (appliedCoupon) {
        discountAmount = subtotal * (appliedCoupon.discountPercent / 100);
    }
    const netAmount = subtotal - discountAmount;
    const taxAmount = netAmount * 0.05;
    const totalAmount = netAmount + taxAmount;

    const checkoutData = {
        cart: cart,
        coupon: appliedCoupon,
        subtotal: subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: totalAmount,
        pickupTime: pickupTime
    };

    localStorage.setItem('velvet_roast_checkout', JSON.stringify(checkoutData));
    
    // Redirect to checkout.html
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
        menuView.classList.add('hidden');
        historyView.classList.remove('hidden');
        titleEl.textContent = 'My Order History';
        descEl.textContent = 'View your recent craft coffee orders, track their progress, or quickly reorder.';
        btnText.textContent = 'Back to Ordering';
        toggleBtn.classList.add('active');
        renderHistory();
    } else {
        activeView = 'menu';
        menuView.classList.remove('hidden');
        historyView.classList.add('hidden');
        titleEl.textContent = 'Order Online';
        descEl.textContent = 'Select your favorites, customize to your taste, and pick up fresh at our counter.';
        btnText.textContent = 'Order History';
        toggleBtn.classList.remove('active');
        renderMenu();
    }
}

// Render Order History from localStorage
function renderHistory() {
    const container = document.getElementById('history-list-container');
    if (!container) return;

    const storedOrders = localStorage.getItem('velvet_roast_orders');
    let orders = [];
    if (storedOrders) {
        try {
            orders = JSON.parse(storedOrders);
        } catch (e) {
            console.error("Error reading past orders", e);
        }
    }

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="no-history-state">
                <i class="fa-solid fa-mug-hot no-history-icon"></i>
                <h3>No order history found</h3>
                <p>You haven't placed any online orders yet. Experience express pickup today!</p>
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
        // Items list rendering
        const itemsHtml = order.cart.map(item => `
            <div class="history-item-line">
                <span>${item.quantity}x ${item.name} <small style="color: var(--text-muted);">(${item.customizations.optionsText})</small></span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        // Action buttons based on status
        let actionsHtml = `<button type="button" class="history-btn" onclick="reorder('${order.id}')"><i class="fa-solid fa-rotate-left"></i> Reorder</button>`;
        if (order.status === 'placed') {
            actionsHtml += `<button type="button" class="history-btn" onclick="cancelOrder('${order.id}')" style="border-color: var(--error-color); color: var(--error-color);"><i class="fa-solid fa-trash"></i> Cancel Order</button>`;
        }

        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="history-header">
                <div class="history-id-date">
                    <span class="history-id">Order #${order.id}</span>
                    <span class="history-date">${order.date} — Pickup at ${order.pickupTime}</span>
                </div>
                <span class="history-status-badge ${order.status}">${order.status}</span>
            </div>
            <div class="history-items">
                ${itemsHtml}
            </div>
            <div class="history-footer">
                <span>Payment Method: <strong>${order.paymentMethod}</strong></span>
                <span class="history-total">Total: ₹${order.total.toFixed(2)}</span>
            </div>
            <div class="history-actions" style="margin-top: 0.5rem; justify-content: flex-end;">
                ${actionsHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

// Reorder past items
function reorder(orderId) {
    const storedOrders = localStorage.getItem('velvet_roast_orders');
    if (!storedOrders) return;

    try {
        const orders = JSON.parse(storedOrders);
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // Copy order items into current cart
        // Reset uniqueIds so they don't clash
        const reorderedCart = order.cart.map(item => {
            return {
                ...item,
                uniqueId: Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            };
        });

        // Prompt confirmation if cart has items
        if (cart.length > 0) {
            if (!confirm("This will replace your current cart items. Do you want to proceed?")) {
                return;
            }
        }

        cart = reorderedCart;
        saveCartToStorage();
        renderCart();
        
        // Go to menu view
        toggleOrderView();
        showNotification("Items from past order added to cart!", "success");
    } catch (e) {
        console.error("Reorder error", e);
    }
}

// Cancel placed order
function cancelOrder(orderId) {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    const storedOrders = localStorage.getItem('velvet_roast_orders');
    if (!storedOrders) return;

    try {
        let orders = JSON.parse(storedOrders);
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        orders[orderIndex].status = 'cancelled';
        localStorage.setItem('velvet_roast_orders', JSON.stringify(orders));
        renderHistory();
        showNotification(`Order #${orderId} has been cancelled.`, 'success');
    } catch (e) {
        console.error("Cancel order error", e);
    }
}

// Notifications Helper
function showNotification(msg, type = 'success') {
    const successBox = document.getElementById('order-alert-success');
    const successText = document.getElementById('order-alert-success-text');
    const errorBox = document.getElementById('order-alert-error');
    const errorText = document.getElementById('order-alert-error-text');

    if (type === 'success') {
        successText.textContent = msg;
        successBox.classList.remove('hidden');
        errorBox.classList.add('hidden');
        
        setTimeout(() => {
            successBox.classList.add('hidden');
        }, 4000);
    } else {
        errorText.textContent = msg;
        errorBox.classList.remove('hidden');
        successBox.classList.add('hidden');
        
        setTimeout(() => {
            errorBox.classList.add('hidden');
        }, 4000);
    }
}

// Modal escape close support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCustomizer();
    }
});
