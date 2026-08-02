(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner(0);
    
    var introScreen = document.getElementById('intro-video-screen');
    var introVideo = document.getElementById('introVideo');
    var playPauseBtn = introScreen ? introScreen.querySelector('.intro-playpause-btn') : null;
    var unmuteBtn = introScreen ? introScreen.querySelector('.intro-unmute-btn') : null;
    var closeBtn = introScreen ? introScreen.querySelector('.intro-close-btn') : null;
    var skipBtn = introScreen ? introScreen.querySelector('.intro-skip-btn') : null;
    var tapPlayBtn = introScreen ? introScreen.querySelector('.intro-play-btn') : null;
    var lastFocusedElement = null;

    function isTouchDevice() {
        return ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
    }

    function getConnectionInfo() {
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!connection) return { saveData: false, effectiveType: '' };
        return {
            saveData: connection.saveData || false,
            effectiveType: connection.effectiveType || ''
        };
    }

    function showIntroScreen() {
        if (!introScreen) return;
        introScreen.classList.add('is-visible');
        introScreen.setAttribute('aria-hidden', 'false');
        document.body.classList.add('intro-open');
    }

    function hideIntroScreen() {
        if (!introScreen) return;
        introScreen.classList.add('intro-fade-out');
        introScreen.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('intro-open');
        if (introVideo) {
            introVideo.pause();
            introVideo.currentTime = 0;
        }
        setTimeout(function () {
            if (introScreen) {
                introScreen.style.display = 'none';
            }
        }, 600);
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    function updatePlayPauseButton() {
        if (!playPauseBtn || !introVideo) return;
        playPauseBtn.textContent = introVideo.paused ? 'Play' : 'Pause';
    }

    function startVideoAutoplay() {
        if (!introVideo) return;
        introVideo.muted = true;
        introVideo.loop = false;
        introVideo.autoplay = true;
        introVideo.play().then(function () {
            updatePlayPauseButton();
        }).catch(function () {
            if (introScreen) {
                introScreen.classList.add('tap-to-play');
            }
        });
    }

    function initializeIntroVideo() {
        if (!introScreen || !introVideo) return;
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var connectionInfo = getConnectionInfo();
        var slowConnection = connectionInfo.saveData || /2g|slow-2g|slow/.test(connectionInfo.effectiveType);
        var mobileSlowPath = isTouchDevice() && slowConnection;
        var useTapToPlay = prefersReducedMotion || mobileSlowPath;

        showIntroScreen();
        lastFocusedElement = document.activeElement;

        if (useTapToPlay) {
            introScreen.classList.add('tap-to-play');
            if (introVideo) {
                introVideo.muted = true;
                introVideo.loop = false;
            }
        } else {
            startVideoAutoplay();
        }
    }

    function togglePlayPause() {
        if (!introVideo) return;
        if (introVideo.paused) {
            introVideo.play().catch(function () {});
        } else {
            introVideo.pause();
        }
        updatePlayPauseButton();
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', hideIntroScreen);
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', hideIntroScreen);
    }

    if (unmuteBtn) {
        unmuteBtn.addEventListener('click', function () {
            if (!introVideo) return;
            introVideo.muted = false;
            introVideo.play().catch(function () {});
            unmuteBtn.style.display = 'none';
        });
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', function () {
            togglePlayPause();
        });
    }

    if (tapPlayBtn) {
        tapPlayBtn.addEventListener('click', function () {
            if (!introVideo) return;
            introScreen.classList.remove('tap-to-play');
            introVideo.muted = true;
            introVideo.loop = false;
            introVideo.play().then(function () {
                updatePlayPauseButton();
            }).catch(function () {});
        });
    }

    if (introVideo) {
        introVideo.addEventListener('ended', hideIntroScreen);
        introVideo.addEventListener('play', updatePlayPauseButton);
        introVideo.addEventListener('pause', updatePlayPauseButton);
    }

    document.addEventListener('keydown', function (event) {
        if (!introScreen || !introScreen.classList.contains('is-visible')) return;
        if (event.key === 'Escape' || event.key === 'Esc') {
            hideIntroScreen();
        }
    });

    window.addEventListener('DOMContentLoaded', function () {
        initializeIntroVideo();
    });

    document.addEventListener('click', function (event) {
        if (!introScreen || !introScreen.classList.contains('is-visible')) return;
        if (event.target.closest('.intro-play-btn') || event.target.closest('.intro-video-controls') || event.target.closest('.intro-close-btn') || event.target.closest('.intro-skip-btn')) {
            return;
        }
        if (introScreen.classList.contains('tap-to-play') && introVideo && introVideo.paused) {
            introVideo.play().catch(function () {});
            introScreen.classList.remove('tap-to-play');
        }
    });
    
    // Initiate the wowjs
    new WOW().init();


    // Header carousel
    $(".header-carousel").owlCarousel({
        animateOut: 'fadeOut',
        items: 1,
        margin: 0,
        stagePadding: 0,
        autoplay: true,
        smartSpeed: 1000,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
    });


    // Features Section
    $(".testimonial-carousel").owlCarousel({
        items: 1,
        autoplay: true,
        smartSpeed: 1000,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="fas fa-chevron-left"></i>',
            '<i class="fas fa-chevron-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:1
            },
            992:{
                items:1
            }
        }
    });



   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


})(jQuery);

