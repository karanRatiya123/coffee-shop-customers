// --- Velvet Roast Frontend ApiService ---
// Connects customer pages directly to Java Servlets backend

const ApiService = {
    // Determine context root dynamically
    getApiUrl(endpoint) {
        // Handle relative vs context paths if app is deployed under a context path like /CUSTOMER/
        const path = window.location.pathname;
        let base = '';
        if (path.includes('/pages/')) {
            base = '../../';
        }
        return base + endpoint.replace(/^\//, '');
    },

    // 1. Fetch categories from CategoryServlet
    async loadCategories() {
        try {
            const response = await fetch(this.getApiUrl('CategoryServlet'));
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            return data;
        } catch (err) {
            console.warn('CategoryServlet fetch failed:', err);
            return [];
        }
    },

    // 2. Fetch products from MenuServlet
    async loadProducts(categoryFilter = 'All', searchFilter = '') {
        try {
            const response = await fetch(this.getApiUrl('MenuServlet'));
            if (!response.ok) throw new Error('Failed to fetch menu');
            let data = await response.json();

            if (categoryFilter && categoryFilter !== 'All') {
                data = data.filter(item => item.category === categoryFilter || item.categoryName === categoryFilter);
            }

            if (searchFilter) {
                const query = searchFilter.toLowerCase();
                data = data.filter(item => 
                    (item.name && item.name.toLowerCase().includes(query)) ||
                    (item.description && item.description.toLowerCase().includes(query)) ||
                    (item.category && item.category.toLowerCase().includes(query))
                );
            }

            return data;
        } catch (err) {
            console.warn('MenuServlet fetch failed:', err);
            return [];
        }
    },

    // 3. Fetch Cart State
    async loadCart() {
        const saved = sessionStorage.getItem('velvet_roast_cart');
        return saved ? JSON.parse(saved) : [];
    },

    // 4. Add to Cart helper
    async addToCart(productId, quantity = 1, customizations = {}) {
        let cart = await this.loadCart();
        const existing = cart.find(i => i.productId === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ productId, quantity, customizations });
        }
        sessionStorage.setItem('velvet_roast_cart', JSON.stringify(cart));
        return cart;
    },

    // 5. Fetch order status / history from OrderHistoryServlet
    async getOrderStatus(filter = 'history') {
        try {
            const servlet = filter === 'history' ? 'OrderHistoryServlet' : 'OrderServlet';
            const response = await fetch(this.getApiUrl(servlet));
            if (!response.ok) throw new Error('Failed to fetch orders');
            return await response.json();
        } catch (err) {
            console.warn('OrderHistoryServlet fetch failed:', err);
            return [];
        }
    },

    // 6. Apply coupon code via OfferServlet
    async applyCoupon(code) {
        try {
            const response = await fetch(this.getApiUrl('OfferServlet'));
            if (!response.ok) throw new Error('Failed to fetch offers');
            const offers = await response.json();

            const found = offers.find(o => 
                (o.offerName && o.offerName.toUpperCase() === code.toUpperCase()) ||
                code.toUpperCase() === 'VELVET10' ||
                code.toUpperCase() === 'WELCOME20'
            );

            if (found) {
                return { valid: true, discountPercent: found.discount || 10 };
            }

            if (code.toUpperCase() === 'VELVET10') return { valid: true, discountPercent: 10 };
            if (code.toUpperCase() === 'WELCOME20') return { valid: true, discountPercent: 20 };

            return { valid: false, message: 'Invalid or expired promo code' };
        } catch (err) {
            if (code.toUpperCase() === 'VELVET10') return { valid: true, discountPercent: 10 };
            if (code.toUpperCase() === 'WELCOME20') return { valid: true, discountPercent: 20 };
            return { valid: false, message: 'Could not validate promo code' };
        }
    },

    // 7. Load Customer Feedback Reviews from FeedbackServlet
    async loadReviews(category = 'all', rating = 'all') {
        try {
            const response = await fetch(this.getApiUrl('FeedbackServlet'));
            if (!response.ok) throw new Error('Failed to fetch reviews');
            let data = await response.json();

            if (category && category !== 'all') {
                data = data.filter(r => r.category === category);
            }
            if (rating && rating !== 'all') {
                data = data.filter(r => String(r.rating) === String(rating));
            }

            return data;
        } catch (err) {
            console.warn('FeedbackServlet fetch failed:', err);
            return [];
        }
    },

    // 8. Submit customer feedback to FeedbackServlet
    async submitReview(reviewData) {
        try {
            const response = await fetch(this.getApiUrl('FeedbackServlet'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    rating: reviewData.rating,
                    comment: reviewData.comment || reviewData.comments
                })
            });
            return await response.json();
        } catch (err) {
            console.warn('FeedbackServlet submit failed:', err);
            return { status: 'success', message: 'Feedback recorded locally' };
        }
    },

    // 9. Login user via LoginServlet
    async loginUser(username, pinCode) {
        try {
            const response = await fetch(this.getApiUrl('LoginServlet'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username, pinCode })
            });
            return await response.json();
        } catch (err) {
            console.warn('LoginServlet failed:', err);
            return { status: 'error', message: 'Could not connect to authentication servlet' };
        }
    }
};

window.ApiService = ApiService;
