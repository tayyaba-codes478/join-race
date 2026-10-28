
document.addEventListener("DOMContentLoaded", () => {
    const slides = [...document.querySelectorAll(".slide")];
    const navButtons = [...document.querySelectorAll(".nav-btn")];

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const autoplayBtn = document.getElementById("autoplayBtn");
    const progressBar = document.getElementById("progressBar");
    const footerCounter = document.getElementById("footerCounter");

    const menuBtn = document.getElementById("menuBtn");
    const menuPanel = document.getElementById("menuPanel");

    const detailOverlay = document.getElementById("detailOverlay");
    const detailTitle = document.getElementById("detailTitle");
    const detailDescription = document.getElementById("detailDescription");
    const closeDetails = document.getElementById("closeDetails");
    const detailDone = document.getElementById("detailDone");

    const carDetails = [
        {
            title: "Lamborghini Supercar",
            description:
                "A bold supercar concept focused on dramatic styling, striking colour and the excitement of performance."
        },
        {
            title: "Classic Car Collection",
            description:
                "A celebration of timeless automotive design, vintage character and classic elegance."
        },
        {
            title: "Bugatti Hypercar",
            description:
                "A performance-inspired showcase built around precision styling, blue accents and a futuristic visual identity."
        }
    ];

    let currentIndex = 0;
    let autoplay = true;
    let autoplayTimer = null;
    let progressTimer = null;

    const intervalDuration = 4500;

    // Apply the active slide's accent colour.
    function applyTheme(index) {
        const activeSlide = slides[index];
        const theme = activeSlide.dataset.theme;

        const themes = {
            gold: {
                accent: "#e9bd54",
                rgb: "233, 189, 84"
            },
            red: {
                accent: "#e36d65",
                rgb: "227, 109, 101"
            },
            blue: {
                accent: "#68a5ff",
                rgb: "104, 165, 255"
            }
        };

        const selectedTheme = themes[theme];

        document.documentElement.style.setProperty(
            "--accent",
            selectedTheme.accent
        );

        document.documentElement.style.setProperty(
            "--accent-rgb",
            selectedTheme.rgb
        );

        // Keep the active navigation button in the same accent colour.
        navButtons.forEach((button, index) => {
            button.style.setProperty(
                "--accent",
                selectedTheme.accent
            );
        });
    }

    // Reset the progress animation.
    function resetProgress() {
        progressBar.classList.remove("running", "paused");

        // Restart CSS animation.
        void progressBar.offsetWidth;

        if (autoplay) {
            progressBar.classList.add("running");
        } else {
            progressBar.style.width = "100%";
        }
    }

    // Clear existing timers.
    function clearTimers() {
        clearInterval(autoplayTimer);
        clearTimeout(progressTimer);

        autoplayTimer = null;
        progressTimer = null;
    }

    // Move to a selected slide.
    function goToSlide(index, resetAutoplay = true) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === currentIndex;

            slide.classList.toggle("active", isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
        });

        navButtons.forEach((button, buttonIndex) => {
            const isActive = buttonIndex === currentIndex;

            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        footerCounter.textContent =
            `0${currentIndex + 1} / 0${slides.length}`;

        applyTheme(currentIndex);

        if (resetAutoplay) {
            startAutoplay();
        }
    }

    // Start or restart automatic sliding.
    function startAutoplay() {
        clearTimers();

        resetProgress();

        if (!autoplay) {
            return;
        }

        progressTimer = setTimeout(() => {
            progressBar.style.width = "0";
            progressBar.classList.remove("running");
        }, intervalDuration);

        autoplayTimer = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, intervalDuration);
    }

    // Pause automatic sliding.
    function pauseAutoplay() {
        autoplay = false;
        clearTimers();

        progressBar.classList.remove("running");
        progressBar.classList.add("paused");
        progressBar.style.width = "100%";

        autoplayBtn.innerHTML = '<i class="fas fa-play"></i>';
        autoplayBtn.setAttribute("aria-label", "Resume automatic slideshow");
        autoplayBtn.title = "Resume slideshow";
    }

    // Resume automatic sliding.
    function resumeAutoplay() {
        autoplay = true;

        autoplayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        autoplayBtn.setAttribute("aria-label", "Pause automatic slideshow");
        autoplayBtn.title = "Pause slideshow";

        startAutoplay();
    }

    // Numbered navigation.
    navButtons.forEach((button) => {
        button.addEventListener("click", () => {
            goToSlide(Number(button.dataset.index));
        });
    });

    // Previous and next controls.
    prevBtn.addEventListener("click", () => {
        goToSlide(currentIndex - 1);
    });

    nextBtn.addEventListener("click", () => {
        goToSlide(currentIndex + 1);
    });

    // Pause / resume button.
    autoplayBtn.addEventListener("click", () => {
        if (autoplay) {
            pauseAutoplay();
        } else {
            resumeAutoplay();
        }
    });

    // Open the navigation menu.
    menuBtn.addEventListener("click", () => {
        const isOpen = menuPanel.classList.toggle("open");

        menuBtn.setAttribute("aria-expanded", String(isOpen));

        menuBtn.innerHTML = isOpen
            ? '<i class="fas fa-xmark"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    // Navigate from the menu.
    menuPanel.querySelectorAll("[data-slide]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            goToSlide(Number(link.dataset.slide));

            menuPanel.classList.remove("open");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // Show the details popup for the selected car.
    document.querySelectorAll("[data-discover]").forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.discover);
            const car = carDetails[index];

            detailTitle.textContent = car.title;
            detailDescription.textContent = car.description;

            detailOverlay.classList.add("open");
            detailOverlay.setAttribute("aria-hidden", "false");

            closeDetails.focus();

            pauseAutoplay();
        });
    });

    // Close the details popup.
    function hideDetails() {
        detailOverlay.classList.remove("open");
        detailOverlay.setAttribute("aria-hidden", "true");

        if (autoplay) {
            startAutoplay();
        }

        document.querySelector(
            `[data-discover="${currentIndex}"]`
        ).focus();
    }

    closeDetails.addEventListener("click", hideDetails);
    detailDone.addEventListener("click", hideDetails);

    detailOverlay.addEventListener("click", (event) => {
        if (event.target === detailOverlay) {
            hideDetails();
        }
    });

    // Escape key closes popup and menu.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (detailOverlay.classList.contains("open")) {
                hideDetails();
            }

            menuPanel.classList.remove("open");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }

        // Keyboard arrow navigation when popup is closed.
        if (!detailOverlay.classList.contains("open")) {
            if (event.key === "ArrowRight") {
                goToSlide(currentIndex + 1);
            }

            if (event.key === "ArrowLeft") {
                goToSlide(currentIndex - 1);
            }
        }
    });

    // Pause while the pointer is over the slider.
    // Do not override a pause that the user selected manually.
    let pausedByHover = false;

    const slider = document.querySelector(".slider");

    slider.addEventListener("mouseenter", () => {
        if (autoplay) {
            pausedByHover = true;
            clearTimers();
            progressBar.classList.add("paused");
        }
    });

    slider.addEventListener("mouseleave", () => {
        if (pausedByHover && autoplay) {
            pausedByHover = false;
            startAutoplay();
        }
    });

    // Respect reduced-motion preference.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        pauseAutoplay();
    } else {
        startAutoplay();
    }

    // Initial render.
    goToSlide(0);
});
