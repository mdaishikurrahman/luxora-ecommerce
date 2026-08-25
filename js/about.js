/* =========================================================
   LUXORA — ABOUT PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const navbar = document.querySelector(".navbar");

    if (menuToggle && navbar) {

        menuToggle.addEventListener("click", () => {
            navbar.classList.toggle("active");

            const isOpen = navbar.classList.contains("active");

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuToggle.classList.toggle("active", isOpen);
        });


        /* Close menu after clicking a link */

        const navLinks = navbar.querySelectorAll("a");

        navLinks.forEach(link => {

            link.addEventListener("click", () => {

                navbar.classList.remove("active");
                menuToggle.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });


        /* Close menu when clicking outside */

        document.addEventListener("click", (event) => {

            if (
                !navbar.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                navbar.classList.remove("active");
                menuToggle.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }

        });

    }


    /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

    const internalLinks = document.querySelectorAll(
        'a[href^="#"]'
    );

    internalLinks.forEach(link => {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =====================================================
       SCROLL REVEAL ANIMATION
    ===================================================== */

    const revealElements = document.querySelectorAll(
        ".about-story-content, " +
        ".about-story-image, " +
        ".about-heading, " +
        ".value-card, " +
        ".philosophy-content, " +
        ".philosophy-image, " +
        ".about-cta-content"
    );

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("revealed");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -50px 0px"
            }
        );

        revealElements.forEach(element => {

            element.classList.add("about-reveal");

            revealObserver.observe(element);

        });

    }


    /* =====================================================
       VALUE CARD STAGGER EFFECT
    ===================================================== */

    const valueCards = document.querySelectorAll(".value-card");

    valueCards.forEach((card, index) => {

        card.style.transitionDelay = `${index * 80}ms`;

    });


    /* =====================================================
       STAT COUNTER
    ===================================================== */

    const statNumbers = document.querySelectorAll(
        ".philosophy-stat strong[data-count]"
    );

    if (
        statNumbers.length &&
        "IntersectionObserver" in window
    ) {

        const counterObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    const element = entry.target;

                    const target = parseInt(
                        element.dataset.count,
                        10
                    );

                    if (Number.isNaN(target)) {
                        return;
                    }

                    let current = 0;

                    const duration = 1800;
                    const incrementTime = 20;

                    const increment =
                        target /
                        (duration / incrementTime);

                    const counter = setInterval(() => {

                        current += increment;

                        if (current >= target) {

                            current = target;

                            clearInterval(counter);

                        }

                        element.textContent =
                            Math.floor(current) + "+";

                    }, incrementTime);

                    observer.unobserve(element);

                });

            },
            {
                threshold: 0.5
            }
        );

        statNumbers.forEach(number => {

            counterObserver.observe(number);

        });

    }


    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    const header = document.querySelector("header");

    if (header) {

        const handleHeaderScroll = () => {

            if (window.scrollY > 60) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

        };

        window.addEventListener(
            "scroll",
            handleHeaderScroll,
            {
                passive: true
            }
        );

        handleHeaderScroll();

    }


    /* =====================================================
       IMAGE LOADING EFFECT
    ===================================================== */

    const images = document.querySelectorAll(
        ".about-story-image img, " +
        ".philosophy-image img"
    );

    images.forEach(image => {

        if (image.complete) {

            image.classList.add("loaded");

        } else {

            image.addEventListener(
                "load",
                () => {
                    image.classList.add("loaded");
                },
                {
                    once: true
                }
            );

        }

    });


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const yearElements = document.querySelectorAll(
        ".current-year"
    );

    yearElements.forEach(element => {

        element.textContent =
            new Date().getFullYear();

    });


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backTop = document.querySelector(
        ".back-to-top"
    );

    if (backTop) {

        window.addEventListener(
            "scroll",
            () => {

                if (window.scrollY > 500) {

                    backTop.classList.add("show");

                } else {

                    backTop.classList.remove("show");

                }

            },
            {
                passive: true
            }
        );


        backTop.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

});