/*
 * INTERKL GLOBAL GROUP - Auto-Scroll Premium Mode
 * Défilement automatique intelligent multi-pages
 * W2K-Digital 2025
 */

const W2KAutoScroll = (function () {
    'use strict';

    /* ===================================
       CONFIGURATION PAR DÉFAUT
       =================================== */
    const defaultConfig = {
        speed: 'slow',
        pauseDuration: 12,
        inactivityDelay: 45,
        showIndicator: true,
        initialDelay: 3,
        transitionDelay: 1
    };

    /* Vitesse de défilement en pixels par tick (16ms) */
    const speedMap = {
        slow: 0.8,
        medium: 1.5,
        fast: 2.5
    };

    /* Variables d'état */
    let config = {};
    let isScrolling = false;
    let isPaused = false;
    let scrollInterval = null;
    let inactivityTimer = null;
    let sectionPauseTimer = null;
    let indicator = null;
    let sections = [];
    let currentSectionIndex = 0;
    let isInSectionPause = false;
    let hasUserInteracted = false;
    let isTransitioning = false;

    /* ===================================
       INITIALISATION
       =================================== */
    function init(userConfig) {
        config = Object.assign({}, defaultConfig, userConfig || {});

        /* Détecter les sections de la page */
        detectSections();

        /* Créer l'indicateur visuel */
        if (config.showIndicator) {
            createIndicator();
        }

        /* Écouter les interactions utilisateur */
        bindUserEvents();

        /* Démarrer après le délai initial */
        setTimeout(function () {
            startAutoScroll();
        }, config.initialDelay * 1000);
    }

    /* ===================================
       DÉTECTION DES SECTIONS
       =================================== */
    function detectSections() {
        /* Sélectionner toutes les sections avec data-autoscroll ou les sections principales */
        var tagged = document.querySelectorAll('[data-autoscroll]');

        if (tagged.length > 0) {
            sections = Array.prototype.slice.call(tagged);
        } else {
            /* Fallback : détecter les sections principales automatiquement */
            var candidates = document.querySelectorAll('section, .hero, main > div, main');
            sections = Array.prototype.slice.call(candidates).filter(function (el) {
                return el.offsetHeight > 100;
            });
        }
    }

    /* ===================================
       INDICATEUR VISUEL
       =================================== */
    function createIndicator() {
        indicator = document.createElement('div');
        indicator.className = 'w2k-scroll-indicator';
        indicator.title = 'Auto-Scroll actif';
        indicator.setAttribute('aria-hidden', 'true');
        document.body.appendChild(indicator);

        /* Clic sur indicateur = basculer pause/reprendre */
        indicator.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isPaused) {
                resumeAutoScroll();
            } else {
                pauseAutoScroll();
            }
        });
    }

    function updateIndicator(state) {
        if (!indicator) return;

        indicator.classList.remove('active', 'paused', 'section-pause');

        if (state === 'scrolling') {
            indicator.classList.add('active');
            indicator.title = 'Auto-Scroll actif - Cliquez pour pauser';
        } else if (state === 'paused') {
            indicator.classList.add('paused');
            indicator.title = 'Auto-Scroll en pause - Cliquez pour reprendre';
        } else if (state === 'section-pause') {
            indicator.classList.add('active', 'section-pause');
            indicator.title = 'Pause section - Lecture du contenu';
        }
    }

    /* ===================================
       DÉFILEMENT AUTOMATIQUE
       =================================== */
    function startAutoScroll() {
        if (isScrolling) return;

        isScrolling = true;
        isPaused = false;
        updateIndicator('scrolling');

        var pixelsPerTick = speedMap[config.speed] || speedMap.slow;

        /* Ajuster la vitesse sur mobile (plus lent) */
        if (window.innerWidth < 769) {
            pixelsPerTick *= 0.7;
        }

        scrollInterval = setInterval(function () {
            if (isPaused || isInSectionPause || isTransitioning) return;

            var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            var maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            /* Vérifier si on a atteint le bas de la page */
            if (currentScroll >= maxScroll - 5) {
                clearInterval(scrollInterval);
                scrollInterval = null;
                isScrolling = false;
                navigateToNextPage();
                return;
            }

            /* Vérifier si on entre dans une nouvelle section */
            checkSectionTransition(currentScroll);

            /* Défiler */
            window.scrollBy(0, pixelsPerTick);
        }, 16);
    }

    function stopAutoScroll() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
        isScrolling = false;
        isInSectionPause = false;

        if (sectionPauseTimer) {
            clearTimeout(sectionPauseTimer);
            sectionPauseTimer = null;
        }
    }

    function pauseAutoScroll() {
        isPaused = true;
        hasUserInteracted = true;
        updateIndicator('paused');
        resetInactivityTimer();
    }

    function resumeAutoScroll() {
        isPaused = false;
        hasUserInteracted = false;
        updateIndicator('scrolling');

        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
        }

        /* Redémarrer si le scroll n'est plus actif */
        if (!isScrolling) {
            startAutoScroll();
        }
    }

    /* ===================================
       PAUSE INTELLIGENTE PAR SECTION
       =================================== */
    function checkSectionTransition(scrollPos) {
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var rect = section.getBoundingClientRect();
            var sectionTop = rect.top;

            /* Section entre dans la vue (haut de la section proche du haut de l'écran) */
            if (sectionTop > -10 && sectionTop < 50 && i !== currentSectionIndex) {
                currentSectionIndex = i;
                triggerSectionPause(section);
                break;
            }
        }
    }

    function triggerSectionPause(section) {
        isInSectionPause = true;
        updateIndicator('section-pause');

        /* Durée de pause configurable par section ou par défaut */
        var pauseTime = section.getAttribute('data-pause-duration');
        pauseTime = pauseTime ? parseInt(pauseTime, 10) : config.pauseDuration;

        sectionPauseTimer = setTimeout(function () {
            isInSectionPause = false;
            if (!isPaused) {
                updateIndicator('scrolling');
            }
        }, pauseTime * 1000);
    }

    /* ===================================
       NAVIGATION AUTOMATIQUE ENTRE PAGES
       =================================== */
    function navigateToNextPage() {
        var nextPage = document.body.getAttribute('data-next-page');

        if (!nextPage) return;

        isTransitioning = true;
        updateIndicator('section-pause');

        /* Transition smooth avant changement de page */
        var overlay = document.createElement('div');
        overlay.className = 'w2k-page-transition';
        document.body.appendChild(overlay);

        /* Forcer le reflow pour déclencher la transition */
        overlay.offsetHeight;
        overlay.classList.add('active');

        setTimeout(function () {
            window.location.href = nextPage;
        }, config.transitionDelay * 1000);
    }

    /* ===================================
       GESTION INTERACTIONS UTILISATEUR
       =================================== */
    function bindUserEvents() {
        var events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'touchmove', 'wheel'];

        events.forEach(function (eventType) {
            document.addEventListener(eventType, handleUserInteraction, { passive: true });
        });

        /* Scroll manuel (wheel) = pause immédiate */
        document.addEventListener('wheel', function () {
            if (isScrolling && !isPaused) {
                pauseAutoScroll();
            }
        }, { passive: true });
    }

    function handleUserInteraction() {
        if (!isScrolling && !isPaused) return;

        if (!isPaused && isScrolling) {
            pauseAutoScroll();
        } else if (isPaused) {
            /* Réinitialiser le timer d'inactivité à chaque interaction */
            resetInactivityTimer();
        }
    }

    function resetInactivityTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }

        inactivityTimer = setTimeout(function () {
            resumeAutoScroll();
        }, config.inactivityDelay * 1000);
    }

    /* ===================================
       API PUBLIQUE
       =================================== */
    return {
        init: init,
        pause: pauseAutoScroll,
        resume: resumeAutoScroll,
        stop: stopAutoScroll,
        isActive: function () { return isScrolling && !isPaused; }
    };

})();
