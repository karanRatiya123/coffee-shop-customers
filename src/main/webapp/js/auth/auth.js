/* Auth Guard — protects customer-facing pages
 * - Redirects to index.html if no session exists
 * - Renders the user name + sign-out control in the page header
 *
 * Pages must include this script (and a header with a `.header-cta` slot).
 */
(function () {
    'use strict';

    const isInSubdir = window.location.pathname.includes('/pages/');
    const loginPage = isInSubdir ? '../auth/index.html' : 'pages/auth/index.html';
    
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        // Preserve intended destination with correct folder mapping so we can bounce back after login
        const pathSegments = window.location.pathname.split('/');
        const file = pathSegments.pop() || 'index.html';
        const folder = pathSegments.pop() || '';
        const returnTo = isInSubdir ? `../${folder}/${file}` : `../../${file}`;
        sessionStorage.setItem('returnTo', returnTo);
        window.location.replace(loginPage);
        return;
    }

    const userName = sessionStorage.getItem('userName') || 'Customer';
    const userEmail = sessionStorage.getItem('userEmail') || '';

    // --- Render user menu in place of the Sign-In link ---
    const ctaSlot = document.querySelector('.header-cta');
    if (ctaSlot) {
        const myOrdersLink = isInSubdir ? '../order/order.html' : 'pages/order/order.html';
        const browseMenuLink = isInSubdir ? '../../index.html#featured' : 'index.html#featured';
        ctaSlot.outerHTML = `
            <div class="user-menu" id="user-menu">
                <button type="button" class="user-menu-toggle" id="user-menu-toggle" aria-haspopup="menu" aria-expanded="false">
                    <span class="user-avatar" aria-hidden="true">${userName.charAt(0).toUpperCase()}</span>
                    <span class="user-menu-name">${userName}</span>
                    <svg class="user-menu-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="user-menu-dropdown" id="user-menu-dropdown" role="menu">
                    <div class="user-menu-header">
                        <span class="user-menu-label">Signed in as</span>
                        <span class="user-menu-email">${userEmail}</span>
                    </div>
                    <a href="${myOrdersLink}" class="user-menu-item" role="menuitem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
                        <span>My Orders</span>
                    </a>
                    <a href="${browseMenuLink}" class="user-menu-item" role="menuitem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/></svg>
                        <span>Browse Menu</span>
                    </a>
                    <button type="button" id="sign-out-btn" class="user-menu-item user-menu-signout" role="menuitem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        `;
    }

    // --- Dropdown toggle ---
    document.addEventListener('click', (e) => {
        const toggle = document.getElementById('user-menu-toggle');
        const dropdown = document.getElementById('user-menu-dropdown');
        if (!toggle || !dropdown) return;

        if (toggle.contains(e.target)) {
            const isOpen = dropdown.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
            return;
        }

        if (!dropdown.contains(e.target) && dropdown.classList.contains('open')) {
            dropdown.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    // --- Sign out ---
    document.addEventListener('click', (e) => {
        if (e.target.closest('#sign-out-btn')) {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userEmail');
            sessionStorage.removeItem('userName');
            window.location.replace(loginPage);
        }
    });

    // --- Close dropdown on Escape ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const dropdown = document.getElementById('user-menu-dropdown');
            const toggle = document.getElementById('user-menu-toggle');
            if (dropdown && dropdown.classList.contains('open')) {
                dropdown.classList.remove('open');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // --- Dynamically fix all flat HTML links to match nested pages structure ---
    const fixLinks = () => {
        const prefix = isInSubdir ? '../' : 'pages/';
        const homeHref = isInSubdir ? '../../index.html' : 'index.html';

        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('/') && !href.startsWith('..')) {
                const isFlatHtml = href.endsWith('.html') || href.includes('.html#') || href === 'index.html';
                if (isFlatHtml) {
                    const [page, hash] = href.split('#');
                    const hashPart = hash ? `#${hash}` : '';
                    
                    let newHref = '';
                    if (page === 'home.html' || page === 'index.html') {
                        newHref = homeHref + hashPart;
                    } else if (page === 'menu.html') {
                        newHref = `${prefix}menu/menu.html${hashPart}`;
                    } else if (page === 'order.html') {
                        newHref = `${prefix}order/order.html${hashPart}`;
                    } else if (page === 'checkout.html') {
                        newHref = `${prefix}order/checkout.html${hashPart}`;
                    } else if (page === 'confirmation.html') {
                        newHref = `${prefix}order/confirmation.html${hashPart}`;
                    } else if (page === 'about.html') {
                        newHref = `${prefix}company/about.html${hashPart}`;
                    } else if (page === 'contact.html') {
                        newHref = `${prefix}company/contact.html${hashPart}`;
                    } else if (page === 'feedback.html') {
                        newHref = `${prefix}customer/feedback.html${hashPart}`;
                    } else if (page === 'location.html') {
                        newHref = `${prefix}customer/location.html${hashPart}`;
                    }
                    
                    if (newHref) {
                        link.setAttribute('href', newHref);
                    }
                }
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixLinks);
    } else {
        fixLinks();
    }
})();
