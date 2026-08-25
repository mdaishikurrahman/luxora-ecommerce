/* =========================================================
   LUXORA — CART JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const cartItems = document.querySelector("#cartItems");
    const emptyCart = document.querySelector("#emptyCart");

    const subtotalEl = document.querySelector("#cartSubtotal");
    const discountEl = document.querySelector("#cartDiscount");
    const shippingEl = document.querySelector("#cartShipping");
    const totalEl = document.querySelector("#cartTotal");

    const couponForm = document.querySelector("#couponForm");
    const couponInput = document.querySelector("#couponInput");
    const couponMessage = document.querySelector("#couponMessage");

    const cartCount = document.querySelectorAll(".cart-count");

    let discount = 0;

    /* =====================================================
       HELPERS
    ===================================================== */

    function formatPrice(value) {
        return "$" + Number(value).toFixed(2);
    }

    function getNumber(value) {
        return parseFloat(
            String(value)
                .replace("$", "")
                .replace(",", "")
                .trim()
        ) || 0;
    }

    function showToast(message, icon = "fa-check") {

        let toast = document.querySelector("#cartToast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "cartToast";
            toast.className = "toast";

            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;

        toast.classList.add("show");

        clearTimeout(window.cartToastTimer);

        window.cartToastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }


    /* =====================================================
       RENDER CART FROM localStorage
       (the storefront's shop/product pages save added items
       to localStorage.luxoraCart — this builds the actual
       .cart-item elements from that data)
    ===================================================== */

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function renderCartFromStorage() {

        if (!cartItems) return;

        let storedCart = [];

        try {
            storedCart = JSON.parse(localStorage.getItem("luxoraCart")) || [];
        } catch (error) {
            storedCart = [];
        }

        if (!storedCart.length) {
            cartItems.innerHTML = "";
            return;
        }

        cartItems.innerHTML = storedCart.map((item, index) => {

            const name = escapeHtml(item.name || "Product");
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            const image = item.image || "images/products/01-luxury-watch.jpg";
            const productId = item.productId || "";
            const meta = [item.size, item.color].filter(Boolean).join(" / ");

            return `
            <article class="cart-item" data-product-id="${productId}" data-cart-index="${index}" data-price="${price}">

                <div class="cart-product-image">
                    <img src="${image}" alt="${name}" onerror="this.src='images/products/01-luxury-watch.jpg'">
                </div>

                <div class="cart-product-info">
                    <span>${escapeHtml((item.category || "").toUpperCase())}</span>
                    <h3>${name}</h3>
                    ${meta ? `<p>${escapeHtml(meta)}</p>` : ""}
                    <button class="save-item" type="button">
                        <i class="fa-regular fa-heart"></i>
                        Save for later
                    </button>
                </div>

                <div class="cart-item-price">
                    <strong>$${price.toFixed(2)}</strong>
                </div>

                <div class="cart-quantity">
                    <button type="button" class="quantity-decrease" aria-label="Decrease quantity">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <input type="number" value="${quantity}" min="1" max="99" aria-label="Quantity" class="quantity-input">
                    <button type="button" class="quantity-increase" aria-label="Increase quantity">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <div class="cart-item-total">
                    <strong>$${(price * quantity).toFixed(2)}</strong>
                </div>

                <button class="remove-item" type="button" aria-label="Remove ${name}">
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </article>`;

        }).join("");

    }


    /* =====================================================
       SYNC CURRENT .cart-item DOM STATE BACK TO localStorage
       (called after any quantity change or removal so the
       cart stays correct if the user reloads or navigates)
    ===================================================== */

    function syncCartToStorage() {

        const items = document.querySelectorAll(".cart-item");

        const cart = Array.from(items).map(item => {

            const name = item.querySelector(".cart-product-info h3")?.textContent.trim() || "Product";
            const image = item.querySelector(".cart-product-image img")?.getAttribute("src") || "";
            const quantity = parseInt(item.querySelector(".quantity-input")?.value, 10) || 1;
            const price = getNumber(item.dataset.price);
            const productId = item.dataset.productId || null;

            return { name, price, quantity, image, productId };

        });

        localStorage.setItem("luxoraCart", JSON.stringify(cart));

    }


    renderCartFromStorage();



    function updateCart() {

        const items = document.querySelectorAll(".cart-item");

        let subtotal = 0;
        let totalQuantity = 0;

        items.forEach(item => {

            const priceElement = item.querySelector(".cart-item-price strong");
            const quantityInput = item.querySelector(".quantity-input");
            const totalElement = item.querySelector(".cart-item-total strong");

            if (!priceElement || !quantityInput || !totalElement) {
                return;
            }

            const price = getNumber(priceElement.textContent);

            let quantity = parseInt(quantityInput.value);

            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
                quantityInput.value = 1;
            }

            const itemTotal = price * quantity;

            totalElement.textContent = formatPrice(itemTotal);

            subtotal += itemTotal;
            totalQuantity += quantity;
        });


        /* ================================================
           SHIPPING
        ================================================ */

        let shipping = 0;

        if (subtotal > 0 && subtotal < 150) {
            shipping = 15;
        }

        if (subtotal >= 150) {
            shipping = 0;
        }


        /* ================================================
           DISCOUNT
        ================================================ */

        const discountAmount = subtotal * discount;


        /* ================================================
           FINAL TOTAL
        ================================================ */

        const finalTotal =
            subtotal -
            discountAmount +
            shipping;


        if (subtotalEl) {
            subtotalEl.textContent = formatPrice(subtotal);
        }

        if (discountEl) {
            discountEl.textContent = "-" + formatPrice(discountAmount);
        }

        if (shippingEl) {

            if (shipping === 0 && subtotal > 0) {
                shippingEl.textContent = "FREE";
            } else {
                shippingEl.textContent = formatPrice(shipping);
            }

        }

        if (totalEl) {
            totalEl.textContent = formatPrice(finalTotal);
        }


        /* ================================================
           CART COUNT
        ================================================ */

        cartCount.forEach(element => {
            element.textContent = totalQuantity;
        });


        /* ================================================
           EMPTY CART
        ================================================ */

        if (emptyCart) {

            if (items.length === 0) {
                emptyCart.hidden = false;
            } else {
                emptyCart.hidden = true;
            }

        }


        /* ================================================
           CART ITEMS VISIBILITY
        ================================================ */

        if (cartItems) {

            if (items.length === 0) {
                cartItems.style.display = "none";
            } else {
                cartItems.style.display = "";
            }

        }

    }


    /* =====================================================
       QUANTITY BUTTONS
    ===================================================== */

    document.addEventListener("click", event => {

        const increaseButton =
            event.target.closest(".quantity-increase");

        const decreaseButton =
            event.target.closest(".quantity-decrease");


        /* Increase */

        if (increaseButton) {

            const quantityBox =
                increaseButton.closest(".cart-quantity");

            if (!quantityBox) return;

            const input =
                quantityBox.querySelector(".quantity-input");

            if (!input) return;

            let quantity = parseInt(input.value) || 1;

            quantity++;

            input.value = quantity;

            updateCart();
            syncCartToStorage();

            showToast("Quantity updated", "fa-cart-shopping");
        }


        /* Decrease */

        if (decreaseButton) {

            const quantityBox =
                decreaseButton.closest(".cart-quantity");

            if (!quantityBox) return;

            const input =
                quantityBox.querySelector(".quantity-input");

            if (!input) return;

            let quantity = parseInt(input.value) || 1;

            if (quantity > 1) {
                quantity--;
                input.value = quantity;

                updateCart();
                syncCartToStorage();

                showToast(
                    "Quantity updated",
                    "fa-cart-shopping"
                );
            }

        }

    });


    /* =====================================================
       MANUAL QUANTITY CHANGE
    ===================================================== */

    document.addEventListener("change", event => {

        if (!event.target.classList.contains("quantity-input")) {
            return;
        }

        let quantity = parseInt(event.target.value);

        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
        }

        if (quantity > 99) {
            quantity = 99;
        }

        event.target.value = quantity;

        updateCart();
        syncCartToStorage();

    });


    /* =====================================================
       REMOVE ITEM
    ===================================================== */

    document.addEventListener("click", event => {

        const removeButton =
            event.target.closest(".remove-item");

        if (!removeButton) return;

        const cartItem =
            removeButton.closest(".cart-item");

        if (!cartItem) return;


        cartItem.style.opacity = "0";
        cartItem.style.transform = "translateX(20px)";

        cartItem.style.transition =
            "opacity .3s ease, transform .3s ease";


        setTimeout(() => {

            cartItem.remove();

            updateCart();
            syncCartToStorage();

            showToast(
                "Product removed from cart",
                "fa-trash"
            );

        }, 300);

    });


    /* =====================================================
       SAVE ITEM
    ===================================================== */

    document.addEventListener("click", event => {

        const saveButton =
            event.target.closest(".save-item");

        if (!saveButton) return;

        const icon =
            saveButton.querySelector("i");

        if (
            icon &&
            icon.classList.contains("fa-regular")
        ) {

            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");

            saveButton.innerHTML = `
                <i class="fa-solid fa-heart"></i>
                Saved
            `;

            showToast(
                "Product saved to wishlist",
                "fa-heart"
            );

        } else {

            saveButton.innerHTML = `
                <i class="fa-regular fa-heart"></i>
                Save for later
            `;

            showToast(
                "Removed from wishlist",
                "fa-heart"
            );

        }

    });


    /* =====================================================
       COUPON
    ===================================================== */

    if (couponForm) {

        couponForm.addEventListener("submit", event => {

            event.preventDefault();

            const code =
                couponInput
                    ? couponInput.value
                        .trim()
                        .toUpperCase()
                    : "";


            /* No coupon */

            if (!code) {

                if (couponMessage) {
                    couponMessage.textContent =
                        "Please enter a coupon code.";
                }

                return;
            }


            /* LUXORA10 */

            if (code === "LUXORA10") {

                discount = 0.10;

                if (couponMessage) {
                    couponMessage.textContent =
                        "10% discount applied successfully.";
                }

                showToast(
                    "10% discount applied",
                    "fa-tag"
                );

                updateCart();

                return;
            }


            /* LUXORA15 */

            if (code === "LUXORA15") {

                discount = 0.15;

                if (couponMessage) {
                    couponMessage.textContent =
                        "15% discount applied successfully.";
                }

                showToast(
                    "15% discount applied",
                    "fa-tag"
                );

                updateCart();

                return;
            }


            /* Invalid coupon */

            discount = 0;

            if (couponMessage) {
                couponMessage.textContent =
                    "Invalid coupon code.";
            }

            showToast(
                "Invalid coupon code",
                "fa-circle-exclamation"
            );

            updateCart();

        });

    }


    /* =====================================================
       CHECKOUT
    ===================================================== */

    const checkoutButton =
        document.querySelector(".checkout-btn");

    if (checkoutButton) {

        checkoutButton.addEventListener("click", event => {

            const items =
                document.querySelectorAll(".cart-item");

            if (items.length === 0) {

                event.preventDefault();

                showToast(
                    "Your cart is empty",
                    "fa-cart-shopping"
                );

                return;
            }

            /* Allow checkout.html navigation */

        });

    }


    /* =====================================================
       INITIAL UPDATE
    ===================================================== */

    updateCart();

});