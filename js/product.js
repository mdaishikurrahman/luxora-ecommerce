/* =========================================================
   LUXORA — PRODUCT DETAILS JS
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       LOAD PRODUCT FROM API (by ?slug=... in the URL)
       Falls back to the static markup already in the page
       if there's no slug, or the backend isn't running.
    ===================================================== */

    async function loadProductFromAPI() {

        const params = new URLSearchParams(window.location.search);
        const slug = params.get("slug");

        if (!slug || typeof luxoraApiFetch !== "function") return;

        try {

            const { product: p } = await luxoraApiFetch(`/products/${slug}`);

            document.title = `${p.name} | LUXORA`;

            const categoryEl = document.querySelector(".product-detail-category");
            if (categoryEl) categoryEl.textContent = (p.categoryLabel || p.category || "").toUpperCase();

            const titleEl = document.querySelector(".product-info-panel h1");
            if (titleEl) titleEl.textContent = p.name;

            const starsEl = document.querySelector(".product-detail-rating .stars");
            if (starsEl) {
                const rounded = Math.round(p.rating || 0);
                starsEl.textContent = "★".repeat(rounded) + "☆".repeat(5 - rounded);
            }
            const reviewLink = document.querySelector(".product-detail-rating a");
            if (reviewLink) {
                reviewLink.innerHTML = `${(p.rating || 0).toFixed(1)} <span>(${p.reviewCount || 0} Reviews)</span>`;
            }

            const priceEl = document.querySelector(".product-detail-price strong");
            if (priceEl) priceEl.textContent = `$${p.price}`;
            const compareEl = document.querySelector(".product-detail-price del");
            if (compareEl) {
                if (p.compareAtPrice) {
                    compareEl.textContent = `$${p.compareAtPrice}`;
                    compareEl.style.display = "";
                } else {
                    compareEl.style.display = "none";
                }
            }

            const descEl = document.querySelector(".product-short-description");
            if (descEl && p.shortDescription) descEl.textContent = p.shortDescription;

            const mainImg = document.getElementById("mainProductImage");
            if (mainImg && p.images?.[0]) mainImg.src = p.images[0];

            // Give the Add to Cart / Buy Now buttons the real product id + slug so
            // the cart (and later the order) can reference the actual database record.
            const cartBtn = document.getElementById("addProductCart");
            const buyBtn = document.getElementById("buyNow");
            [cartBtn, buyBtn].forEach((btn) => {
                if (!btn) return;
                btn.dataset.id = p._id;
                btn.dataset.slug = p.slug;
                btn.dataset.image = p.images?.[0] || "";
            });

        } catch (err) {
            console.warn("LUXORA API unavailable, showing static product page:", err.message);
        }

    }

    await loadProductFromAPI();



    /* =====================================================
       PRODUCT IMAGE GALLERY
    ===================================================== */

    const mainImage = document.querySelector("#mainProductImage");
    const thumbnails = document.querySelectorAll(".thumbnail");

    thumbnails.forEach((thumbnail) => {

        thumbnail.addEventListener("click", () => {

            const image = thumbnail.querySelector("img");

            if (!image || !mainImage) return;

            mainImage.src = image.src;

            thumbnails.forEach((item) => {
                item.classList.remove("active");
            });

            thumbnail.classList.add("active");

        });

    });


    /* =====================================================
       IMAGE ZOOM
    ===================================================== */

    const zoomButton = document.querySelector(".image-zoom");

    if (zoomButton && mainImage) {

        zoomButton.addEventListener("click", () => {

            const imageSrc = mainImage.src;

            const overlay = document.createElement("div");

            overlay.className = "image-lightbox";

            overlay.innerHTML = `
                <button class="lightbox-close" aria-label="Close">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <img src="${imageSrc}" alt="Product Image">
            `;

            document.body.appendChild(overlay);

            document.body.style.overflow = "hidden";

            requestAnimationFrame(() => {
                overlay.classList.add("active");
            });

            const closeLightbox = () => {

                overlay.classList.remove("active");

                document.body.style.overflow = "";

                setTimeout(() => {
                    overlay.remove();
                }, 300);

            };

            overlay
                .querySelector(".lightbox-close")
                .addEventListener("click", closeLightbox);

            overlay.addEventListener("click", (event) => {

                if (event.target === overlay) {
                    closeLightbox();
                }

            });

        });

    }


    /* =====================================================
       COLOR SELECTOR
    ===================================================== */

    const colorOptions = document.querySelectorAll(".color-option");

    colorOptions.forEach((color) => {

        color.addEventListener("click", () => {

            colorOptions.forEach((item) => {
                item.classList.remove("active");
            });

            color.classList.add("active");

            const selectedColor =
                color.dataset.color ||
                color.getAttribute("aria-label") ||
                "Selected";

            showToast(`Color selected: ${selectedColor}`);

        });

    });


    /* =====================================================
       SIZE SELECTOR
    ===================================================== */

    const sizeButtons =
        document.querySelectorAll(".product-size-options button");

    sizeButtons.forEach((button) => {

        button.addEventListener("click", () => {

            sizeButtons.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

        });

    });


    /* =====================================================
       QUANTITY CONTROL
    ===================================================== */

    const quantityInput =
        document.querySelector("#productQuantity");

    const quantityMinus =
        document.querySelector("#quantityMinus");

    const quantityPlus =
        document.querySelector("#quantityPlus");


    if (quantityInput) {

        quantityInput.addEventListener("input", () => {

            let value = parseInt(quantityInput.value, 10);

            if (isNaN(value) || value < 1) {
                quantityInput.value = 1;
            }

            if (value > 99) {
                quantityInput.value = 99;
            }

        });

    }


    if (quantityMinus && quantityInput) {

        quantityMinus.addEventListener("click", () => {

            let quantity =
                parseInt(quantityInput.value, 10) || 1;

            if (quantity > 1) {
                quantity--;
            }

            quantityInput.value = quantity;

        });

    }


    if (quantityPlus && quantityInput) {

        quantityPlus.addEventListener("click", () => {

            let quantity =
                parseInt(quantityInput.value, 10) || 1;

            if (quantity < 99) {
                quantity++;
            }

            quantityInput.value = quantity;

        });

    }


    /* =====================================================
       WISHLIST
    ===================================================== */

    const wishlistButton =
        document.querySelector(".product-wishlist");

    if (wishlistButton) {

        wishlistButton.addEventListener("click", () => {

            wishlistButton.classList.toggle("active");

            const icon =
                wishlistButton.querySelector("i");

            const isActive =
                wishlistButton.classList.contains("active");

            if (icon) {

                icon.classList.toggle(
                    "fa-regular",
                    !isActive
                );

                icon.classList.toggle(
                    "fa-solid",
                    isActive
                );

            }

            showToast(
                isActive
                    ? "Added to wishlist"
                    : "Removed from wishlist"
            );

        });

    }


    /* =====================================================
       PRODUCT TABS
    ===================================================== */

    const productTabs =
        document.querySelectorAll(".product-tab");

    const tabContents =
        document.querySelectorAll(".tab-content");


    productTabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            const target =
                tab.dataset.tab;

            if (!target) return;

            productTabs.forEach((item) => {
                item.classList.remove("active");
            });

            tabContents.forEach((content) => {
                content.classList.remove("active");
            });

            tab.classList.add("active");

            const targetContent =
                document.querySelector(
                    `#${target}`
                );

            if (targetContent) {
                targetContent.classList.add("active");
            }

        });

    });


    /* =====================================================
       ADD TO CART
    ===================================================== */

    const addToCartButton =
        document.querySelector(".add-product-cart");

    if (addToCartButton) {

        addToCartButton.addEventListener("click", () => {

            const productName =
                document.querySelector(
                    ".product-info-panel h1"
                )?.textContent.trim() ||
                "Product";

            const priceText =
                document.querySelector(
                    ".product-detail-price strong"
                )?.textContent.trim() ||
                "$0";

            const price =
                parseFloat(
                    priceText.replace(/[^0-9.]/g, "")
                ) || 0;

            const quantity =
                parseInt(
                    quantityInput?.value,
                    10
                ) || 1;

            const selectedSize =
                document.querySelector(
                    ".product-size-options button.active"
                )?.textContent.trim() ||
                "Default";

            const selectedColor =
                document.querySelector(
                    ".color-option.active"
                )?.dataset.color ||
                "Default";

            const productIdEl =
                document.getElementById("addProductCart");


            const product = {
                name: productName,
                price: price,
                quantity: quantity,
                size: selectedSize,
                color: selectedColor,
                image: mainImage?.src || "",
                productId: productIdEl?.dataset.id || null
            };


            let cart =
                JSON.parse(
                    localStorage.getItem("luxoraCart")
                ) || [];


            cart.push(product);


            localStorage.setItem(
                "luxoraCart",
                JSON.stringify(cart)
            );


            updateCartCount();

            showToast(
                `${productName} added to cart`
            );

        });

    }


    /* =====================================================
       BUY NOW
    ===================================================== */

    const buyNowButton =
        document.querySelector(".buy-now-btn");

    if (buyNowButton) {

        buyNowButton.addEventListener("click", () => {

            const productName =
                document.querySelector(
                    ".product-info-panel h1"
                )?.textContent.trim() ||
                "Product";

            const priceText =
                document.querySelector(
                    ".product-detail-price strong"
                )?.textContent.trim() ||
                "$0";

            const price =
                parseFloat(
                    priceText.replace(/[^0-9.]/g, "")
                ) || 0;

            const quantity =
                parseInt(
                    quantityInput?.value,
                    10
                ) || 1;

            const productIdEl =
                document.getElementById("addProductCart");

            let cart =
                JSON.parse(
                    localStorage.getItem("luxoraCart")
                ) || [];

            const existing =
                cart.find(item => item.name === productName);

            if (existing) {
                existing.quantity = Number(existing.quantity || 1) + quantity;
            } else {
                cart.push({
                    name: productName,
                    price: price,
                    quantity: quantity,
                    image: mainImage?.src || "",
                    productId: productIdEl?.dataset.id || null
                });
            }

            localStorage.setItem(
                "luxoraCart",
                JSON.stringify(cart)
            );

            showToast(
                `${productName} is ready for checkout`
            );

            setTimeout(() => {
                window.location.href = "checkout.html";
            }, 700);

        });

    }


    /* =====================================================
       RELATED PRODUCT CLICK
    ===================================================== */

    const relatedCards =
        document.querySelectorAll(".related-card");

    relatedCards.forEach((card) => {

        card.addEventListener("click", () => {

            const link =
                card.dataset.link;

            if (link) {
                window.location.href = link;
            }

        });

    });


    /* =====================================================
       CART COUNT
    ===================================================== */

    function updateCartCount() {

        const cart =
            JSON.parse(
                localStorage.getItem("luxoraCart")
            ) || [];

        const totalQuantity =
            cart.reduce(
                (total, item) =>
                    total + (item.quantity || 1),
                0
            );


        const cartCount =
            document.querySelector(
                ".cart-count"
            );

        if (cartCount) {

            cartCount.textContent =
                totalQuantity;

            cartCount.classList.toggle(
                "show",
                totalQuantity > 0
            );

        }

    }


    /* =====================================================
       TOAST MESSAGE
    ===================================================== */

    function showToast(message) {

        let toast =
            document.querySelector(".toast");


        if (!toast) {

            toast =
                document.createElement("div");

            toast.className = "toast";

            toast.innerHTML = `
                <i class="fa-solid fa-check"></i>
                <span></span>
            `;

            document.body.appendChild(toast);

        }


        const toastText =
            toast.querySelector("span");

        if (toastText) {
            toastText.textContent = message;
        }


        toast.classList.add("show");


        clearTimeout(
            toast.hideTimer
        );


        toast.hideTimer =
            setTimeout(() => {

                toast.classList.remove("show");

            }, 2500);

    }


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            const lightbox =
                document.querySelector(
                    ".image-lightbox"
                );

            if (lightbox) {

                lightbox.classList.remove(
                    "active"
                );

                document.body.style.overflow = "";

                setTimeout(() => {
                    lightbox.remove();
                }, 300);

            }

        }

    });


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateCartCount();

});