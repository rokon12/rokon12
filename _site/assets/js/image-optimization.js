// Image optimization and lazy loading
document.addEventListener('DOMContentLoaded', function() {
    // Add lazy loading to all images
    const images = document.querySelectorAll('img');
    
    // Create Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Add loading class
                img.classList.add('loading');
                
                // If image has data-src, use it (for future optimization)
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                // Handle load and error events
                img.addEventListener('load', function() {
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                });
                
                img.addEventListener('error', function() {
                    img.classList.remove('loading');
                    img.classList.add('error');
                    // Set a fallback image
                    img.src = '/images/placeholder.svg';
                });
                
                // Stop observing this image
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01
    });
    
    // Observe all images
    images.forEach(img => {
        // Add loading="lazy" attribute for native lazy loading
        img.setAttribute('loading', 'lazy');
        
        // Add blur placeholder effect
        if (!img.classList.contains('no-blur')) {
            img.classList.add('blur-load');
        }
        
        imageObserver.observe(img);
    });
    
    // Progressive image loading (blur to clear)
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
    });
});

// Add responsive images with srcset
function optimizeImages() {
    const contentImages = document.querySelectorAll('.post-content img, .post-card img');
    
    contentImages.forEach(img => {
        const src = img.src || img.getAttribute('src');
        if (src && !img.srcset && !src.includes('placeholder')) {
            // Add sizes attribute for responsive images
            if (img.closest('.post-content')) {
                img.sizes = '(max-width: 768px) calc(100vw - 2rem), (max-width: 1200px) 768px, 800px';
            } else if (img.closest('.post-card')) {
                img.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
            }
            
            // Add decoding=async for better performance
            img.decoding = 'async';
            
            // Add importance hint for above-the-fold images
            if (img.getBoundingClientRect().top < window.innerHeight * 1.5) {
                img.fetchpriority = 'high';
            } else {
                img.fetchpriority = 'low';
            }
        }
    });
}

// Optimize image loading for featured images
function optimizeFeaturedImages() {
    const featuredImages = document.querySelectorAll('.post-card:nth-child(-n+3) img');
    featuredImages.forEach(img => {
        img.fetchpriority = 'high';
        img.decoding = 'async';
    });
}

// Call optimization on load
window.addEventListener('load', () => {
    optimizeImages();
    optimizeFeaturedImages();
});