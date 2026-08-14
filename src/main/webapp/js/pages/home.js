/* Home page interactions — The Velvet Roast
 * Prepared for Java Servlet Integration
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM cache ---
    const navToggle = document.getElementById('nav-toggle');
    const siteNav = document.getElementById('site-nav');
    const navLinks = document.querySelectorAll('.site-nav .nav-link');
    const siteHeader = document.querySelector('.site-header');
    const revealEls = document.querySelectorAll('.reveal-on-scroll');

    // --- Mobile nav toggle ---
    if (navToggle && siteNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = siteNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Close mobile nav after a link is tapped
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- Smooth scroll for in-page anchors (e.g. #location) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#' || targetId.length < 2) return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            const headerH = siteHeader ? siteHeader.offsetHeight : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // --- Reveal-on-scroll (IntersectionObserver) ---
    if ('IntersectionObserver' in window && revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => io.observe(el));
    } else {
        // Fallback: show everything immediately
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    // --- Dynamic Featured Products Loader ---
    loadFeaturedProducts();

    // --- Aroma bubble click effect (same effect as login page) ---
    document.addEventListener('click', (e) => {
        for (let i = 0; i < 2; i++) createAromaBubble(e.clientX, e.clientY);
    });

    const createAromaBubble = (x, y) => {
        const bubble = document.createElement('div');
        bubble.className = 'click-particle';
        document.body.appendChild(bubble);

        const size = Math.random() * 8 + 4; // 4px to 12px
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 15;

        bubble.style.left = `${x + offsetX}px`;
        bubble.style.top = `${y + offsetY}px`;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        const driftX = (Math.random() - 0.5) * 60;
        bubble.style.setProperty('--drift-x', `${driftX}px`);

        const duration = Math.random() * 0.4 + 0.6; // 0.6s to 1s
        bubble.style.animationDuration = `${duration}s`;

        setTimeout(() => bubble.remove(), duration * 1000);
    };
});

// Fetch featured products from MenuServlet
async function loadFeaturedProducts() {
    let featuredProducts = [];
    if (typeof ApiService !== 'undefined' && ApiService.loadProducts) {
        const allProducts = await ApiService.loadProducts('All', '');
        if (Array.isArray(allProducts) && allProducts.length > 0) {
            const filtered = allProducts.filter(p => p.isPopular || p.featured);
            featuredProducts = filtered.length > 0 ? filtered : allProducts.slice(0, 4);
        }
    }
    renderFeaturedProducts(featuredProducts);
}

// Render function accepting dynamic featured products data
function renderFeaturedProducts(featuredProducts = []) {
    const container = document.getElementById('featured-grid');
    const featuredSection = document.getElementById('featured');
    if (!container) return;

    container.innerHTML = '';

    if (!Array.isArray(featuredProducts) || featuredProducts.length === 0) {
        if (featuredSection) {
            featuredSection.style.display = 'none';
        }
        return;
    }

    if (featuredSection) {
        featuredSection.style.display = 'block';
    }

    featuredProducts.forEach(item => {
        const card = document.createElement('article');
        card.className = 'drink-card reveal-on-scroll is-visible';
        card.innerHTML = `
            <div class="drink-art">
                <img src="${item.image || ''}" alt="${item.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'">
            </div>
            <h3 class="drink-name">${item.name}</h3>
            <p class="drink-desc">${item.description || ''}</p>
            <span class="drink-price">₹${Number(item.price || 0).toFixed(2)}</span>
        `;
        container.appendChild(card);
    });
}
