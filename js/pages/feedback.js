/* Feedback Page Interaction — The Velvet Roast
 * Manages ratings, chips selection, form validation, custom modal success,
 * dynamic local reviews persistence, statistics calculation, and filter tabs.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let selectedRating = 0;
    let selectedCategory = 'Food & Drinks'; // default
    const maxChars = 500;

    // --- Default Mock Reviews ---
    const DEFAULT_REVIEWS = [
        {
            id: 101,
            name: "Sarah Jenkins",
            rating: 5,
            category: "Ambiance",
            comment: "Absolutely love the warm lighting and the soft jazz playing in the background. The Velvet Signature Latte was divine — the oat milk was steamed to perfection! The perfect spot to read or write.",
            date: "Jul 15, 2026",
            avatarInitials: "SJ"
        },
        {
            id: 102,
            name: "David Chen",
            rating: 4,
            category: "Food & Drinks",
            comment: "The Slow-Start Cold Brew is rich, low-acid, and incredibly smooth. Paired it with their warm almond croissant. Service was friendly, though there was a small queue. Will definitely return!",
            date: "Jul 14, 2026",
            avatarInitials: "DC"
        },
        {
            id: 103,
            name: "Jessica Taylor",
            rating: 5,
            category: "Service",
            comment: "Exceptional service! The barista was incredibly welcoming and recommended the Midnight Mocha with a pinch of sea salt when I asked for a recommendation. It was absolutely delicious. Fast service!",
            date: "Jul 13, 2026",
            avatarInitials: "JT"
        },
        {
            id: 104,
            name: "Marcus Brodie",
            rating: 4,
            category: "Cleanliness",
            comment: "Extremely tidy coffee shop. I watched the staff wipe down tables and chairs immediately after customers left. It's rare to see this level of detail. Highly recommend for remote workers.",
            date: "Jul 11, 2026",
            avatarInitials: "MB"
        }
    ];

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
            ratingText.textContent = RATING_DESCRIPTIONS[value];
        });

        btn.addEventListener('mouseleave', () => {
            highlightStars(selectedRating);
            ratingText.textContent = RATING_DESCRIPTIONS[selectedRating];
        });

        btn.addEventListener('click', () => {
            selectedRating = value;
            highlightStars(selectedRating);
            ratingText.textContent = RATING_DESCRIPTIONS[selectedRating];
            ratingText.style.color = 'var(--accent-gold)';
        });
    });

    function highlightStars(count) {
        starBtns.forEach(btn => {
            const val = parseInt(btn.getAttribute('data-value'), 10);
            if (val <= count) {
                btn.classList.add('hovered');
                if (selectedRating >= val) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            } else {
                btn.classList.remove('hovered');
                btn.classList.remove('selected');
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
            
            // Subtle indicator change when getting close to limit
            if (length >= maxChars - 30) {
                charCounter.style.color = 'var(--error-color)';
            } else {
                charCounter.style.color = 'var(--text-muted)';
            }
        });
    }

    // --- Get Review List from Local Storage ---
    function getReviews() {
        const stored = localStorage.getItem('velvet_roast_reviews');
        if (!stored) {
            localStorage.setItem('velvet_roast_reviews', JSON.stringify(DEFAULT_REVIEWS));
            return DEFAULT_REVIEWS;
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Error parsing stored reviews", e);
            return DEFAULT_REVIEWS;
        }
    }

    // --- Save Review List to Local Storage ---
    function saveReview(review) {
        const reviews = getReviews();
        reviews.unshift(review);
        localStorage.setItem('velvet_roast_reviews', JSON.stringify(reviews));
        return reviews;
    }

    // --- Helper to extract initials ---
    function getInitials(name) {
        if (!name) return "?";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // --- Calculate & Animate Statistics ---
    function updateStats(reviews) {
        if (!reviews.length) {
            avgRatingBig.textContent = "0.0";
            avgStarsContainer.innerHTML = "";
            totalRatingsLabel.textContent = "No reviews yet";
            Object.keys(barFills).forEach(k => {
                barFills[k].style.width = "0%";
                barPctLabels[k].textContent = "0%";
            });
            return;
        }

        const totalReviews = reviews.length;
        const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = totalRatingSum / totalReviews;
        
        // Round to 1 decimal place
        avgRatingBig.textContent = avg.toFixed(1);

        // Render average stars
        let starsHtml = "";
        const roundedAvg = Math.round(avg);
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedAvg) {
                starsHtml += `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style="width: 14px; height: 14px;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
            } else {
                starsHtml += `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px; height: 14px; color: var(--text-muted)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
            }
        }
        avgStarsContainer.innerHTML = starsHtml;

        // Render total reviews label
        totalRatingsLabel.textContent = `Based on ${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}`;

        // Star distribution counts
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const intRating = Math.round(r.rating);
            if (distribution[intRating] !== undefined) {
                distribution[intRating]++;
            }
        });

        // Set bar widths & percentage text
        Object.keys(barFills).forEach(ratingKey => {
            const count = distribution[ratingKey];
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            // Trigger animation in next frame
            requestAnimationFrame(() => {
                barFills[ratingKey].style.width = `${pct}%`;
            });
            barPctLabels[ratingKey].textContent = `${Math.round(pct)}%`;
        });
    }

    // --- Render Reviews Feed ---
    function renderReviews() {
        const reviews = getReviews();
        
        // Retrieve current filter selections
        const categoryVal = filterCategory.value;
        const ratingVal = filterRating.value;

        // Apply filters
        const filteredReviews = reviews.filter(r => {
            const matchesCategory = (categoryVal === 'all' || r.category.toLowerCase() === categoryVal.toLowerCase());
            
            let matchesRating = true;
            if (ratingVal === '5') {
                matchesRating = (r.rating === 5);
            } else if (ratingVal === '4') {
                matchesRating = (r.rating === 4);
            } else if (ratingVal === '3-below') {
                matchesRating = (r.rating <= 3);
            }
            
            return matchesCategory && matchesRating;
        });

        // Clean reviews container
        reviewsListContainer.innerHTML = '';

        if (!filteredReviews.length) {
            reviewsListContainer.innerHTML = `
                <div class="empty-reviews-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        <path d="M8 10h.01"/>
                        <path d="M12 10h.01"/>
                        <path d="M16 10h.01"/>
                    </svg>
                    <span>No reviews found matching these filters.</span>
                </div>
            `;
            return;
        }

        filteredReviews.forEach(r => {
            // Render star HTML
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= r.rating) {
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
                        <div class="reviewer-avatar">${r.avatarInitials || 'C'}</div>
                        <div class="reviewer-details">
                            <span class="reviewer-name">${r.name}</span>
                            <span class="review-date">${r.date}</span>
                        </div>
                    </div>
                    <div class="review-rating-stars">${starsHtml}</div>
                </div>
                <p class="review-body">${escapeHTML(r.comment)}</p>
                <div class="review-card-meta">
                    <span class="review-tag">${r.category}</span>
                </div>
            `;
            reviewsListContainer.appendChild(card);
        });
    }

    // HTML escape utility
    function escapeHTML(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- Form Submit ---
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate Rating
            if (selectedRating === 0) {
                showErrorNotification("Please select a star rating.");
                return;
            }

            // Validate Comment
            const commentVal = textarea.value.trim();
            if (!commentVal) {
                showErrorNotification("Please write a short comment about your experience.");
                return;
            }

            // Author details
            const isAnonymous = anonymousCheckbox && anonymousCheckbox.checked;
            const authorName = isAnonymous ? 'Anonymous' : (sessionStorage.getItem('userName') || 'Guest Customer');
            const initials = isAnonymous ? 'A' : getInitials(authorName);

            // Construct new review
            const dateStr = new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            const newReview = {
                id: Date.now(),
                name: authorName,
                rating: selectedRating,
                category: selectedCategory,
                comment: commentVal,
                date: dateStr,
                avatarInitials: initials
            };

            // Save & update
            const updatedReviews = saveReview(newReview);
            updateStats(updatedReviews);
            renderReviews();

            // Reset form inputs
            feedbackForm.reset();
            selectedRating = 0;
            highlightStars(0);
            ratingText.textContent = RATING_DESCRIPTIONS[0];
            ratingText.style.color = 'var(--text-secondary)';
            if (charCounter) charCounter.textContent = `0 / ${maxChars}`;
            
            // Set default active category
            categoryChips.forEach(c => {
                c.classList.remove('selected');
                if (c.getAttribute('data-category') === 'Food & Drinks') {
                    c.classList.add('selected');
                    selectedCategory = 'Food & Drinks';
                }
            });

            // Open Success Modal Overlay
            if (successModalOverlay) {
                successModalOverlay.classList.add('open');
            }
        });
    }

    // --- Error Toast helper ---
    function showErrorNotification(message) {
        // Create dynamic notification toast
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
        toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        toast.style.border = '1px solid rgba(255,255,255,0.1)';
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        });

        // Remove after 3.5 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3500);
    }

    // --- Modal Closing ---
    if (closeSuccessBtn && successModalOverlay) {
        closeSuccessBtn.addEventListener('click', () => {
            successModalOverlay.classList.remove('open');
        });

        // Close on backdrop click
        successModalOverlay.addEventListener('click', (e) => {
            if (e.target === successModalOverlay) {
                successModalOverlay.classList.remove('open');
            }
        });
    }

    // --- Attach Filters Listeners ---
    if (filterCategory) filterCategory.addEventListener('change', renderReviews);
    if (filterRating) filterRating.addEventListener('change', renderReviews);

    // --- Initial Executions ---
    const allReviews = getReviews();
    updateStats(allReviews);
    renderReviews();
});
