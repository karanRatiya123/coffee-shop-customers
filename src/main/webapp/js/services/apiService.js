/**
 * Frontend Service Layer — Coffee Shop Management System
 * Integrated with existing Java Servlets (MenuServlet, CategoryServlet, OfferServlet, OrderServlet, FeedbackServlet)
 */
const ApiService = {
  // Base Servlet endpoint path resolver
  getServletUrl(servletName) {
    const isInSubdir = window.location.pathname.includes('/pages/');
    if (isInSubdir) {
      const parts = window.location.pathname.split('/pages/')[1].split('/');
      const depth = parts.length;
      let prefix = '';
      for (let i = 0; i < depth; i++) {
        prefix += '../';
      }
      return prefix + servletName;
    }
    return servletName;
  },

  // Resilient fetch wrapper testing candidate Tomcat 8080 URLs across context names
  async executeFetch(servletName, options = {}) {
    const relativeUrl = this.getServletUrl(servletName);
    
    const candidateUrls = [
      `/Test/${servletName}`,
      `../Test/${servletName}`,
      `/POS_Employyes/${servletName}`,
      `../POS_Employyes/${servletName}`,
      `/POS_Employyes_Backup/${servletName}`,
      `../POS_Employyes_Backup/${servletName}`,
      `http://localhost:8080/Test/${servletName}`,
      `http://localhost:8080/POS_Employyes/${servletName}`,
      `http://localhost:8080/POS_Employyes_Backup/${servletName}`,
      `http://localhost:8080/${servletName}`,
      relativeUrl
    ];

    const uniqueUrls = [...new Set(candidateUrls)];
    let lastError = null;

    for (const requestUrl of uniqueUrls) {
      console.log(`[ApiService] Trying Request URL: ${requestUrl}`);
      try {
        const response = await fetch(requestUrl, options);
        console.log(`[ApiService] HTTP Status: ${response.status} for ${requestUrl}`);
        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          const errorText = await response.text().catch(() => 'Unable to read error body');
          console.log(`[ApiService] Response failed for ${requestUrl} (Status ${response.status}):`, errorText);
        }
      } catch (error) {
        console.log(`[ApiService] Fetch Error for ${requestUrl}:`, error.message);
        lastError = error;
      }
    }

    throw lastError || new Error(`Unable to connect to ${servletName} on Tomcat 8080.`);
  },

  // Load products from MenuServlet
  async loadProducts(category = 'All', search = '') {
    try {
      let servletName = 'MenuServlet';
      const queryParams = new URLSearchParams();
      if (category && category !== 'All') queryParams.append('category', category);
      if (search) queryParams.append('search', search);

      const queryString = queryParams.toString();
      if (queryString) servletName += '?' + queryString;

      const rawItems = await this.executeFetch(servletName, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!Array.isArray(rawItems)) return [];

      // Normalize backend Menu model fields to frontend structure
      return rawItems.map(item => ({
        id: item.menuId || item.id,
        menuId: item.menuId || item.id,
        name: item.itemName || item.name || '',
        itemName: item.itemName || item.name || '',
        description: item.description || '',
        price: Number(item.price || 0),
        availability: item.availability || 'Available',
        stock: (item.availability === 'Available' || !item.availability) ? 99 : 0,
        image: item.image || '',
        categoryId: item.categoryId || 0,
        category: item.category || 'Coffee'
      }));
    } catch (error) {
      console.log('[ApiService] Error loading products from MenuServlet:', error);
      return [];
    }
  },

  // Load categories from CategoryServlet
  async loadCategories() {
    try {
      const rawCategories = await this.executeFetch('CategoryServlet', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!Array.isArray(rawCategories)) return [];

      return rawCategories.map(cat => ({
        id: cat.categoryId,
        categoryId: cat.categoryId,
        name: cat.categoryName || cat.name || '',
        categoryName: cat.categoryName || cat.name || '',
        description: cat.description || ''
      }));
    } catch (error) {
      console.log('[ApiService] Error loading categories from CategoryServlet:', error);
      return [];
    }
  },

  // Load active offers from OfferServlet
  async loadOffers() {
    try {
      const rawOffers = await this.executeFetch('OfferServlet', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!Array.isArray(rawOffers)) return [];

      return rawOffers.map(o => ({
        id: o.offerId,
        offerId: o.offerId,
        offerName: o.offerName || o.name || '',
        discountPercent: Number(o.discount || 0),
        discount: Number(o.discount || 0),
        status: o.status || 'Active'
      }));
    } catch (error) {
      console.log('[ApiService] Error loading offers from OfferServlet:', error);
      return [];
    }
  },

  // Validate coupon code against OfferServlet
  async applyCoupon(code) {
    try {
      const offers = await this.loadOffers();
      const codeUpper = String(code || '').trim().toUpperCase();
      const matchingOffer = offers.find(o => 
        String(o.offerName || '').trim().toUpperCase() === codeUpper && 
        String(o.status || '').toLowerCase() === 'active'
      );

      if (matchingOffer) {
        return {
          valid: true,
          code: matchingOffer.offerName,
          discountPercent: matchingOffer.discountPercent || matchingOffer.discount || 10,
          message: `Coupon ${matchingOffer.offerName} applied!`
        };
      }

      return { valid: false, message: 'Invalid or inactive coupon code.' };
    } catch (error) {
      console.log('[ApiService] OfferServlet coupon validation failed:', error);
      return { valid: false, message: 'Coupon validation failed.' };
    }
  },

  // Load customer feedback/reviews from FeedbackServlet
  async loadReviews(category = 'all', rating = 'all') {
    try {
      const rawFeedback = await this.executeFetch('FeedbackServlet', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!Array.isArray(rawFeedback)) return [];

      let reviews = rawFeedback.map(f => {
        let commentsText = f.comments || '';
        let extractedCategory = 'General';
        let extractedName = 'Guest Customer';

        // Parse comments if encoded like "[Category] From: Name - Comment text"
        const categoryMatch = commentsText.match(/^\[(.*?)\]/);
        if (categoryMatch) {
          extractedCategory = categoryMatch[1];
          commentsText = commentsText.replace(/^\[.*?\]\s*/, '');
        }

        const nameMatch = commentsText.match(/^From:\s*(.*?)\s*-\s*/);
        if (nameMatch) {
          extractedName = nameMatch[1];
          commentsText = commentsText.replace(/^From:\s*.*?\s*-\s*/, '');
        }

        return {
          id: f.feedbackId,
          feedbackId: f.feedbackId,
          rating: Number(f.rating || 5),
          comment: commentsText,
          comments: commentsText,
          name: extractedName,
          category: extractedCategory,
          date: f.feedbackDate || '',
          feedbackDate: f.feedbackDate || ''
        };
      });

      // Filter locally by category/rating if requested
      if (category && category !== 'all') {
        reviews = reviews.filter(r => r.category.toLowerCase() === category.toLowerCase());
      }
      if (rating && rating !== 'all') {
        reviews = reviews.filter(r => Math.round(r.rating) === Number(rating));
      }

      return reviews;
    } catch (error) {
      console.log('[ApiService] Error loading reviews from FeedbackServlet:', error);
      return [];
    }
  },

  // Submit new review to FeedbackServlet
  async submitReview(reviewData) {
    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append('rating', reviewData.rating || 5);
      bodyParams.append('comment', reviewData.comment || reviewData.comments || '');
      bodyParams.append('name', reviewData.name || 'Guest Customer');
      bodyParams.append('category', reviewData.category || 'General');

      const response = await this.executeFetch('FeedbackServlet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json'
        },
        body: bodyParams.toString()
      });

      return response;
    } catch (error) {
      console.log('[ApiService] Error submitting feedback to FeedbackServlet:', error);
      return { success: false, message: 'Failed to submit feedback.' };
    }
  },

  // Transient cart loader (cart state)
  async loadCart() {
    return [];
  },

  // Add to cart helper
  async addToCart(productId, quantity = 1, customizations = {}) {
    return { success: true };
  },

  // Submit order to OrderServlet
  async submitOrder(orderData) {
    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append('status', 'Pending');
      bodyParams.append('subtotal', orderData.subtotal || 0);
      bodyParams.append('discount', orderData.discount || 0);
      bodyParams.append('totalAmount', orderData.total || orderData.totalAmount || 0);

      const response = await this.executeFetch('OrderServlet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json'
        },
        body: bodyParams.toString()
      });

      return response;
    } catch (error) {
      console.log('[ApiService] Error submitting order to OrderServlet:', error);
      return { success: false, message: 'Order submission failed.' };
    }
  },

  // Fetch order status / order history from OrderServlet
  async getOrderStatus(orderId) {
    try {
      const rawOrders = await this.executeFetch('OrderServlet', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!Array.isArray(rawOrders)) return [];

      return rawOrders.map(o => ({
        id: o.orderId,
        orderId: o.orderId,
        customerId: o.customerId,
        employeeId: o.employeeId,
        date: o.orderDate,
        orderDate: o.orderDate,
        status: o.status || 'Pending',
        subtotal: Number(o.subtotal || 0),
        discount: Number(o.discount || 0),
        total: Number(o.totalAmount || 0),
        totalAmount: Number(o.totalAmount || 0)
      }));
    } catch (error) {
      console.log('[ApiService] Error fetching orders from OrderServlet:', error);
      return [];
    }
  }
};
