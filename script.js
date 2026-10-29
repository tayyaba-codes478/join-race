
document.addEventListener("DOMContentLoaded", () => {
    const slides = [...document.querySelectorAll(".slide")];
    const navButtons = [...document.querySelectorAll(".nav-btn")];

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const autoplayBtn = document.getElementById("autoplayBtn");
    const progressBar = document.getElementById("progressBar");
    const progressTrack = document.querySelector(".progress-track");
    const footerCounter = document.getElementById("footerCounter");

    const menuBtn = document.getElementById("menuBtn");
    const menuPanel = document.getElementById("menuPanel");

    const detailOverlay = document.getElementById("detailOverlay");
    const detailTitle = document.getElementById("detailTitle");
    const detailDescription = document.getElementById("detailDescription");
    const closeDetails = document.getElementById("closeDetails");
    const detailDone = document.getElementById("detailDone");

    const slider = document.querySelector(".slider");
    const intervalDuration = 2000;

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

    const themes = {
        gold: { accent: "#e9bd54", rgb: "233, 189, 84" },
        red: { accent: "#e36d65", rgb: "227, 109, 101" },
        blue: { accent: "#68a5ff", rgb: "104, 165, 255" }
    };

    let currentIndex = 0;
    let autoplay = true;
    let timer = null;
    let progressStartedAt = 0;
    let remainingTime = intervalDuration;
    let hovered = false;
    let popupOpen = false;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
        autoplay = false;
    }

    function applyTheme(index) {
        const themeName = slides[index].dataset.theme;
        const selectedTheme = themes[themeName] || themes.gold;

        document.documentElement.style.setProperty(
            "--accent",
            selectedTheme.accent
        );

        document.documentElement.style.setProperty(
            "--accent-rgb",
            selectedTheme.rgb
        );
    }

    function updateAutoplayButton() {
        autoplayBtn.innerHTML = autoplay
            ? '<i class="fas fa-pause"></i>'
            : '<i class="fas fa-play"></i>';

        autoplayBtn.setAttribute(
            "aria-label",
            autoplay ? "Pause automatic slideshow" : "Resume automatic slideshow"
        );

        autoplayBtn.title = autoplay ? "Pause slideshow" : "Resume slideshow";
    }

    function updateProgress(value) {
        const percentage = Math.max(0, Math.min(100, value));

        progressBar.style.width = `${percentage}%`;
        progressTrack.setAttribute("aria-valuenow", String(Math.round(percentage)));
    }

    function clearTimer() {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function stopProgressAnimation() {
        progressBar.classList.remove("running");
        progressBar.classList.add("paused");
    }

    function startProgressAnimation() {
        progressBar.classList.remove("running", "paused");
        progressBar.style.width = `${100 - (remainingTime / intervalDuration) * 100}%`;

        // Restart the CSS progress animation from the current point.
        void progressBar.offsetWidth;

        progressBar.style.width = "";
        progressBar.style.animationDuration = `${remainingTime}ms`;
        progressBar.style.animationDelay = "0ms";
        progressBar.classList.add("running");
        progressStartedAt = performance.now();
    }

    function scheduleNextSlide() {
        clearTimer();

        if (!autoplay || hovered || popupOpen || document.hidden) {
            return;
        }

        startProgressAnimation();

        timer = setTimeout(() => {
            remainingTime = intervalDuration;
            goToSlide(currentIndex + 1);
        }, remainingTime);
    }

    function pauseTimer() {
        if (timer !== null) {
            clearTimer();

            const elapsed = performance.now() - progressStartedAt;
            remainingTime = Math.max(0, remainingTime - elapsed);
        }

        stopProgressAnimation();
    }

    function resumeTimer() {
        if (!autoplay || hovered || popupOpen || document.hidden) {
            return;
        }

        if (remainingTime <= 0) {
            remainingTime = intervalDuration;
            goToSlide(currentIndex + 1);
            return;
        }

        scheduleNextSlide();
    }

    function goToSlide(index) {
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
            `${String(currentIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;

        applyTheme(currentIndex);

        remainingTime = intervalDuration;
        updateProgress(0);
        scheduleNextSlide();
    }

    function pauseAutoplay() {
        autoplay = false;
        pauseTimer();
        updateAutoplayButton();
    }

    function resumeAutoplay() {
        autoplay = true;
        remainingTime = intervalDuration;
        updateAutoplayButton();
        scheduleNextSlide();
    }

    navButtons.forEach((button) => {
        button.addEventListener("click", () => {
            goToSlide(Number(button.dataset.index));
        });
    });

    prevBtn.addEventListener("click", () => {
        goToSlide(currentIndex - 1);
    });

    nextBtn.addEventListener("click", () => {
        goToSlide(currentIndex + 1);
    });

    autoplayBtn.addEventListener("click", () => {
        if (autoplay) {
            pauseAutoplay();
        } else {
            resumeAutoplay();
        }
    });

    menuBtn.addEventListener("click", () => {
        const isOpen = menuPanel.classList.toggle("open");

        menuBtn.setAttribute("aria-expanded", String(isOpen));
        menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

        menuBtn.innerHTML = isOpen
            ? '<i class="fas fa-xmark"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    menuPanel.querySelectorAll("[data-slide]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            goToSlide(Number(link.dataset.slide));
            menuPanel.classList.remove("open");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.setAttribute("aria-label", "Open menu");
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    function showDetails(index) {
        const car = carDetails[index];
        if (!car) return;

        detailTitle.textContent = car.title;
        detailDescription.textContent = car.description;

        popupOpen = true;
        detailOverlay.classList.add("open");
        detailOverlay.setAttribute("aria-hidden", "false");

        pauseTimer();
        closeDetails.focus();
    }

    function hideDetails() {
        if (!popupOpen) return;

        popupOpen = false;
        detailOverlay.classList.remove("open");
        detailOverlay.setAttribute("aria-hidden", "true");

        if (autoplay) {
            remainingTime = intervalDuration;
            scheduleNextSlide();
        }

        const activeDiscoverButton = document.querySelector(
            `[data-discover="${currentIndex}"]`
        );

        if (activeDiscoverButton) {
            activeDiscoverButton.focus();
        }
    }

    document.querySelectorAll("[data-discover]").forEach((button) => {
        button.addEventListener("click", () => {
            showDetails(Number(button.dataset.discover));
        });
    });

    closeDetails.addEventListener("click", hideDetails);
    detailDone.addEventListener("click", hideDetails);

    detailOverlay.addEventListener("click", (event) => {
        if (event.target === detailOverlay) {
            hideDetails();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (popupOpen) hideDetails();

            menuPanel.classList.remove("open");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.setAttribute("aria-label", "Open menu");
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }

        if (popupOpen) return;

        if (event.key === "ArrowRight") {
            goToSlide(currentIndex + 1);
        }

        if (event.key === "ArrowLeft") {
            goToSlide(currentIndex - 1);
        }
    });

    // Pause on hover, preserving the remaining time.
    slider.addEventListener("mouseenter", () => {
        hovered = true;
        pauseTimer();
    });

    slider.addEventListener("mouseleave", () => {
        hovered = false;
        resumeTimer();
    });

    // Pause the slideshow while the browser tab is hidden.
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            pauseTimer();
        } else {
            resumeTimer();
        }
    });

    // Respect reduced-motion preferences.
    if (reducedMotion) {
        autoplay = false;
        updateAutoplayButton();
    }

    updateAutoplayButton();
    goToSlide(0);
});
