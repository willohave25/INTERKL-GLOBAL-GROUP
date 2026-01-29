/* 
 * INTERKL GLOBAL GROUP - JavaScript Principal
 * Fonctionnalités interactives du site
 * W2K-Digital 2025
 */

document.addEventListener('DOMContentLoaded', function() {
    
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDots = document.querySelectorAll('.hero-dot');
    const temoignageCards = document.querySelectorAll('.temoignage-card');
    const temoignageDots = document.querySelectorAll('.temoignage-dot');
    const temoignagePrev = document.querySelector('.temoignages-arrow.prev');
    const temoignageNext = document.querySelector('.temoignages-arrow.next');
    
    let heroCurrentSlide = 0;
    let temoignageCurrentSlide = 0;
    let heroAutoSlide;
    let temoignageAutoSlide;
    
    // Header scroll effect
    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    // Menu mobile hamburger
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        const dropdowns = navMenu.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.addEventListener('click', function(e) {
                    if (navMenu.classList.contains('active')) {
                        e.preventDefault();
                        dropdown.classList.toggle('open');
                    }
                });
            }
        });
        
        const navLinks = navMenu.querySelectorAll('.nav-link:not(.dropdown-toggle)');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Hero Slider (Auto 5 secondes)
    function showHeroSlide(index) {
        if (heroSlides.length === 0) return;
        if (index >= heroSlides.length) index = 0;
        if (index < 0) index = heroSlides.length - 1;
        heroCurrentSlide = index;
        heroSlides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) slide.classList.add('active');
        });
        heroDots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === index) dot.classList.add('active');
        });
    }
    
    function nextHeroSlide() {
        showHeroSlide(heroCurrentSlide + 1);
    }
    
    function startHeroAutoSlide() {
        heroAutoSlide = setInterval(nextHeroSlide, 5000);
    }
    
    function resetHeroAutoSlide() {
        clearInterval(heroAutoSlide);
        startHeroAutoSlide();
    }
    
    if (heroSlides.length > 0) {
        showHeroSlide(0);
        startHeroAutoSlide();
        heroDots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                showHeroSlide(index);
                resetHeroAutoSlide();
            });
        });
    }
    
    // Témoignages Slider (Auto 7 secondes)
    function showTemoignage(index) {
        if (temoignageCards.length === 0) return;
        if (index >= temoignageCards.length) index = 0;
        if (index < 0) index = temoignageCards.length - 1;
        temoignageCurrentSlide = index;
        temoignageCards.forEach((card, i) => {
            card.classList.remove('active');
            if (i === index) card.classList.add('active');
        });
        temoignageDots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === index) dot.classList.add('active');
        });
    }
    
    function nextTemoignage() {
        showTemoignage(temoignageCurrentSlide + 1);
    }
    
    function prevTemoignage() {
        showTemoignage(temoignageCurrentSlide - 1);
    }
    
    function startTemoignageAutoSlide() {
        temoignageAutoSlide = setInterval(nextTemoignage, 7000);
    }
    
    function resetTemoignageAutoSlide() {
        clearInterval(temoignageAutoSlide);
        startTemoignageAutoSlide();
    }
    
    if (temoignageCards.length > 0) {
        showTemoignage(0);
        startTemoignageAutoSlide();
        if (temoignagePrev) {
            temoignagePrev.addEventListener('click', function() {
                prevTemoignage();
                resetTemoignageAutoSlide();
            });
        }
        if (temoignageNext) {
            temoignageNext.addEventListener('click', function() {
                nextTemoignage();
                resetTemoignageAutoSlide();
            });
        }
        temoignageDots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                showTemoignage(index);
                resetTemoignageAutoSlide();
            });
        });
    }
    
    // Smooth scroll ancres
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = header ? header.offsetHeight : 70;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({top: targetPosition, behavior: 'smooth'});
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }
        });
    });
    
    // Formulaire validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nom = document.getElementById('nom');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            let isValid = true;
            
            if (nom && nom.value.trim().length < 2) {
                showFieldError(nom, 'Veuillez entrer votre nom complet');
                isValid = false;
            } else if (nom) clearFieldError(nom);
            
            if (email && !isValidEmail(email.value)) {
                showFieldError(email, 'Veuillez entrer une adresse email valide');
                isValid = false;
            } else if (email) clearFieldError(email);
            
            if (message && message.value.trim().length < 10) {
                showFieldError(message, 'Votre message doit contenir au moins 10 caractères');
                isValid = false;
            } else if (message) clearFieldError(message);
            
            if (isValid) {
                showFormSuccess();
                contactForm.reset();
            }
        });
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function showFieldError(field, message) {
        clearFieldError(field);
        field.style.borderColor = '#ef4444';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color:#ef4444;font-size:0.8125rem;margin-top:4px';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    
    function clearFieldError(field) {
        field.style.borderColor = '';
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();
    }
    
    function showFormSuccess() {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.style.cssText = 'background:#10b981;color:white;padding:16px;border-radius:8px;text-align:center;margin-bottom:16px';
        successDiv.innerHTML = '<strong>Message envoyé avec succès !</strong><br>Nous vous répondrons sous 24h.';
        const formTitle = contactForm.querySelector('.form-title');
        if (formTitle) formTitle.parentNode.insertBefore(successDiv, formTitle.nextSibling);
        else contactForm.prepend(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    }
    
    // Animation scroll
    const animatedElements = document.querySelectorAll('.service-card, .processus-card, .feature-item');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {threshold: 0.1, rootMargin: '0px 0px -50px 0px'});
        
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(el);
        });
    }
});
