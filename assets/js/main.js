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
        // Don't auto-initialize selectors here - let the page script handle it

        // Don't auto-load content - only load when explicitly requested
        console.log('CVWebsite initialized');
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
        const baseUrl = document.querySelector('meta[name="base-url"]')?.content || '';

        // Check for various main page patterns with and without baseurl
        const mainPagePatterns = [
            '/',
            '/index.html',
            baseUrl + '/',
            baseUrl + '/index.html',
            baseUrl + '/en/',
            baseUrl + '/de/',
            baseUrl + '/fr/'
        ];

        // Also check for language-specific paths
        const isLangPath = path.match(/^\/(en|de|fr)\/?$/) || path.match(/^\/cv\/(en|de|fr)\/?$/);

        console.log('isMainPage check:', {
            currentPath: path,
            baseUrl: baseUrl,
            patterns: mainPagePatterns,
            isMatch: mainPagePatterns.includes(path) || isLangPath,
            isLangPath: !!isLangPath
        });

        return mainPagePatterns.includes(path) || !!isLangPath;
    }

    async loadContentData(language) {
        const cacheKey = `content-${language}`;

        if (this.contentCache[cacheKey]) {
            console.log(`Using cached data for ${language}`);
            return this.contentCache[cacheKey];
        }

        try {
            console.log(`Loading content data for ${language}...`);

            // First try: Use embedded YAML data
            if (window.siteData && window.siteData[language]) {
                console.log(`Using embedded data for ${language}`);
                const data = window.siteData[language];
                this.contentCache[cacheKey] = data;
                return data;
            }

            console.log(`No embedded data for ${language}, trying JSON fallback...`);

            // Fallback: Try to fetch JSON files (for development/testing)
            const baseUrl = document.querySelector('meta[name="base-url"]')?.content || '';
            const response = await fetch(`${baseUrl}/assets/data/${language}.json`);
            if (response.ok) {
                console.log(`Loaded ${language} data from JSON file`);
                const data = await response.json();
                this.contentCache[cacheKey] = data;
                return data;
            }

            // Second fallback: Try English if current language fails
            if (language !== 'en') {
                console.warn(`Language ${language} not available, falling back to English`);
                return this.loadContentData('en');
            }

            throw new Error(`No data available for language: ${language}. Embedded: ${!!window.siteData}, Languages: ${window.siteData ? Object.keys(window.siteData) : 'none'}`);
        } catch (error) {
            console.error(`Error loading content for ${language}:`, error);
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

            // Render all sections
            renderHeroSection(data);
            renderCareerCarousel(data);
            renderAcademicCarousel(data);
            renderTimeline(data);
            renderSkills(data);
            renderFooter(data);
            updateNavigationText(data.navigation);

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

// Render Functions for Main Page
function renderHeroSection(data) {
    // Render slogan
    const sloganHtml = `
        <h1 class="slogan-latin">${data.slogan.latin}</h1>
        <p class="slogan-translation">${data.slogan.translation}</p>
    `;
    document.getElementById('slogan').innerHTML = sloganHtml;

    // Render intro
    const introText = data.intro.text.replace(/\n/g, '<br>');
    document.getElementById('intro').innerHTML = `<p class="intro-text">${introText}</p>`;
}

function renderCareerCarousel(data) {
    document.getElementById('careerCarouselTitle').textContent = data.sections.career_carousel;

    const baseUrl = document.querySelector('meta[name="base-url"]')?.content || '';
    const carouselHtml = data.career_positions.map(position => `
        <div class="carousel-item" onclick="window.location.href='${baseUrl}/career/${position.id}/'">
            <div class="carousel-card">
                <div class="card-logo">
                    <img src="${baseUrl}${position.logo}" alt="${position.company} logo" onerror="this.style.display='none'">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${position.position}</h3>
                    <h4 class="card-company">${position.company}</h4>
                    <p class="card-duration">${position.duration}</p>
                </div>
                ${position.current ? '<div class="current-badge">Current</div>' : ''}
            </div>
        </div>
    `).join('');

    document.getElementById('careerCarousel').innerHTML = carouselHtml;

    // Initialize carousel functionality
    if (window.carouselManager) {
        window.carouselManager.initializeCarousel('careerCarousel');
    }
}

function renderAcademicCarousel(data) {
    document.getElementById('academicCarouselTitle').textContent = data.sections.academic_carousel;

    const baseUrl = document.querySelector('meta[name="base-url"]')?.content || '';
    const carouselHtml = data.academic_achievements.map(achievement => `
        <div class="carousel-item" onclick="window.location.href='${baseUrl}/education/${achievement.id}/'">
            <div class="carousel-card">
                <div class="card-logo">
                    <img src="${baseUrl}${achievement.logo}" alt="${achievement.institution} logo" onerror="this.style.display='none'">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${achievement.degree_type}</h3>
                    <h4 class="card-institution">${achievement.institution}</h4>
                    <p class="card-duration">${achievement.duration}</p>
                    ${achievement.grade ? `<p class="card-grade">${achievement.grade}</p>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('academicCarousel').innerHTML = carouselHtml;

    // Initialize carousel functionality
    if (window.carouselManager) {
        window.carouselManager.initializeCarousel('academicCarousel');
    }
}

function renderTimeline(data) {
    document.getElementById('timelineTitle').textContent = data.sections.career_timeline;

    // Sort positions by start date (most recent first)
    const sortedPositions = [...data.career_positions].sort((a, b) => {
        return new Date(b.start_date || '1900-01-01') - new Date(a.start_date || '1900-01-01');
    });

    const baseUrl = document.querySelector('meta[name="base-url"]')?.content || '';
    const timelineHtml = sortedPositions.map((position, index) => `
        <div class="timeline-item ${index % 2 === 0 ? 'timeline-left' : 'timeline-right'}">
            <div class="timeline-content">
                <div class="timeline-date">${position.duration}</div>
                <h3 class="timeline-position">${position.position}</h3>
                <h4 class="timeline-company">${position.company}</h4>
                <p class="timeline-summary">${position.summary}</p>
                <a href="${baseUrl}/career/${position.id}/" class="timeline-link">Read More →</a>
            </div>
            <div class="timeline-marker">
                ${position.current ? '<div class="current-indicator"></div>' : ''}
            </div>
        </div>
    `).join('');

    document.getElementById('timeline').innerHTML = timelineHtml;
}

function renderSkills(data) {
    document.getElementById('skillsTitle').textContent = data.sections.skills_section;
    document.getElementById('managementSkillsTitle').textContent = data.sections.management_skills;
    document.getElementById('itSkillsTitle').textContent = data.sections.it_skills;
    document.getElementById('languageSkillsTitle').textContent = data.sections.language_skills;

    // Render management skills
    const managementHtml = data.skills.management.map(skill => `
        <div class="skill-item">
            <div class="skill-header">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-level">${skill.level}/10</span>
            </div>
            <div class="skill-bar">
                <div class="skill-progress" style="width: ${skill.level * 10}%"></div>
            </div>
        </div>
    `).join('');
    document.getElementById('managementSkillsGrid').innerHTML = managementHtml;

    // Render IT skills
    const itHtml = data.skills.it.map(skill => `
        <div class="skill-item">
            <div class="skill-header">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-level">${skill.level}/10</span>
            </div>
            <div class="skill-bar">
                <div class="skill-progress" style="width: ${skill.level * 10}%"></div>
            </div>
        </div>
    `).join('');
    document.getElementById('itSkillsGrid').innerHTML = itHtml;

    // Render language skills
    const languageHtml = data.skills.languages.map(skill => `
        <div class="skill-item">
            <div class="skill-header">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-level">${skill.level}/10</span>
            </div>
            <div class="skill-bar">
                <div class="skill-progress" style="width: ${skill.level * 10}%"></div>
            </div>
            ${skill.note ? `<div class="skill-note">${skill.note}</div>` : ''}
        </div>
    `).join('');
    document.getElementById('languageSkillsGrid').innerHTML = languageHtml;
}

function renderFooter(data) {
    const footerHtml = `
        <div class="contact-info">
            <a href="mailto:${data.contact.email}" class="contact-link">
                <span class="contact-icon">✉</span>
                ${data.contact.email}
            </a>
            <a href="${data.contact.linkedin}" target="_blank" rel="noopener" class="contact-link">
                <span class="contact-icon">in</span>
                LinkedIn
            </a>
        </div>
    `;
    document.getElementById('footerContact').innerHTML = footerHtml;
}

function updateNavigationText(navigation) {
    const navLinks = document.querySelectorAll('[data-nav]');
    navLinks.forEach(link => {
        const navKey = link.getAttribute('data-nav');
        if (navigation[navKey]) {
            link.textContent = navigation[navKey];
        }
    });
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
        // Initialize both main carousels
        this.initializeCarousel('careerCarousel');
        this.initializeCarousel('academicCarousel');
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
        // Preload JSON files for faster language switching
        const languages = ['en', 'de', 'fr'];
        const currentLang = window.cvWebsite?.getCurrentLanguage() || 'en';
        const baseUrl = document.querySelector('meta[name="base-url"]')?.content || '';

        languages.forEach(lang => {
            if (lang !== currentLang) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = `${baseUrl}/assets/data/${lang}.json`;
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

// Initialize everything when DOM is ready - but don't auto-load content
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main website functionality (but don't auto-load content)
    window.cvWebsite = new CVWebsite();

    // Initialize carousel manager
    window.carouselManager = new CarouselManager();

    // Initialize accessibility features
    window.accessibilityManager = new AccessibilityManager();

    // Initialize performance optimizations
    window.performanceManager = new PerformanceManager();

    console.log('CV Website initialized (static mode)');
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