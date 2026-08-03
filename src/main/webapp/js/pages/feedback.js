/* Feedback Page Interaction — The Velvet Roast
 * Prepared for Java Servlet + MySQL Backend Integration
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- State Variables ---
    let selectedRating = 0;
    let selectedCategory = 'Food & Drinks';
    const maxChars = 500;
    let currentReviews = [];

    // --- DOM Cache ---
    const starBtns = document.querySelectorAll('.star-btn');
    const ratingText = document.getElementById('rating-text');
    const categoryChips = document.querySelectorAll('.category-chip');
    const textarea = document.getElementById('feedback-comment');
    const charCounter = document.getElementById('char-counter');
    const feedbackForm = document.getElementById('feedback-form');
    const anonymousCheckbox = document.getElementById('anonymous-post');
    const reviewsListContainer = document.getElementById('reviews-list');
    
    // Filters
    const filterCategory = document.getElementById('filter-category');
    const filterRating = document.getElementById('filter-rating');

    // Stats Elements
    const avgRatingBig = document.getElementById('avg-rating-big');
    const avgStarsContainer = document.getElementById('avg-stars');
    const totalRatingsLabel = document.getElementById('total-ratings-label');
    const barFills = {
        5: document.getElementById('bar-fill-5'),
        4: document.getElementById('bar-fill-4'),
        3: document.getElementById('bar-fill-3'),
        2: document.getElementById('bar-fill-2'),
        1: document.getElementById('bar-fill-1'),
    };
    const barPctLabels = {
        5: document.getElementById('bar-pct-5'),
        4: document.getElementById('bar-pct-4'),
        3: document.getElementById('bar-pct-3'),
        2: document.getElementById('bar-pct-2'),
        1: document.getElementById('bar-pct-1'),
    };

    // Modal
    const successModalOverlay = document.getElementById('success-modal-overlay');
    const closeSuccessBtn = document.getElementById('close-success-btn');

    // Greeting slot
    const customerGreeting = document.getElementById('customer-greeting');
    const currentUserName = sessionStorage.getItem('userName') || 'friend';
    if (customerGreeting) {
        customerGreeting.textContent = currentUserName;
    }

    // --- Rating Star Descriptions ---
    const RATING_DESCRIPTIONS = {
        0: 'Select your star rating',
        1: '1/5 — Disappointed. We will do better.',
        2: '2/5 — Average. Let us know how we can improve.',
        3: '3/5 — Good. We hope to make it excellent next time.',
        4: '4/5 — Very Good! Glad you enjoyed your experience.',
        5: '5/5 — Outstanding! We are thrilled to hear this.'
    };

    // --- Star Interactivity ---
    starBtns.forEach(btn => {
        const value = parseInt(btn.getAttribute('data-value'), 10);

        btn.addEventListener('mouseenter', () => {
            highlightStars(value);
            if (ratingText) ratingText.textContent = RATING_DESCRIPTIONS[value];
        });

        btn.addEventListener('mouseleave', () => {
            highlightStars(selectedRating);
            if (ratingText) ratingText.textContent = RATING_DESCRIPTIONS[selectedRating];
        });

        btn.addEventListener('click', () => {
            selectedRating = value;
            highlightStars(selectedRating);
            if (ratingText) {
                ratingText.textContent = RATING_DESCRIPTIONS[selectedRating];
                ratingText.style.color = 'var(--accent-gold)';
            }
        });
    });

    function highlightStars(count) {
        starBtns.forEach(btn => {
            const val = parseInt(btn.getAttribute('data-value'), 10);
            if (val <= count) {
                btn.classList.add('hovered');
                if (selectedRating >= val) btn.classList.add('selected');
                else btn.classList.remove('selected');
            } else {
                btn.classList.remove('hovered', 'selected');
            }
        });
    }

    // --- Category Chip Interactivity ---
    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            selectedCategory = chip.getAttribute('data-category');
        });
    });

    // --- Character Counter ---
    if (textarea && charCounter) {
        textarea.addEventListener('input', () => {
            let length = textarea.value.length;
            if (length > maxChars) {
                textarea.value = textarea.value.substring(0, maxChars);
                length = maxChars;
            }
            charCounter.textContent = `${length} / ${maxChars}`;
            charCounter.style.color = length >= maxChars - 30 ? 'var(--error-color)' : 'var(--text-muted)';
        });
    }

    // TODO: Fetch reviews from ReviewServlet
    async function loadReviews() {
        const categoryVal = filterCategory ? filterCategory.value : 'all';
        const ratingVal = filterRating ? filterRating.value : 'all';

        if (typeof ApiService !== 'undefined' && ApiService.loadReviews) {
            currentReviews = await ApiService.loadReviews(categoryVal, ratingVal);
        } else {
            currentReviews = [];
        }

        updateStats(currentReviews);
        renderReviews(currentReviews);
    }

    // --- Helper to extract initials ---
    function getInitials(name) {
        if (!name) return "?";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // --- Calculate & Animate Statistics (accepts dynamic reviews data) ---
    function updateStats(reviewsList = []) {
        const reviews = Array.isArray(reviewsList) ? reviewsList : [];

        if (!reviews.length) {
            if (avgRatingBig) avgRatingBig.textContent = "0.0";
            if (avgStarsContainer) avgStarsContainer.innerHTML = "";
            if (totalRatingsLabel) totalRatingsLabel.textContent = "No reviews yet";
            Object.keys(barFills).forEach(k => {
                if (barFills[k]) barFills[k].style.width = "0%";
                if (barPctLabels[k]) barPctLabels[k].textContent = "0%";
            });
            return;
        }

        const totalReviews = reviews.length;
        const totalRatingSum = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
        const avg = totalRatingSum / totalReviews;
        
        if (avgRatingBig) avgRatingBig.textContent = avg.toFixed(1);

        let starsHtml = "";
        const roundedAvg = Math.round(avg);
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedAvg) {
                starsHtml += `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style="width: 14px; height: 14px;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
            } else {
                starsHtml += `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px; height: 14px; color: var(--text-muted)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
            }
        }
        if (avgStarsContainer) avgStarsContainer.innerHTML = starsHtml;
        if (totalRatingsLabel) totalRatingsLabel.textContent = `Based on ${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}`;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const intRating = Math.round(Number(r.rating || 0));
            if (distribution[intRating] !== undefined) distribution[intRating]++;
        });

        Object.keys(barFills).forEach(ratingKey => {
            const count = distribution[ratingKey];
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            if (barFills[ratingKey]) {
                requestAnimationFrame(() => {
                    barFills[ratingKey].style.width = `${pct}%`;
                });
            }
            if (barPctLabels[ratingKey]) barPctLabels[ratingKey].textContent = `${Math.round(pct)}%`;
        });
    }

    // --- Render Reviews Feed (accepts dynamic reviews data) ---
    function renderReviews(reviewsList = []) {
        if (!reviewsListContainer) return;
        const reviews = Array.isArray(reviewsList) ? reviewsList : [];

        reviewsListContainer.innerHTML = '';

        if (!reviews.length) {
            reviewsListContainer.innerHTML = `
                <div class="empty-reviews-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>No reviews available at the moment.</span>
                </div>
            `;
            return;
        }

        reviews.forEach(r => {
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Number(r.rating || 0)) {
                    starsHtml += `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style="width: 13px; height: 13px;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
                } else {
                    starsHtml += `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="width: 13px; height: 13px; color: var(--text-muted)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
                }
            }

            const card = document.createElement('article');
            card.className = 'review-card';
            card.innerHTML = `
                <div class="review-card-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${r.avatarInitials || getInitials(r.name) || 'C'}</div>
                        <div class="reviewer-details">
                            <span class="reviewer-name">${r.name || 'Guest'}</span>
                            <span class="review-date">${r.date || ''}</span>
                        </div>
                    </div>
                    <div class="review-rating-stars">${starsHtml}</div>
                </div>
                <p class="review-body">${escapeHTML(r.comment || '')}</p>
                <div class="review-card-meta">
                    <span class="review-tag">${r.category || 'General'}</span>
                </div>
            `;
            reviewsListContainer.appendChild(card);
        });
    }

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // TODO: Submit feedback to ReviewServlet
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (selectedRating === 0) {
                showErrorNotification("Please select a star rating.");
                return;
            }

            const commentVal = textarea ? textarea.value.trim() : '';
            if (!commentVal) {
                showErrorNotification("Please write a short comment about your experience.");
                return;
            }

            const isAnonymous = anonymousCheckbox && anonymousCheckbox.checked;
            const authorName = isAnonymous ? 'Anonymous' : (sessionStorage.getItem('userName') || 'Guest Customer');

            const newReview = {
                name: authorName,
                rating: selectedRating,
                category: selectedCategory,
                comment: commentVal
            };

            // TODO: Submit feedback to ReviewServlet via ApiService
            if (typeof ApiService !== 'undefined' && ApiService.submitReview) {
                await ApiService.submitReview(newReview);
            }

            feedbackForm.reset();
            selectedRating = 0;
            highlightStars(0);
            if (ratingText) {
                ratingText.textContent = RATING_DESCRIPTIONS[0];
                ratingText.style.color = 'var(--text-secondary)';
            }
            if (charCounter) charCounter.textContent = `0 / ${maxChars}`;

            await loadReviews();

            if (successModalOverlay) {
                successModalOverlay.classList.add('open');
            }
        });
    }

    function showErrorNotification(message) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '2rem';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        toast.style.background = 'rgba(226, 111, 111, 0.95)';
        toast.style.backdropFilter = 'blur(10px)';
        toast.style.color = '#fff';
        toast.style.padding = '0.9rem 1.8rem';
        toast.style.borderRadius = '10px';
        toast.style.zIndex = '9999';
        toast.style.fontSize = '0.9rem';
        toast.style.fontWeight = '600';
        toast.textContent = message;

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        });
        setTimeout(() => toast.remove(), 3500);
    }

    if (closeSuccessBtn && successModalOverlay) {
        closeSuccessBtn.addEventListener('click', () => {
            successModalOverlay.classList.remove('open');
        });
    }

    if (filterCategory) filterCategory.addEventListener('change', loadReviews);
    if (filterRating) filterRating.addEventListener('change', loadReviews);

    // Initial Execution
    await loadReviews();
});
