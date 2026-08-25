/* =========================================================
   LUXORA — MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. MOBILE MENU
    ===================================================== */

    const menuToggle = document.getElementById("menuToggle");
    const navbar = document.getElementById("navbar");

    if (menuToggle && navbar) {

        menuToggle.addEventListener("click", () => {

            navbar.classList.toggle("active");

            const icon = menuToggle.querySelector("i");

            if (navbar.classList.contains("active")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");
                document.body.classList.add("no-scroll");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
                document.body.classList.remove("no-scroll");
            }

        });


        /* Close mobile menu when clicking a link */

        navbar.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navbar.classList.remove("active");

                const icon = menuToggle.querySelector("i");

                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");

                document.body.classList.remove("no-scroll");

            });

        });

    }


    /* =====================================================
       2. SEARCH OVERLAY
    ===================================================== */

    const searchBtn = document.querySelector(".search-btn");
    const searchOverlay = document.getElementById("searchOverlay");
    const closeSearch = document.getElementById("closeSearch");

    if (searchBtn && searchOverlay) {

        searchBtn.addEventListener("click", () => {

            searchOverlay.classList.add("active");
            document.body.classList.add("no-scroll");

            const input = searchOverlay.querySelector("input");

            if (input) {
                setTimeout(() => input.focus(), 300);
            }

        });

    }


    if (closeSearch && searchOverlay) {

        closeSearch.addEventListener("click", () => {

            searchOverlay.classList.remove("active");
            document.body.classList.remove("no-scroll");

        });

    }


    /* Close search by clicking outside */

    if (searchOverlay) {

        searchOverlay.addEventListener("click", event => {

            if (event.target === searchOverlay) {

                searchOverlay.classList.remove("active");
                document.body.classList.remove("no-scroll");

            }

        });

    }


    /* Close search with ESC */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            if (searchOverlay) {
                searchOverlay.classList.remove("active");
            }

            if (navbar) {
                navbar.classList.remove("active");
            }

            document.body.classList.remove("no-scroll");

        }

    });


    /* =====================================================
       3. CART SYSTEM
    ===================================================== */

    let cart = JSON.parse(localStorage.getItem("luxoraCart")) || [];

    const cartCountElements = document.querySelectorAll(".cart-count");


    function updateCartCount() {

        const totalItems = cart.reduce((total, item) => {
            return total + item.quantity;
        }, 0);


        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });

    }


    function saveCart() {

        localStorage.setItem(
            "luxoraCart",
            JSON.stringify(cart)
        );

        updateCartCount();

    }


    function addToCart(name, price) {

        const existingProduct = cart.find(
            item => item.name === name
        );


        if (existingProduct) {

            existingProduct.quantity += 1;

        } else {

            cart.push({
                name: name,
                price: Number(price),
                quantity: 1
            });

        }


        saveCart();

        showToast(`${name} added to cart`);

    }


    /* Add to cart buttons */

    document.querySelectorAll(".add-cart").forEach(button => {

        button.addEventListener("click", () => {

            const productName =
                button.dataset.product || "Product";

            const productPrice =
                button.dataset.price || 0;

            addToCart(
                productName,
                productPrice
            );

        });

    });


    /* Initial cart count */

    updateCartCount();


    /* =====================================================
       4. WISHLIST
    ===================================================== */

    const wishlistButtons =
        document.querySelectorAll(".wishlist-btn");


    wishlistButtons.forEach(button => {

        button.addEventListener("click", () => {

            const icon = button.querySelector("i");

            button.classList.toggle("active");


            if (button.classList.contains("active")) {

                if (icon) {
                    icon.classList.remove("fa-regular");
                    icon.classList.add("fa-solid");
                }

                showToast("Added to wishlist");

            } else {

                if (icon) {
                    icon.classList.remove("fa-solid");
                    icon.classList.add("fa-regular");
                }

                showToast("Removed from wishlist");

            }

        });

    });


    /* =====================================================
       5. PRODUCT FILTER
    ===================================================== */

    const tabs =
        document.querySelectorAll(".tab");

    const products =
        document.querySelectorAll(
            ".new-products .product-card"
        );


    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            const filter =
                tab.dataset.filter;


            /* Active tab */

            tabs.forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");


            /* Filter products */

            products.forEach(product => {

                const category =
                    product.dataset.category;


                if (
                    filter === "all" ||
                    category === filter
                ) {

                    product.classList.remove("hidden");

                } else {

                    product.classList.add("hidden");

                }

            });

        });

    });


    /* =====================================================
       6. QUICK VIEW
    ===================================================== */

    const quickViewButtons =
        document.querySelectorAll(".quick-view");


    quickViewButtons.forEach(button => {

        button.addEventListener("click", () => {

            const card =
                button.closest(".product-card");

            if (!card) return;


            const nameElement =
                card.querySelector("h3");

            const priceElement =
                card.querySelector(
                    ".product-bottom strong"
                );


            const name =
                nameElement
                    ? nameElement.textContent.trim()
                    : "Product";


            const price =
                priceElement
                    ? priceElement.textContent.trim()
                    : "";


            showQuickView(
                name,
                price
            );

        });

    });


    function showQuickView(name, price) {

        const existing =
            document.querySelector(".quick-view-modal");

        if (existing) {
            existing.remove();
        }


        const modal =
            document.createElement("div");

        modal.className =
            "quick-view-modal";


        modal.innerHTML = `

            <div class="quick-view-box">

                <button class="quick-view-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <div class="quick-view-image">
                    <i class="fa-solid fa-gem"></i>
                </div>

                <div class="quick-view-details">

                    <span>PREMIUM COLLECTION</span>

                    <h2>${name}</h2>

                    <div class="quick-rating">
                        ★★★★★
                    </div>

                    <strong>${price}</strong>

                    <p>
                        Premium quality product designed
                        for modern everyday style.
                    </p>

                    <button
                        class="quick-add"
                        data-product="${name}"
                        data-price="${price.replace("$", "")}">
                        Add to Cart
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(modal);


        /* Modal styles */

        const style =
            document.createElement("style");


        style.textContent = `

            .quick-view-modal {
                position: fixed;
                inset: 0;
                z-index: 5000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: rgba(0,0,0,.75);
            }

            .quick-view-box {
                position: relative;
                width: min(800px,100%);
                display: grid;
                grid-template-columns: 1fr 1fr;
                background: #fff;
                overflow: hidden;
            }

            .quick-view-close {
                position: absolute;
                top: 15px;
                right: 15px;
                z-index: 5;
                width: 38px;
                height: 38px;
                display: grid;
                place-items: center;
                background: #fff;
                color: #111;
                border-radius: 50%;
            }

            .quick-view-image {
                min-height: 420px;
                display: grid;
                place-items: center;
                background:
                    linear-gradient(
                        145deg,
                        #292722,
                        #c9a227
                    );
                color: rgba(255,255,255,.8);
                font-size: 80px;
            }

            .quick-view-details {
                padding: 55px 40px;
            }

            .quick-view-details > span {
                color: #a98518;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 2px;
            }

            .quick-view-details h2 {
                margin: 15px 0;
                color: #111;
                font-family: "Playfair Display",serif;
                font-size: 36px;
            }

            .quick-rating {
                margin-bottom: 15px;
                color: #c9a227;
            }

            .quick-view-details > strong {
                color: #111;
                font-size: 20px;
            }

            .quick-view-details p {
                margin: 20px 0 25px;
                color: #777;
                font-size: 13px;
                line-height: 1.7;
            }

            .quick-add {
                width: 100%;
                height: 50px;
                background: #111;
                color: #fff;
                font-weight: 700;
            }

            .quick-add:hover {
                background: #c9a227;
            }

            @media(max-width:600px) {

                .quick-view-box {
                    grid-template-columns: 1fr;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .quick-view-image {
                    min-height: 250px;
                }

                .quick-view-details {
                    padding: 30px 25px;
                }

                .quick-view-details h2 {
                    font-size: 28px;
                }

            }

        `;


        document.head.appendChild(style);


        /* Close modal */

        const close =
            modal.querySelector(
                ".quick-view-close"
            );


        close.addEventListener("click", () => {
            modal.remove();
            style.remove();
        });


        modal.addEventListener("click", event => {

            if (event.target === modal) {

                modal.remove();
                style.remove();

            }

        });


        /* Quick add */

        const quickAdd =
            modal.querySelector(".quick-add");


        quickAdd.addEventListener("click", () => {

            addToCart(
                quickAdd.dataset.product,
                quickAdd.dataset.price
            );

            modal.remove();
            style.remove();

        });

    }


    /* =====================================================
       7. SEARCH
    ===================================================== */

    const searchInput =
        document.querySelector(
            ".search-input input"
        );


    const searchSubmit =
        document.querySelector(
            ".search-input button"
        );


    function performSearch() {

        if (!searchInput) return;


        const query =
            searchInput.value.trim();


        if (!query) {

            showToast("Please enter a product name");

            return;

        }


        showToast(
            `Searching for "${query}"`
        );

    }


    if (searchSubmit) {

        searchSubmit.addEventListener(
            "click",
            performSearch
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    performSearch();

                }

            }
        );

    }


    /* =====================================================
       8. NEWSLETTER
    ===================================================== */

    const newsletterForm =
        document.querySelector(
            ".newsletter-form"
        );


    if (newsletterForm) {

        newsletterForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const input =
                    newsletterForm.querySelector(
                        "input"
                    );


                if (!input.value.trim()) {

                    showToast(
                        "Please enter your email"
                    );

                    return;

                }


                showToast(
                    "Thanks for joining LUXORA!"
                );


                input.value = "";

            }
        );

    }


    /* =====================================================
       9. TOAST
    ===================================================== */

    function showToast(message) {

        const toast =
            document.getElementById("toast");


        if (!toast) return;


        const text =
            toast.querySelector("span");


        if (text) {
            text.textContent = message;
        }


        toast.classList.add("show");


        clearTimeout(
            window.luxoraToastTimer
        );


        window.luxoraToastTimer =
            setTimeout(() => {

                toast.classList.remove("show");

            }, 2800);

    }


    /* =====================================================
       10. SMOOTH SCROLL
    ===================================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (target) {

                    event.preventDefault();


                    const header =
                        document.querySelector(
                            ".header"
                        );


                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;


                    const position =
                        target.offsetTop -
                        headerHeight;


                    window.scrollTo({
                        top: position,
                        behavior: "smooth"
                    });

                }

            }
        );

    });


    /* =====================================================
       11. ACTIVE NAVIGATION ON SCROLL
    ===================================================== */

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    window.addEventListener(
        "scroll",
        () => {

            const scrollPosition =
                window.scrollY +
                150;


            sections.forEach(section => {

                const top =
                    section.offsetTop;

                const height =
                    section.offsetHeight;

                const id =
                    section.getAttribute("id");


                if (
                    scrollPosition >= top &&
                    scrollPosition < top + height
                ) {

                    document
                        .querySelectorAll(
                            ".navbar a"
                        )
                        .forEach(link => {

                            link.classList.remove(
                                "active"
                            );

                        });


                    const activeLink =
                        document.querySelector(
                            `.navbar a[href="#${id}"]`
                        );


                    if (activeLink) {
                        activeLink.classList.add(
                            "active"
                        );
                    }

                }

            });

        },
        { passive: true }
    );


    /* =====================================================
       12. PREVENT DEMO LINKS FROM JUMPING
    ===================================================== */

    document.querySelectorAll(
        'a[href="#"]'
    ).forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();

            }
        );

    });

});