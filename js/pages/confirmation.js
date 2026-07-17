// --- Velvet Roast Order Confirmation Page Logic (confirmation.js) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get Order ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        window.location.replace('home.html');
        return;
    }

    // 2. Fetch Order from local storage history
    const storedOrders = localStorage.getItem('velvet_roast_orders');
    let orders = [];
    if (storedOrders) {
        try {
            orders = JSON.parse(storedOrders);
        } catch (e) {
            console.error("Error reading orders database", e);
        }
    }

    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) {
        // Fallback: show placeholder or go home
        console.warn("Placed order details not found in history.");
        document.getElementById('conf-order-id').textContent = '#' + orderId;
        return;
    }

    // 3. Populate basic details in UI
    document.getElementById('conf-order-id').textContent = '#' + currentOrder.id;
    document.getElementById('conf-pickup-time').textContent = currentOrder.pickupTime;
    document.getElementById('conf-payment-method').textContent = currentOrder.paymentMethod;
    document.getElementById('conf-total').textContent = `₹${currentOrder.total.toFixed(2)}`;

    // 4. Initialize and simulate live status tracking updates
    simulateLiveTracking(orderId);
});

function simulateLiveTracking(orderId) {
    const progressFill = document.getElementById('timeline-progress');
    const statusLabel = document.getElementById('live-status-label');
    
    const stepPlaced = document.getElementById('step-placed');
    const stepBrewing = document.getElementById('step-brewing');
    const stepReady = document.getElementById('step-ready');

    // Stage 1: Placed (already active/completed by default)
    // We update the state transition timers
    
    // Stage 2: Brewing after 6 seconds
    setTimeout(() => {
        // UI updates
        if (progressFill) progressFill.style.width = '50%';
        if (statusLabel) statusLabel.textContent = 'Brewing In Progress';
        
        if (stepPlaced) {
            stepPlaced.classList.add('completed');
            stepPlaced.classList.remove('active');
        }
        if (stepBrewing) {
            stepBrewing.classList.add('active');
        }

        // Save progress update to database
        updateOrderStatusInStorage(orderId, 'processing');
    }, 6000);

    // Stage 3: Ready for collection after 15 seconds
    setTimeout(() => {
        // UI updates
        if (progressFill) progressFill.style.width = '100%';
        if (statusLabel) {
            statusLabel.textContent = 'Ready for Pickup!';
            statusLabel.style.color = 'var(--success-color)';
        }
        
        if (stepBrewing) {
            stepBrewing.classList.add('completed');
            stepBrewing.classList.remove('active');
        }
        if (stepReady) {
            stepReady.classList.add('completed');
            stepReady.classList.add('active');
        }

        // Dynamic Header Title update
        const headerTitle = document.querySelector('.conf-title');
        if (headerTitle) headerTitle.textContent = 'Order Ready!';

        // Save progress update to database
        updateOrderStatusInStorage(orderId, 'ready');
    }, 15000);
}

// Helper to persist updated order statuses to order history database
function updateOrderStatusInStorage(orderId, newStatus) {
    const stored = localStorage.getItem('velvet_roast_orders');
    if (!stored) return;
    
    try {
        let orders = JSON.parse(stored);
        const orderIdx = orders.findIndex(o => o.id === orderId);
        if (orderIdx !== -1) {
            orders[orderIdx].status = newStatus;
            localStorage.setItem('velvet_roast_orders', JSON.stringify(orders));
        }
    } catch (e) {
        console.error("Error updating status in history", e);
    }
}
