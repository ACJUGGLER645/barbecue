document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu ---
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.remove('fa-times');
            menuToggle.querySelector('i').classList.add('fa-bars');
        });
    });

    // --- Dark Mode ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    // Check local storage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    // --- Scroll Spy ---
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinksItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- Calendar Links ---
    const calendarBtns = document.querySelectorAll('.calendar-btn');

    const events = {
        'sensor': {
            title: 'Sensor Events Parfait - Dev Barbecue',
            start: '20251207T140000', // 2:00 PM
            end: '20251207T180000',   // 6:00 PM
            details: 'Integración y pruebas de sensores. Evento oficial Dev Barbecue ETITC.',
            location: 'Parque de los Novios, Bogotá'
        },
        'cafe': {
            title: 'Café CPM - Santiago post-viaje',
            start: '20251217T160000', // 4:00 PM
            end: '20251217T190000',   // 7:00 PM
            details: 'Charlas sobre la experiencia en Canadá y café.',
            location: 'Cafetería ETITC'
        }
    };

    calendarBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const eventKey = btn.getAttribute('data-event');
            const eventData = events[eventKey];

            if (eventData) {
                const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${eventData.start}/${eventData.end}&details=${encodeURIComponent(eventData.details)}&location=${encodeURIComponent(eventData.location)}`;
                window.open(url, '_blank');
            }
        });
    });

    // --- Slider Logic ---
    const track = document.querySelector('.slider-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');

    let currentSlideIndex = 0;

    const updateSlidePosition = () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transform = 'translateX(-' + (slideWidth * currentSlideIndex) + 'px)';
    };

    const moveToNextSlide = () => {
        currentSlideIndex++;
        if (currentSlideIndex >= slides.length) {
            currentSlideIndex = 0;
        }
        updateSlidePosition();
    };

    const moveToPrevSlide = () => {
        currentSlideIndex--;
        if (currentSlideIndex < 0) {
            currentSlideIndex = slides.length - 1;
        }
        updateSlidePosition();
    };

    if (nextButton && prevButton) {
        nextButton.addEventListener('click', moveToNextSlide);
        prevButton.addEventListener('click', moveToPrevSlide);

        // Auto-play slider
        let slideInterval = setInterval(moveToNextSlide, 5000);

        // Pause on hover
        const sliderWrapper = document.querySelector('.slider-wrapper');
        sliderWrapper.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        sliderWrapper.addEventListener('mouseleave', () => {
            slideInterval = setInterval(moveToNextSlide, 5000);
        });

        // Handle resize
        window.addEventListener('resize', updateSlidePosition);
    }
});
