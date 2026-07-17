// --- Velvet Roast Checkout Page Logic (checkout.js) ---

let checkoutData = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load data from local storage
    const rawData = localStorage.getItem('velvet_roast_checkout');
    if (!rawData) {
        window.location.replace('order.html');
        return;
    }

    try {
        checkoutData = JSON.parse(rawData);
    } catch (e) {
        console.error("Error parsing checkout data", e);
        window.location.replace('order.html');
        return;
    }

    // 2. Pre-fill user information if available
    prefillUserData();

    // 3. Render Order Summary Details
    renderCheckoutSummary();

    // 4. Bind credit card auto-formatters
    bindInputFormatters();
});

// Auto-fill customer details from session
function prefillUserData() {
    const sessionName = sessionStorage.getItem('userName') || '';
    const nameInput = document.getElementById('cust-name');
    if (nameInput && sessionName) {
        nameInput.value = sessionName;
    }
}

// Render Order items list and totals
function renderCheckoutSummary() {
    if (!checkoutData) return;

    // Pickup time
    const timeDisplay = document.getElementById('checkout-pickup-time-display');
    if (timeDisplay) timeDisplay.textContent = checkoutData.pickupTime;

    // Items list
    const container = document.getElementById('checkout-items-list');
    if (container) {
        container.innerHTML = checkoutData.cart.map(item => `
            <div class="summary-item-line">
                <div class="summary-item-info">
                    <span class="summary-item-title">${item.quantity}x ${item.name}</span>
                    <div class="summary-item-options">${item.customizations.optionsText}</div>
                </div>
                <span class="summary-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }

    // Totals
    const subtotalEl = document.getElementById('checkout-subtotal');
    const discountEl = document.getElementById('checkout-discount');
    const discountRow = document.getElementById('checkout-discount-row');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');

    if (subtotalEl) subtotalEl.textContent = `₹${checkoutData.subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `₹${checkoutData.tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${checkoutData.total.toFixed(2)}`;

    if (checkoutData.discount > 0) {
        if (discountEl) discountEl.textContent = `-₹${checkoutData.discount.toFixed(2)}`;
        if (discountRow) discountRow.classList.remove('hidden');
    } else {
        if (discountRow) discountRow.classList.add('hidden');
    }
}

// Format credit card and date inputs
function bindInputFormatters() {
    const cardInput = document.getElementById('card-num');
    const expiryInput = document.getElementById('card-expiry');
    const cvvInput = document.getElementById('card-cvv');
    const phoneInput = document.getElementById('cust-phone');

    if (cardInput) {
        cardInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            let formatted = '';
            for (let i = 0; i < val.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += ' ';
                formatted += val[i];
            }
            e.target.value = formatted;
        });
    }

    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length >= 2) {
                e.target.value = val.slice(0, 2) + '/' + val.slice(2, 4);
            } else {
                e.target.value = val;
            }
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // allows digits and spaces, dashes
            let val = e.target.value.replace(/[^\d\s\-\+\(\)]/g, '');
            e.target.value = val;
        });
    }
}

// Toggle visible fields based on payment option
function togglePaymentFields() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    const cashPanel = document.getElementById('payment-cash-panel');
    const upiPanel = document.getElementById('payment-upi-panel');
    const cardPanel = document.getElementById('payment-card-panel');

    cashPanel.classList.remove('active');
    upiPanel.classList.remove('active');
    cardPanel.classList.remove('active');

    if (selectedMethod === 'Cash') {
        cashPanel.classList.add('active');
    } else if (selectedMethod === 'UPI') {
        upiPanel.classList.add('active');
    } else if (selectedMethod === 'Card') {
        cardPanel.classList.add('active');
    }
}

// Validate fields
function validateCheckoutForm() {
    let isValid = true;
    
    // Clear all errors
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(e => e.style.display = 'none');
    const wrappers = document.querySelectorAll('.input-wrapper');
    wrappers.forEach(w => w.classList.remove('invalid', 'valid'));

    // Validate Name
    const nameVal = document.getElementById('cust-name').value.trim();
    const nameWrapper = document.getElementById('cust-name-wrapper');
    const nameError = document.getElementById('cust-name-error');
    if (!nameVal) {
        nameWrapper.classList.add('invalid');
        nameError.style.display = 'block';
        isValid = false;
    } else {
        nameWrapper.classList.add('valid');
    }

    // Validate Phone
    const phoneVal = document.getElementById('cust-phone').value.trim();
    const phoneWrapper = document.getElementById('cust-phone-wrapper');
    const phoneError = document.getElementById('cust-phone-error');
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
    if (!phoneVal || !phoneRegex.test(phoneVal)) {
        phoneWrapper.classList.add('invalid');
        phoneError.style.display = 'block';
        isValid = false;
    } else {
        phoneWrapper.classList.add('valid');
    }

    // Payment specific validations
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    if (selectedMethod === 'UPI') {
        const upiVal = document.getElementById('payment-upi-id').value.trim();
        const upiWrapper = document.getElementById('upi-wrapper');
        const upiError = document.getElementById('upi-error');
        if (!upiVal || !upiVal.includes('@')) {
            upiWrapper.classList.add('invalid');
            upiError.style.display = 'block';
            isValid = false;
        } else {
            upiWrapper.classList.add('valid');
        }
    } else if (selectedMethod === 'Card') {
        const cardVal = document.getElementById('card-num').value.replace(/\s/g, '');
        const cardWrapper = document.getElementById('card-num-wrapper');
        const cardError = document.getElementById('card-num-error');
        if (!cardVal || cardVal.length < 15) {
            cardWrapper.classList.add('invalid');
            cardError.style.display = 'block';
            isValid = false;
        } else {
            cardWrapper.classList.add('valid');
        }

        const expiryVal = document.getElementById('card-expiry').value.trim();
        const expiryWrapper = document.getElementById('card-expiry-wrapper');
        const expiryError = document.getElementById('card-expiry-error');
        if (!expiryVal || !expiryVal.includes('/') || expiryVal.length < 5) {
            expiryWrapper.classList.add('invalid');
            expiryError.style.display = 'block';
            isValid = false;
        } else {
            const parts = expiryVal.split('/');
            const month = parseInt(parts[0], 10);
            const year = parseInt('20' + parts[1], 10);
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            
            if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
                expiryWrapper.classList.add('invalid');
                expiryError.style.display = 'block';
                isValid = false;
            } else {
                expiryWrapper.classList.add('valid');
            }
        }

        const cvvVal = document.getElementById('card-cvv').value.trim();
        const cvvWrapper = document.getElementById('card-cvv-wrapper');
        const cvvError = document.getElementById('card-cvv-error');
        if (!cvvVal || cvvVal.length < 3) {
            cvvWrapper.classList.add('invalid');
            cvvError.style.display = 'block';
            isValid = false;
        } else {
            cvvWrapper.classList.add('valid');
        }
    }

    return isValid;
}

// Submit checkout form
async function submitCheckout(event) {
    event.preventDefault();

    if (!checkoutData) return;

    const isFormValid = validateCheckoutForm();
    if (!isFormValid) {
        showErrorAlert("Please resolve the input errors before placing your order.");
        return;
    }

    // Clear alert
    document.getElementById('checkout-alert-error').classList.add('hidden');

    // Loading State
    const submitBtn = document.getElementById('place-order-btn');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="flex items-center justify-center gap-2">
            <svg class="loader-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Transmitting Order...
        </span>
    `;

    try {
        // Simulate network transmit latency
        await new Promise(res => setTimeout(res, 1200));

        // Format Date
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

        // Create unique Order ID
        const orderId = 1000 + Math.floor(Math.random() * 9000);
        
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;

        // Construct final placed order
        const placedOrder = {
            id: orderId.toString(),
            date: dateStr,
            cart: checkoutData.cart,
            pickupTime: checkoutData.pickupTime,
            paymentMethod: selectedMethod,
            subtotal: checkoutData.subtotal,
            discount: checkoutData.discount,
            tax: checkoutData.tax,
            total: checkoutData.total,
            status: 'placed' // 'placed' | 'processing' | 'ready' | 'completed' | 'cancelled'
        };

        // Save order to history
        const existingHistoryRaw = localStorage.getItem('velvet_roast_orders');
        let ordersHistory = [];
        if (existingHistoryRaw) {
            try {
                ordersHistory = JSON.parse(existingHistoryRaw);
            } catch (e) {
                console.error("Error reading past history", e);
            }
        }
        ordersHistory.unshift(placedOrder);
        localStorage.setItem('velvet_roast_orders', JSON.stringify(ordersHistory));

        // Clean current cart states
        localStorage.removeItem('velvet_roast_cart');
        localStorage.removeItem('velvet_roast_checkout');

        // Redirect to confirmation page
        window.location.replace(`confirmation.html?id=${orderId}`);

    } catch (e) {
        showErrorAlert("Communication error with BrewOS network. Please try again.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    }
}

// Error alert controller
function showErrorAlert(msg) {
    const errorBox = document.getElementById('checkout-alert-error');
    const errorText = document.getElementById('checkout-alert-error-text');
    if (errorBox && errorText) {
        errorText.textContent = msg;
        errorBox.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
