// --- Velvet Roast Order Confirmation Page Logic (confirmation.js) ---
// Prepared for Java Servlet + MySQL Backend Integration

let pollIntervalId = null;
let resolved = false;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        window.location.replace('../../index.html');
        return;
    }

    const orderIdEl = document.getElementById('conf-order-id');
    if (orderIdEl) orderIdEl.textContent = '#' + orderId;

    // TODO: Poll order status from OrderServlet
    pollForStatus(orderId);
    pollIntervalId = setInterval(() => pollForStatus(orderId), 3000);
});

// TODO: Poll order status from OrderServlet
async function pollForStatus(orderId) {
    if (resolved) return;

    let status = 'pending_request';
    if (typeof ApiService !== 'undefined' && ApiService.getOrderStatus) {
        const orderData = await ApiService.getOrderStatus(orderId);
        if (orderData && orderData.status) {
            status = orderData.status;
            if (orderData.total) {
                const totalEl = document.getElementById('conf-total');
                if (totalEl) totalEl.textContent = `₹${Number(orderData.total).toFixed(2)}`;
            }
        }
    }

    applyStatusToUI(status);

    if (status === 'accepted' || status === 'rejected' || status === 'ready' || status === 'completed') {
        resolved = true;
        if (pollIntervalId) clearInterval(pollIntervalId);
    }
}

function applyStatusToUI(status) {
    const progressFill = document.getElementById('timeline-progress');
    const statusLabel = document.getElementById('live-status-label');
    const stepPlaced = document.getElementById('step-placed');
    const stepBrewing = document.getElementById('step-brewing');
    const titleEl = document.getElementById('conf-title');
    const subtitleEl = document.querySelector('.conf-subtitle');
    const iconEl = document.getElementById('conf-status-icon');

    if (!progressFill || !statusLabel) return;

    if (status === 'pending_request') {
        progressFill.style.width = '25%';
        statusLabel.textContent = 'Awaiting Staff';
        statusLabel.style.color = 'var(--accent-gold)';
        if (stepPlaced) {
            stepPlaced.classList.add('active');
            stepPlaced.classList.remove('completed');
        }
        if (stepBrewing) {
            stepBrewing.classList.remove('active', 'completed');
        }
        if (titleEl) titleEl.textContent = 'Request Sent — Awaiting Confirmation';
        if (iconEl) iconEl.innerHTML = '<i class="fa-solid fa-hourglass-half"></i>';
        return;
    }

    if (status === 'rejected') {
        progressFill.style.width = '100%';
        progressFill.style.background = 'var(--error-color, #e25c5c)';
        statusLabel.textContent = 'Request Declined';
        statusLabel.style.color = 'var(--error-color, #e25c5c)';
        if (stepPlaced) stepPlaced.classList.add('completed');
        if (stepBrewing) stepBrewing.classList.add('active', 'completed');
        if (titleEl) titleEl.textContent = 'Request Declined';
        if (iconEl) iconEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
        return;
    }

    if (status === 'accepted' || status === 'ready' || status === 'completed') {
        progressFill.style.width = '100%';
        progressFill.style.background = 'var(--accent-gold)';
        statusLabel.textContent = 'Accepted!';
        statusLabel.style.color = 'var(--success-color, #63b97b)';
        if (stepPlaced) stepPlaced.classList.add('completed');
        if (stepBrewing) stepBrewing.classList.add('active', 'completed');
        if (titleEl) titleEl.textContent = 'Request Accepted!';
        if (iconEl) iconEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    }
}
