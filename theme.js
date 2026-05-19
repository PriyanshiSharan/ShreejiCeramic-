/**
 * Global Theme System for Aquant Portal
 * Handles: Persistent Dark Mode, SVG Icon Swapping, and Initial State
 */

const MOON_SVG = `M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z`;
const SUN_SVG = `M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M3 12h2.25m.386-6.364l1.591 1.591M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z`;

function initTheme() {
    const savedTheme = localStorage.getItem('portal-theme') || 'light';
    const htmlElement = document.documentElement;
    
    // Apply saved theme
    if (savedTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
        updateAllIcons(SUN_SVG);
    } else {
        htmlElement.removeAttribute('data-theme');
        updateAllIcons(MOON_SVG);
    }

    // Use event delegation to handle clicks on any .theme-toggle (present or future)
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('.theme-toggle');
        if (!toggle) return;

        const isDark = htmlElement.hasAttribute('data-theme');
        
        if (isDark) {
            // Switch to LIGHT
            htmlElement.removeAttribute('data-theme');
            localStorage.setItem('portal-theme', 'light');
            updateAllIcons(MOON_SVG);
        } else {
            // Switch to DARK
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('portal-theme', 'dark');
            updateAllIcons(SUN_SVG);
        }
    });
}

function updateAllIcons(pathContent) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
        const path = toggle.querySelector('path');
        if (path) {
            path.setAttribute('d', pathContent);
        }
    });
}

function initSidebar() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentBrand = urlParams.get('brand') || 'aquant';
    
    // Update Header Brand Title
    const brandTitleEl = document.querySelector('.header-brand');
    if (brandTitleEl) {
        brandTitleEl.textContent = currentBrand.toUpperCase();
    }
    
    // Add brand class to body for CSS targeting
    document.body.classList.add(`brand-${currentBrand}`);
    
    // Update sidebar links to persist brand
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const text = link.textContent.trim();
        
        // Brand-specific link visibility
        if (currentBrand === 'kohler' && (text === 'Our Promise' || text === 'Care Instructions')) {
            link.style.display = 'none';
        }
        if (currentBrand === 'aquant' && (text === 'Cleaning Solutions' || text === 'About Us')) {
            link.style.display = 'none';
        }

        const url = new URL(link.href, window.location.origin);
        url.searchParams.set('brand', currentBrand);
        link.href = url.pathname + url.search;
    });

    // Handle sidebar logo click to go back to landing
    const logoLink = document.querySelector('.sidebar-header');
    if (logoLink) {
        logoLink.style.cursor = 'pointer';
        logoLink.onclick = () => window.location.href = 'index.html';
    }
}

// Single entry point
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
});
