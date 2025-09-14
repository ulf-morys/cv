// Main JavaScript for CV Website
// Handles dynamic content loading, language switching, and interactive features

class CVWebsite {
    constructor() {
        this.currentLanguage = this.getDefaultLanguage();
        this.contentCache = {};
        this.isLoading = false;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.initializeLanguageSelector();
        this.initializeNavigation();

        // Load content if on main page
        if (this.isMainPage()) {
            await this.loadAndRenderContent();
        }
    }

    setupEventListeners() {
        // Language selector
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang-btn')) {
                this.switchLanguage(e.target.dataset.lang);
            }
        });

        // Navigation toggle for mobile
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');

        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Close mobile nav on link click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-links a')) {
                const navLinks = document.getElementById('navLinks');
                if (navLinks) {
                    navLinks.classList.remove('active');
                }
            }
        });
    }

    initializeLanguageSelector() {
        const languageSelector = document.getElementById('languageSelector');
        if (languageSelector) {
            const buttons = languageSelector.querySelectorAll('.lang-btn');
            buttons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
            });
        }
    }

    initializeNavigation() {
        // Update active nav item based on scroll position
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

        if (sections.length > 0 && navLinks.length > 0) {
            window.addEventListener('scroll', () => {
                const current = this.getCurrentSection(sections);
                this.updateActiveNavLink(navLinks, current);
            });
        }
    }

    getCurrentSection(sections) {
        const scrollY = window.pageYOffset;
        const navHeight = 80; // Height of fixed nav

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const sectionTop = section.offsetTop - navHeight - 50;

            if (scrollY >= sectionTop) {
                return section.id;
            }
        }

        return sections[0]?.id || '';
    }

    updateActiveNavLink(navLinks, currentSection) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === `#${currentSection}`;
            link.classList.toggle('active', isActive);
        });
    }

    getDefaultLanguage() {
        // Check URL path first
        const path = window.location.pathname;
        const pathLang = path.split('/')[1];
        if (['en', 'de', 'fr'].includes(pathLang)) {
            return pathLang;
        }

        // Check stored preference
        const stored = localStorage.getItem('cv-language');
        if (stored && ['en', 'de', 'fr'].includes(stored)) {
            return stored;
        }

        // Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (['en', 'de', 'fr'].includes(browserLang)) {
            return browserLang;
        }

        return 'en'; // Default fallback
    }

    async switchLanguage(newLang) {
        if (newLang === this.currentLanguage || this.isLoading) {
            return;
        }

        this.currentLanguage = newLang;
        localStorage.setItem('cv-language', newLang);

        // Update language selector
        this.updateLanguageSelector(newLang);

        // Update page language attribute
        document.documentElement.lang = newLang;

        // Reload content if on main page
        if (this.isMainPage()) {
            await this.loadAndRenderContent();
        } else {
            // For detail pages, reload the page with new language
            this.reloadDetailPage(newLang);
        }
    }

    updateLanguageSelector(activeLang) {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === activeLang);
        });
    }

    reloadDetailPage(newLang) {
        // For detail pages, we need to reload content
        const currentPath = window.location.pathname;

        if (currentPath.includes('/career/')) {
            const positionId = currentPath.split('/').filter(Boolean).pop();
            if (window.loadCareerDetail) {
                window.loadCareerDetail(positionId);
            }
        } else if (currentPath.includes('/education/')) {
            const achievementId = currentPath.split('/').filter(Boolean).pop();
            if (window.loadEducationDetail) {
                window.loadEducationDetail(achievementId);
            }
        }
    }

    isMainPage() {
        const path = window.location.pathname;
        return path === '/' || path === '/index.html' || path.match(/^\/(en|de|fr)\/?$/);
    }

    async loadContentData(language) {
        const cacheKey = `content-${language}`;

        if (this.contentCache[cacheKey]) {
            return this.contentCache[cacheKey];
        }

        try {
            const response = await fetch(`/_data/${language}/content.yml`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const yamlText = await response.text();
            const data = jsyaml.load(yamlText);

            this.contentCache[cacheKey] = data;
            return data;
        } catch (error) {
            console.error(`Error loading content for ${language}:`, error);

            // Fallback to English if current language fails
            if (language !== 'en') {
                return this.loadContentData('en');
            }

            throw error;
        }
    }

    async loadAndRenderContent() {
        if (this.isLoading) return;

        try {
            this.showLoading();
            this.isLoading = true;

            const data = await this.loadContentData(this.currentLanguage);

            // Update page title and meta description
            this.updatePageMeta(data);

            // Render all sections if functions exist
            if (typeof renderHeroSection === 'function') renderHeroSection(data);
            if (typeof renderCareerCarousel === 'function') renderCareerCarousel(data);
            if (typeof renderAcademicCarousel === 'function') renderAcademicCarousel(data);
            if (typeof renderTimeline === 'function') renderTimeline(data);
            if (typeof renderSkills === 'function') renderSkills(data);
            if (typeof renderFooter === 'function') renderFooter(data);
            if (typeof updateNavigationText === 'function') updateNavigationText(data.navigation);

            this.hideLoading();
        } catch (error) {
            console.error('Error loading and rendering content:', error);
            this.showError('Failed to load page content. Please try refreshing the page.');
            this.hideLoading();
        } finally {
            this.isLoading = false;
        }
    }

    updatePageMeta(data) {
        if (data.slogan) {
            document.title = `${data.slogan.latin} - ${data.slogan.translation}`;
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && data.intro) {
            const description = data.intro.text.replace(/[•\n]/g, ' ').trim().substring(0, 160);
            metaDesc.setAttribute('content', description);
        }
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.add('visible');
        }
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.remove('visible');
        }
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: #dc3545;
                color: white;
                padding: 1rem 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                max-width: 90%;
                text-align: center;
            `;
            document.body.appendChild(errorDiv);
        }

        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
    }

    // Utility method to get current language (used by detail pages)
    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Carousel functionality
class CarouselManager {
    constructor() {
        this.carousels = new Map();
        this.init();
    }

    init() {
        // Initialize carousels when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupCarousels();
        });
    }

    setupCarousels() {
        const carouselElements = document.querySelectorAll('.carousel');
        carouselElements.forEach((carousel, index) => {
            const id = carousel.id || `carousel-${index}`;
            this.initializeCarousel(id);
        });
    }

    initializeCarousel(carouselId) {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;

        const type = carouselId.replace('Carousel', '');
        const prevBtn = document.getElementById(`${type}Prev`);
        const nextBtn = document.getElementById(`${type}Next`);

        if (!prevBtn || !nextBtn) return;

        const carouselData = {
            element: carousel,
            prevBtn,
            nextBtn,
            currentIndex: 0,
            itemsPerView: this.getItemsPerView()
        };

        this.carousels.set(carouselId, carouselData);

        // Event listeners
        prevBtn.addEventListener('click', () => this.movePrev(carouselId));
        nextBtn.addEventListener('click', () => this.moveNext(carouselId));

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize(carouselId));

        this.updateCarousel(carouselId);
    }

    getItemsPerView() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    movePrev(carouselId) {
        const data = this.carousels.get(carouselId);
        if (!data) return;

        if (data.currentIndex > 0) {
            data.currentIndex--;
            this.updateCarousel(carouselId);
        }
    }

    moveNext(carouselId) {
        const data = this.carousels.get(carouselId);
        if (!data) return;

        const items = data.element.querySelectorAll('.carousel-item');
        const maxIndex = Math.max(0, items.length - data.itemsPerView);

        if (data.currentIndex < maxIndex) {
            data.currentIndex++;
            this.updateCarousel(carouselId);
        }
    }

    updateCarousel(carouselId) {
        const data = this.carousels.get(carouselId);
        if (!data) return;

        const translateX = -(data.currentIndex * (100 / data.itemsPerView));
        data.element.style.transform = `translateX(${translateX}%)`;

        // Update button states
        const items = data.element.querySelectorAll('.carousel-item');
        const maxIndex = Math.max(0, items.length - data.itemsPerView);

        data.prevBtn.disabled = data.currentIndex <= 0;
        data.nextBtn.disabled = data.currentIndex >= maxIndex;
    }

    handleResize(carouselId) {
        const data = this.carousels.get(carouselId);
        if (!data) return;

        const newItemsPerView = this.getItemsPerView();
        if (newItemsPerView !== data.itemsPerView) {
            data.itemsPerView = newItemsPerView;
            data.currentIndex = 0; // Reset to first item
            this.updateCarousel(carouselId);
        }
    }
}

// Accessibility Manager
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAriaLabels();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Handle carousel navigation with arrow keys
            if (e.target.classList.contains('carousel-btn')) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.target.click();
                }
            }

            // Handle language selector with arrow keys
            if (e.target.classList.contains('lang-btn')) {
                this.handleLanguageSelectorKeys(e);
            }
        });
    }

    handleLanguageSelectorKeys(e) {
        const buttons = Array.from(document.querySelectorAll('.lang-btn'));
        const currentIndex = buttons.indexOf(e.target);

        let nextIndex;
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
                break;
            default:
                return;
        }

        e.preventDefault();
        buttons[nextIndex].focus();
    }

    setupFocusManagement() {
        // Skip to content link (if needed)
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary);
            color: var(--text-light);
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
        `;

        // Show on focus
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    setupAriaLabels() {
        // Add ARIA labels to interactive elements
        const carouselBtns = document.querySelectorAll('.carousel-btn');
        carouselBtns.forEach(btn => {
            if (btn.classList.contains('carousel-prev')) {
                btn.setAttribute('aria-label', 'Previous item');
            } else if (btn.classList.contains('carousel-next')) {
                btn.setAttribute('aria-label', 'Next item');
            }
        });

        // Add role to carousel
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(carousel => {
            carousel.setAttribute('role', 'region');
            carousel.setAttribute('aria-label', 'Content carousel');
        });
    }
}

// Performance Manager
class PerformanceManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.preloadCriticalResources();
    }

    setupLazyLoading() {
        // Use Intersection Observer for lazy loading images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupImageOptimization() {
        // Handle image loading errors gracefully
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                e.target.style.display = 'none';
            }
        }, true);
    }

    preloadCriticalResources() {
        // Preload YAML files for faster language switching
        const languages = ['en', 'de', 'fr'];
        const currentLang = window.cvWebsite?.getCurrentLanguage() || 'en';

        languages.forEach(lang => {
            if (lang !== currentLang) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = `/_data/${lang}/content.yml`;
                document.head.appendChild(link);
            }
        });
    }
}

// Global functions for detail pages
window.getCurrentLanguage = function() {
    return window.cvWebsite?.getCurrentLanguage() || 'en';
};

window.loadContentData = function(language) {
    return window.cvWebsite?.loadContentData(language);
};

window.showError = function(message) {
    window.cvWebsite?.showError(message);
};

window.showLoading = function() {
    window.cvWebsite?.showLoading();
};

window.hideLoading = function() {
    window.cvWebsite?.hideLoading();
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main website functionality
    window.cvWebsite = new CVWebsite();

    // Initialize carousel manager
    window.carouselManager = new CarouselManager();

    // Initialize accessibility features
    window.accessibilityManager = new AccessibilityManager();

    // Initialize performance optimizations
    window.performanceManager = new PerformanceManager();

    console.log('CV Website initialized successfully');
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause any animations or timers when page is not visible
        console.log('Page hidden - pausing non-essential operations');
    } else {
        // Resume operations when page becomes visible
        console.log('Page visible - resuming operations');
    }
});

// Handle online/offline status
window.addEventListener('online', function() {
    console.log('Connection restored');
});

window.addEventListener('offline', function() {
    console.log('Connection lost');
    if (window.cvWebsite) {
        window.cvWebsite.showError('Connection lost. Some features may not work properly.');
    }
});