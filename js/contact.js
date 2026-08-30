/* =========================================================
   LUXORA — CONTACT PAGE JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const contactForm = document.querySelector(".contact-form");
    const formMessage = document.querySelector(".form-message");
    const submitButton = document.querySelector(".contact-submit");


    /* =====================================================
       FORM ELEMENTS
    ===================================================== */

    if (!contactForm) return;

    const firstNameInput = contactForm.querySelector(
        'input[name="firstName"], #firstName'
    );

    const lastNameInput = contactForm.querySelector(
        'input[name="lastName"], #lastName'
    );

    const emailInput = contactForm.querySelector(
        'input[name="email"], #email'
    );

    const phoneInput = contactForm.querySelector(
        'input[name="phone"], #phone'
    );

    const subjectInput = contactForm.querySelector(
        'input[name="subject"], #subject, select[name="subject"], #contact-subject'
    );

    const messageInput = contactForm.querySelector(
        'textarea[name="message"], #message'
    );


    /* =====================================================
       VALIDATION HELPERS
    ===================================================== */

    function showError(input) {
        if (!input) return;

        input.classList.remove("success");
        input.classList.add("error");
    }


    function showSuccess(input) {
        if (!input) return;

        input.classList.remove("error");
        input.classList.add("success");
    }


    function clearValidation(input) {
        if (!input) return;

        input.classList.remove("error", "success");
    }


    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }


    function isValidPhone(phone) {
        if (!phone) return true;

        return /^[0-9+\-\s()]{7,20}$/.test(phone);
    }


    function validateField(input, type = "text") {

        if (!input) return false;

        const value = input.value.trim();

        if (value === "") {
            showError(input);
            return false;
        }

        if (type === "email" && !isValidEmail(value)) {
            showError(input);
            return false;
        }

        if (type === "phone" && !isValidPhone(value)) {
            showError(input);
            return false;
        }

        showSuccess(input);

        return true;
    }


    /* =====================================================
       LIVE VALIDATION
    ===================================================== */

    if (firstNameInput) {
        firstNameInput.addEventListener("input", () => {

            if (firstNameInput.value.trim() === "") {
                clearValidation(firstNameInput);
            } else {
                validateField(firstNameInput);
            }

        });
    }

    if (lastNameInput) {
        lastNameInput.addEventListener("input", () => {

            if (lastNameInput.value.trim() === "") {
                clearValidation(lastNameInput);
            } else {
                validateField(lastNameInput);
            }

        });
    }


    if (emailInput) {
        emailInput.addEventListener("input", () => {

            if (emailInput.value.trim() === "") {
                clearValidation(emailInput);
            } else {
                validateField(emailInput, "email");
            }

        });
    }


    if (phoneInput) {
        phoneInput.addEventListener("input", () => {

            /* Phone is optional — only validate format when something is typed */

            if (phoneInput.value.trim() === "") {
                clearValidation(phoneInput);
            } else {
                validateField(phoneInput, "phone");
            }

        });
    }


    if (subjectInput) {
        subjectInput.addEventListener("change", () => {

            if (subjectInput.value.trim() === "") {
                clearValidation(subjectInput);
            } else {
                showSuccess(subjectInput);
            }

        });
    }


    if (messageInput) {
        messageInput.addEventListener("input", () => {

            if (messageInput.value.trim() === "") {
                clearValidation(messageInput);
            } else if (messageInput.value.trim().length < 10) {
                showError(messageInput);
            } else {
                showSuccess(messageInput);
            }

        });
    }


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    contactForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const validFirstName = validateField(firstNameInput);

        const validLastName = validateField(lastNameInput);

        const validEmail = validateField(
            emailInput,
            "email"
        );

        /* Phone is optional — only invalid if something was typed and it's malformed */

        const validPhone =
            !phoneInput ||
            phoneInput.value.trim() === "" ||
            validateField(phoneInput, "phone");

        let validSubject = true;

        if (subjectInput) {
            validSubject = validateField(subjectInput);
        }

        const validMessage = validateField(messageInput);


        /* ---------- Message Length ---------- */

        if (
            messageInput &&
            messageInput.value.trim().length < 10
        ) {
            showError(messageInput);
        }


        if (
            !validFirstName ||
            !validLastName ||
            !validEmail ||
            !validPhone ||
            !validSubject ||
            !validMessage ||
            (
                messageInput &&
                messageInput.value.trim().length < 10
            )
        ) {

            showFormMessage(
                "Please complete all required fields correctly.",
                "error"
            );

            return;
        }


        /* =================================================
           LOADING STATE
        ================================================= */

        const originalButtonHTML = submitButton
            ? submitButton.innerHTML
            : "";


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.innerHTML = `
                <span>Sending...</span>
                <i class="fa-solid fa-spinner fa-spin"></i>
            `;

        }


        /* =================================================
           SUBMIT TO API (falls back to demo behavior if the
           backend isn't running, so the form still gives
           feedback during preview)
        ================================================= */

        (async () => {

            try {

                if (typeof luxoraApiFetch !== "function") {
                    throw new Error("API not available");
                }

                const payload = {
                    name: `${firstNameInput?.value.trim() || ""} ${lastNameInput?.value.trim() || ""}`.trim(),
                    email: emailInput?.value.trim(),
                    phone: phoneInput?.value.trim() || "",
                    subject: subjectInput?.value || "",
                    message: messageInput?.value.trim(),
                };

                const result = await luxoraApiFetch("/contact", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });

                showFormMessage(
                    result.emailSent
                        ? "Thank you! Your message has been sent successfully. We will get back to you soon."
                        : "Thank you! Your message has been received. (Email delivery is not configured yet, but we have your message.)",
                    "success"
                );

            } catch (err) {

                showFormMessage(
                    "Sorry, something went wrong sending your message. Please try again or email us directly.",
                    "error"
                );

                console.warn("Contact form submission failed:", err.message);

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonHTML;
                }

                return;
            }

            contactForm.reset();

            /* Remove validation */

            contactForm
                .querySelectorAll("input, select, textarea")
                .forEach((field) => {
                    clearValidation(field);
                });


            /* Restore button */

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerHTML =
                    originalButtonHTML;

            }

        })();

    });


    /* =====================================================
       FORM MESSAGE
    ===================================================== */

    function showFormMessage(message, type) {

        if (!formMessage) return;

        formMessage.textContent = message;

        formMessage.className = "form-message";

        formMessage.classList.add(type);

        formMessage.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }


    /* =====================================================
       REMOVE MESSAGE WHEN USER STARTS TYPING
    ===================================================== */

    contactForm
        .querySelectorAll("input, select, textarea")
        .forEach((field) => {

            field.addEventListener("focus", () => {

                if (formMessage) {
                    formMessage.className = "form-message";
                    formMessage.textContent = "";
                }

            });

        });


    /* =====================================================
       PHONE INPUT — BASIC CLEANING
    ===================================================== */

    if (phoneInput) {

        phoneInput.addEventListener("input", () => {

            phoneInput.value = phoneInput.value.replace(
                /[^0-9+\-\s()]/g,
                ""
            );

        });

    }


    /* =====================================================
       AUTO YEAR
       HTML: <span class="current-year"></span>
    ===================================================== */

    document
        .querySelectorAll(".current-year")
        .forEach((element) => {

            element.textContent =
                new Date().getFullYear();

        });


    /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach((link) => {

            link.addEventListener("click", (event) => {

                const targetID =
                    link.getAttribute("href");

                if (
                    !targetID ||
                    targetID === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(targetID);

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

        });


    /* =====================================================
       SUPPORT CARD KEYBOARD ACCESSIBILITY
    ===================================================== */

    document
        .querySelectorAll(".support-card")
        .forEach((card) => {

            card.addEventListener("keydown", (event) => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    card.click();

                }

            });

        });

});