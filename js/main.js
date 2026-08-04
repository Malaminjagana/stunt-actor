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
    var soundBtn = introScreen ? introScreen.querySelector('.intro-sound-btn') : null;
    var soundOverlay = document.getElementById('intro-sound-overlay');
    var closeBtn = introScreen ? introScreen.querySelector('.intro-close-btn') : null;
    var skipBtn = introScreen ? introScreen.querySelector('.intro-skip-btn') : null;
    var tapPlayBtn = introScreen ? introScreen.querySelector('.intro-play-btn') : null;
    var lastFocusedElement = null;
    var introVideoSessionKey = 'introVideoHasPlayed';

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

    function showSoundOverlay() {
        if (!soundOverlay) return;
        soundOverlay.classList.add('visible');
    }

    function hideSoundOverlay() {
        if (!soundOverlay) return;
        soundOverlay.classList.remove('visible');
    }

    function hasIntroVideoPlayedInSession() {
        try {
            return sessionStorage.getItem(introVideoSessionKey) === 'true';
        } catch (error) {
            return false;
        }
    }

    function markIntroVideoPlayedInSession() {
        try {
            sessionStorage.setItem(introVideoSessionKey, 'true');
        } catch (error) {
            // Ignore storage errors and fall back to default behavior.
        }
    }

    function clearIntroVideoSessionFlag() {
        try {
            sessionStorage.removeItem(introVideoSessionKey);
        } catch (error) {
            // Ignore storage errors and fall back to default behavior.
        }
    }

    function applyIntroVideoAutoplayState() {
        if (!introVideo) return;
        if (hasIntroVideoPlayedInSession()) {
            introVideo.removeAttribute('autoplay');
            introVideo.autoplay = false;
        } else {
            introVideo.setAttribute('autoplay', '');
            introVideo.autoplay = true;
        }
    }

    function startVideoAutoplay() {
        if (!introVideo) return;
        introVideo.muted = false;
        introVideo.volume = 1.0;
        introVideo.loop = false;
        introVideo.autoplay = true;
        introVideo.play().then(function () {
            updatePlayPauseButton();
            hideSoundOverlay();
            if (soundBtn) {
                soundBtn.textContent = 'Mute';
            }
        }).catch(function () {
            showSoundOverlay();
            introScreen.classList.add('tap-to-play');
            introVideo.muted = true;
            if (soundBtn) {
                soundBtn.textContent = 'Unmute';
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

        applyIntroVideoAutoplayState();
        showIntroScreen();
        lastFocusedElement = document.activeElement;

        if (useTapToPlay) {
            introScreen.classList.add('tap-to-play');
            if (introVideo) {
                introVideo.muted = true;
                introVideo.loop = false;
            }
        } else if (!hasIntroVideoPlayedInSession()) {
            startVideoAutoplay();
        } else {
            introScreen.classList.remove('tap-to-play');
            if (introVideo) {
                introVideo.muted = true;
                introVideo.loop = false;
                introVideo.autoplay = false;
                introVideo.pause();
            }
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

    if (soundBtn) {
        soundBtn.addEventListener('click', function () {
            if (!introVideo) return;
            if (introVideo.muted) {
                introVideo.muted = false;
                introVideo.volume = 1.0;
                soundBtn.textContent = 'Mute';
                hideSoundOverlay();
                introVideo.currentTime = 0;
                introVideo.play().catch(function () {});
            } else {
                introVideo.muted = true;
                soundBtn.textContent = 'Unmute';
            }
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

    if (soundOverlay) {
        soundOverlay.addEventListener('click', function () {
            if (!introVideo) return;
            introVideo.muted = false;
            introVideo.volume = 1.0;
            introVideo.currentTime = 0;
            introVideo.play().catch(function () {});
            hideSoundOverlay();
            if (soundBtn) {
                soundBtn.textContent = 'Mute';
            }
            introScreen.classList.remove('tap-to-play');
        });
    }

    if (introVideo) {
        introVideo.addEventListener('ended', function () {
            hideIntroScreen();
        });
        introVideo.addEventListener('play', function () {
            markIntroVideoPlayedInSession();
            applyIntroVideoAutoplayState();
            updatePlayPauseButton();
            if (soundBtn && !introVideo.muted) {
                soundBtn.textContent = 'Mute';
            }
        });
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
        if (event.target.closest('.intro-play-btn') || event.target.closest('.intro-video-controls') || event.target.closest('.intro-close-btn') || event.target.closest('.intro-skip-btn') || event.target.closest('.intro-sound-btn') || event.target.closest('.intro-sound-overlay')) {
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

