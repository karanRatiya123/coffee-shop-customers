// --- Velvet Roast Checkout Page Logic (checkout.js) ---
// Prepared for Java Servlet + MySQL Backend Integration

let checkoutData = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load checkout state from sessionStorage
    const rawData = sessionStorage.getItem('velvet_roast_checkout');
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

    // 2. Pre-fill customer info if logged in
    prefillUserData();

    // 3. Render Order Summary Details
    renderCheckoutSummary();
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
    if (!checkoutData || !Array.isArray(checkoutData.cart)) return;

    const container = document.getElementById('checkout-items-list');
    if (container) {
        container.innerHTML = checkoutData.cart.map(item => `
            <div class="summary-item-line">
                <div class="summary-item-info">
                    <span class="summary-item-title">${item.quantity}x ${item.name}</span>
                    <div class="summary-item-options">${item.customizations?.optionsText || 'Standard'}</div>
                </div>
                <span class="summary-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }

    const subtotalEl = document.getElementById('checkout-subtotal');
    const discountEl = document.getElementById('checkout-discount');
    const discountRow = document.getElementById('checkout-discount-row');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');

    if (subtotalEl) subtotalEl.textContent = `₹${Number(checkoutData.subtotal || 0).toFixed(2)}`;
    if (taxEl) taxEl.textContent = `₹${Number(checkoutData.tax || 0).toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${Number(checkoutData.total || 0).toFixed(2)}`;

    if (checkoutData.discount > 0) {
        if (discountEl) discountEl.textContent = `-₹${Number(checkoutData.discount).toFixed(2)}`;
        if (discountRow) discountRow.classList.remove('hidden');
    } else {
        if (discountRow) discountRow.classList.add('hidden');
    }
}

// Validate input fields
function validateCheckoutForm() {
    let isValid = true;

    const errors = document.querySelectorAll('.error-message');
    errors.forEach(e => e.style.display = 'none');
    const wrappers = document.querySelectorAll('.input-wrapper');
    wrappers.forEach(w => w.classList.remove('invalid', 'valid'));

    const nameVal = document.getElementById('cust-name')?.value.trim();
    const nameWrapper = document.getElementById('cust-name-wrapper');
    const nameError = document.getElementById('cust-name-error');
    if (!nameVal) {
        if (nameWrapper) nameWrapper.classList.add('invalid');
        if (nameError) nameError.style.display = 'block';
        isValid = false;
    } else {
        if (nameWrapper) nameWrapper.classList.add('valid');
    }

    const phoneVal = document.getElementById('cust-phone')?.value.trim();
    const phoneWrapper = document.getElementById('cust-phone-wrapper');
    const phoneError = document.getElementById('cust-phone-error');
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
    if (!phoneVal || !phoneRegex.test(phoneVal)) {
        if (phoneWrapper) phoneWrapper.classList.add('invalid');
        if (phoneError) phoneError.style.display = 'block';
        isValid = false;
    } else {
        if (phoneWrapper) phoneWrapper.classList.add('valid');
    }

    return isValid;
}

// TODO: Submit order data to OrderServlet
async function submitCheckout(event) {
    event.preventDefault();

    if (!checkoutData) return;

    const isFormValid = validateCheckoutForm();
    if (!isFormValid) {
        showErrorAlert("Please resolve input errors before sending your request.");
        return;
    }

    const submitBtn = document.getElementById('place-order-btn');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `Sending Request to OrderServlet...`;
    }

    try {
        const customerName = document.getElementById('cust-name').value.trim();
        const customerPhone = document.getElementById('cust-phone').value.trim();
        const customerEmail = sessionStorage.getItem('userEmail') || '';

        const payload = {
            customer: { name: customerName, phone: customerPhone, email: customerEmail },
            cart: checkoutData.cart,
            subtotal: checkoutData.subtotal,
            discount: checkoutData.discount,
            tax: checkoutData.tax,
            total: checkoutData.total
        };

        // TODO: Submit order data to OrderServlet via ApiService
        let orderId = Date.now().toString(36);
        if (typeof ApiService !== 'undefined' && ApiService.submitOrder) {
            const response = await ApiService.submitOrder(payload);
            if (response && response.orderId) {
                orderId = response.orderId;
            }
        }

        sessionStorage.removeItem('velvet_roast_checkout');
        window.location.replace(`confirmation.html?id=${encodeURIComponent(orderId)}`);

    } catch (e) {
        showErrorAlert("Error submitting order request to OrderServlet.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    }
}

function showErrorAlert(msg) {
    const errorBox = document.getElementById('checkout-alert-error');
    const errorText = document.getElementById('checkout-alert-error-text');
    if (errorBox && errorText) {
        errorText.textContent = msg;
        errorBox.classList.remove('hidden');
    }
}
