// Site-wide JavaScript — consolidated from inline scripts in default.html
(function() {
  'use strict';

  // Fade-in animations on scroll
  function initScrollAnimations() {
    var observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right, .stagger-animation').forEach(function(el) {
      observer.observe(el);
    });

    document.querySelectorAll('.post-card').forEach(function(card, index) {
      card.classList.add('fade-in-up');
      card.style.transitionDelay = (index * 0.1) + 's';
    });
  }

  // Mobile menu toggle
  function initMobileMenu() {
    var mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    var siteNav = document.querySelector('.site-nav');

    if (!mobileMenuToggle || !siteNav) return;

    mobileMenuToggle.addEventListener('click', function() {
      var isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      siteNav.classList.toggle('is-active');
      document.body.classList.toggle('menu-open');
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.site-header') && siteNav.classList.contains('is-active')) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-active');
        document.body.classList.remove('menu-open');
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && siteNav.classList.contains('is-active')) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-active');
        document.body.classList.remove('menu-open');
        mobileMenuToggle.focus();
      }
    });
  }

  // Theme persistence
  function initTheme() {
    var savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // Global search shortcut (/ to focus, Esc to clear)
  function initSearchShortcut() {
    document.addEventListener('keydown', function(e) {
      var searchInput = document.querySelector('.quick-search-input') ||
                        document.querySelector('#search-input');
      if (!searchInput) return;

      if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
        document.body.classList.add('search-focused');
      }

      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.blur();
        searchInput.value = '';
        document.body.classList.remove('search-focused');
      }
    });
  }

  // Back to top button
  function initBackToTop() {
    var button = document.getElementById('back-to-top');
    if (!button) return;

    var isScrolling = false;
    window.addEventListener('scroll', function() {
      if (!isScrolling) {
        window.requestAnimationFrame(function() {
          button.classList.toggle('visible', window.scrollY > 300);
          isScrolling = false;
        });
        isScrolling = true;
      }
    });

    button.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    button.classList.toggle('visible', window.scrollY > 300);
  }

  // Reading progress bar (post pages only)
  function initReadingProgress() {
    var progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;

    document.addEventListener('scroll', function() {
      var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressBar.style.width = ((winScroll / height) * 100) + '%';
    });
  }

  // Heading anchor links (post pages only)
  function initHeadingAnchors() {
    var content = document.querySelector('.post-content');
    if (!content) return;

    content.querySelectorAll('h2, h3, h4').forEach(function(heading) {
      if (!heading.id) return;

      var anchor = document.createElement('a');
      anchor.href = '#' + heading.id;
      anchor.className = 'heading-anchor';
      anchor.setAttribute('aria-label', 'Link to this section');
      heading.appendChild(anchor);
    });
  }

  function initExternalPostLinks() {
    var content = document.querySelector('.post-content');
    if (!content) return;

    content.querySelectorAll('a[href]').forEach(function(link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) {
        return;
      }

      try {
        var url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      } catch (error) {
        // Ignore malformed URLs in content.
      }
    });
  }

  // Lazy loading fallback
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
        if (img.dataset.src) img.src = img.dataset.src;
      });
    } else {
      var script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
      document.body.appendChild(script);
    }
  }

  // Initialize everything
  initTheme();
  initLazyLoading();

  document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initMobileMenu();
    initSearchShortcut();
    initBackToTop();
    initReadingProgress();
    initHeadingAnchors();
    initExternalPostLinks();
  });
})();
