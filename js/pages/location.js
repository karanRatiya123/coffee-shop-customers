/* Location Page Interaction — The Velvet Roast
 * Manages simple page load animations, directions links, and integrations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on scroll (IntersectionObserver)
    const revealEls = document.querySelectorAll('.reveal-on-scroll');
    
    if ('IntersectionObserver' in window && revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });
        
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    // Dynamic greeting update if username is present
    const visitorGreeting = document.getElementById('visitor-greeting');
    if (visitorGreeting) {
        const userName = sessionStorage.getItem('userName') || '';
        if (userName) {
            visitorGreeting.textContent = `, ${userName}`;
        }
    }
});
