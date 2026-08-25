/* =========================================================
   LUXORA — CHECKOUT JS
   Cart / Delivery / Coupon / Payment / Validation
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const checkoutForm = document.getElementById("checkoutForm");

    const subtotalEl = document.getElementById("checkoutSubtotal");
    const shippingEl = document.getElementById("checkoutShipping");
    const discountEl = document.getElementById("checkoutDiscount");
    const totalEl = document.getElementById("checkoutTotal");

    const checkoutProducts = document.getElementById("checkoutProducts");

    const couponForm = document.getElementById("couponForm");
    const couponInput = document.getElementById("couponInput");
    const couponMessage = document.getElementById("couponMessage");

    const orderModal = document.getElementById("orderModal");
    const modalClose = document.querySelector(".modal-close");
    const modalOverlay = document.querySelector(".order-modal-overlay");

    const orderNumberEl = document.getElementById("orderNumber");

    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");


    /* =====================================================
       CART
    ===================================================== */

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("luxoraCart")) || [];
    } catch (error) {
        cart = [];
    }


    /* =====================================================
       FALLBACK CART KEY
       If your cart.js uses "cart"
    ===================================================== */

    if (!cart.length) {
        try {
            cart = JSON.parse(localStorage.getItem("cart")) || [];
        } catch (error) {
            cart = [];
        }
    }


    /* =====================================================
       SETTINGS
    ===================================================== */

    const FREE_SHIPPING_LIMIT = 150;

    const STANDARD_SHIPPING = 12;

    const EXPRESS_SHIPPING = 25;

    let currentShipping = STANDARD_SHIPPING;

    let currentDiscount = 0;

    let appliedCoupon = "";


    /* =====================================================
       HELPER
    ===================================================== */

    function money(value) {
        return `$${Number(value).toFixed(2)}`;
    }


    function getProductPrice(product) {

        return Number(
            product.price ||
            product.salePrice ||
            product.amount ||
            0
        );

    }


    function getProductQuantity(product) {

        return Number(
            product.quantity ||
            product.qty ||
            1
        );

    }


    function getProductName(product) {

        return (
            product.name ||
            product.title ||
            "Luxury Product"
        );

    }


    function getProductImage(product) {

        return (
            product.image ||
            product.img ||
            "images/products/01-luxury-watch.jpg"
        );

    }


    /* =====================================================
       CALCULATE SUBTOTAL
    ===================================================== */

    function calculateSubtotal() {

        return cart.reduce((total, product) => {

            const price = getProductPrice(product);

            const quantity = getProductQuantity(product);

            return total + (price * quantity);

        }, 0);

    }


    /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

    function renderCheckoutProducts() {

        if (!checkoutProducts) return;

        if (!cart.length) {

            checkoutProducts.innerHTML = `
                <div class="empty-checkout">
                    <p>Your cart is empty.</p>

                    <a href="shop.html" class="back-to-cart">
                        Continue Shopping
                    </a>
                </div>
            `;

            return;
        }


        checkoutProducts.innerHTML = cart.map(product => {

            const name = getProductName(product);

            const image = getProductImage(product);

            const price = getProductPrice(product);

            const quantity = getProductQuantity(product);

            return `
                <div class="checkout-product">

                    <div class="checkout-product-image">

                        <img 
                            src="${image}" 
                            alt="${name}"
                            onerror="this.src='images/products/01-luxury-watch.jpg'"
                        >

                        <span class="checkout-product-qty">
                            ${quantity}
                        </span>

                    </div>


                    <div class="checkout-product-info">

                        <h3>${name}</h3>

                        <span>
                            ${quantity} × ${money(price)}
                        </span>

                    </div>


                    <strong>
                        ${money(price * quantity)}
                    </strong>

                </div>
            `;

        }).join("");
    }


    /* =====================================================
       UPDATE SUMMARY
    ===================================================== */

    function updateSummary() {

        const subtotal = calculateSubtotal();

        let shipping = currentShipping;


        /* Free shipping */

        if (
            subtotal >= FREE_SHIPPING_LIMIT &&
            currentShipping === STANDARD_SHIPPING
        ) {
            shipping = 0;
        }


        const total = Math.max(
            0,
            subtotal + shipping - currentDiscount
        );


        if (subtotalEl) {
            subtotalEl.textContent = money(subtotal);
        }


        if (shippingEl) {

            shippingEl.textContent =
                shipping === 0
                    ? "FREE"
                    : money(shipping);

        }


        if (discountEl) {

            discountEl.textContent =
                currentDiscount > 0
                    ? `-${money(currentDiscount)}`
                    : "$0.00";

        }


        if (totalEl) {
            totalEl.textContent = money(total);
        }

    }


    /* =====================================================
       DELIVERY OPTIONS
    ===================================================== */

    const deliveryOptions =
        document.querySelectorAll(".delivery-option");


    deliveryOptions.forEach(option => {

        option.addEventListener("click", () => {

            deliveryOptions.forEach(item => {
                item.classList.remove("active");
            });

            option.classList.add("active");


            const radio =
                option.querySelector("input[type='radio']");

            if (radio) {
                radio.checked = true;
            }


            const deliveryType =
                option.dataset.delivery ||
                option.dataset.type ||
                radio?.value ||
                "standard";


            if (
                deliveryType === "express" ||
                deliveryType === "Express"
            ) {

                currentShipping = EXPRESS_SHIPPING;

            } else {

                currentShipping = STANDARD_SHIPPING;

            }


            updateSummary();

        });

    });


    /* =====================================================
       PAYMENT OPTIONS
    ===================================================== */

    const paymentOptions =
        document.querySelectorAll(".payment-option");


    paymentOptions.forEach(option => {

        option.addEventListener("click", () => {

            paymentOptions.forEach(item => {
                item.classList.remove("active");
            });

            option.classList.add("active");


            const radio =
                option.querySelector("input[type='radio']");

            if (radio) {
                radio.checked = true;
            }


            /* Card fields */

            const cardFields =
                document.querySelector(".card-payment-fields");


            const paymentType =
                option.dataset.payment ||
                option.dataset.type ||
                radio?.value ||
                "";


            if (cardFields) {

                if (
                    paymentType.toLowerCase() === "card" ||
                    paymentType.toLowerCase() === "credit-card"
                ) {

                    cardFields.style.display = "block";

                } else {

                    cardFields.style.display = "none";

                }

            }

        });

    });


    /* =====================================================
       COUPON
    ===================================================== */

    if (couponForm) {

        couponForm.addEventListener("submit", async event => {

            event.preventDefault();


            const code =
                couponInput?.value
                    .trim()
                    .toUpperCase();


            if (!code) {

                showToast("Please enter a coupon code.");

                return;
            }


            const subtotal = calculateSubtotal();

            let discountRate = 0;
            let valid = false;

            /*
                Try the real API first (checks the Coupon collection
                the admin panel manages). Falls back to the hardcoded
                demo codes below if the backend isn't running.
            */

            try {

                const data = await luxoraApiFetch("/coupons/validate", {
                    method: "POST",
                    body: JSON.stringify({ code }),
                });

                if (data.valid) {
                    discountRate = data.discountPercent / 100;
                    valid = true;
                }

            } catch (err) {

                /*
                    Demo premium store coupons (offline fallback)

                    LUXORA10 = 10%
                    WELCOME15 = 15%
                    VIP20 = 20%
                */

                if (code === "LUXORA10") {
                    discountRate = 0.10;
                    valid = true;
                } else if (code === "WELCOME15") {
                    discountRate = 0.15;
                    valid = true;
                } else if (code === "VIP20") {
                    discountRate = 0.20;
                    valid = true;
                }

            }


            if (!valid) {

                currentDiscount = 0;
                appliedCoupon = "";

                if (couponMessage) {

                    couponMessage.textContent =
                        "Invalid coupon code.";

                    couponMessage.style.color =
                        "#b85c5c";

                }

                showToast("Invalid coupon code.");

                updateSummary();

                return;
            }


            currentDiscount =
                subtotal * discountRate;

            appliedCoupon = code;


            if (couponMessage) {

                couponMessage.textContent =
                    `${code} applied successfully.`;

                couponMessage.style.color =
                    "#6d835c";

            }


            showToast("Coupon applied successfully.");

            updateSummary();

        });

    }


    /* =====================================================
       FORM VALIDATION
    ===================================================== */

    function validateField(field) {

        const value = field.value.trim();

        const group =
            field.closest(".form-group");


        if (!group) return true;


        const required =
            field.hasAttribute("required");


        if (required && !value) {

            group.classList.add("error");

            addError(group, "This field is required.");

            return false;
        }


        /* Email */

        if (
            field.type === "email" &&
            value
        ) {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(value)) {

                group.classList.add("error");

                addError(
                    group,
                    "Please enter a valid email."
                );

                return false;
            }

        }


        /* Phone */

        if (
            field.name === "phone" &&
            value
        ) {

            const phonePattern =
                /^[0-9+\-\s()]{7,20}$/;


            if (!phonePattern.test(value)) {

                group.classList.add("error");

                addError(
                    group,
                    "Please enter a valid phone number."
                );

                return false;
            }

        }


        group.classList.remove("error");

        group.classList.add("success");

        removeError(group);

        return true;

    }


    function addError(group, message) {

        let error =
            group.querySelector(".form-error");


        if (!error) {

            error =
                document.createElement("small");

            error.className = "form-error";

            group.appendChild(error);

        }


        error.textContent = message;

    }


    function removeError(group) {

        const error =
            group.querySelector(".form-error");


        if (error) {
            error.remove();
        }

    }


    /* =====================================================
       LIVE VALIDATION
    ===================================================== */

    if (checkoutForm) {

        const fields =
            checkoutForm.querySelectorAll(
                "input[required], select[required], textarea[required]"
            );


        fields.forEach(field => {

            field.addEventListener("blur", () => {

                validateField(field);

            });


            field.addEventListener("input", () => {

                const group =
                    field.closest(".form-group");


                if (group) {

                    group.classList.remove("error");

                    removeError(group);

                }

            });

        });

    }


    /* =====================================================
       CARD NUMBER FORMAT
    ===================================================== */

    const cardNumber =
        document.querySelector("#cardNumber");


    if (cardNumber) {

        cardNumber.addEventListener("input", event => {

            let value =
                event.target.value
                    .replace(/\D/g, "")
                    .substring(0, 16);


            value =
                value.match(/.{1,4}/g)?.join(" ")
                || "";


            event.target.value = value;

        });

    }


    /* =====================================================
       EXPIRY FORMAT
    ===================================================== */

    const expiry =
        document.querySelector("#cardExpiry");


    if (expiry) {

        expiry.addEventListener("input", event => {

            let value =
                event.target.value
                    .replace(/\D/g, "")
                    .substring(0, 4);


            if (value.length >= 3) {

                value =
                    value.substring(0, 2)
                    + "/"
                    + value.substring(2);

            }


            event.target.value = value;

        });

    }


    /* =====================================================
       CVV
    ===================================================== */

    const cvv =
        document.querySelector("#cardCvv");


    if (cvv) {

        cvv.addEventListener("input", event => {

            event.target.value =
                event.target.value
                    .replace(/\D/g, "")
                    .substring(0, 4);

        });

    }


    /* =====================================================
       PLACE ORDER
    ===================================================== */

    if (checkoutForm) {

        checkoutForm.addEventListener("submit", async event => {

            event.preventDefault();


            if (!cart.length) {

                showToast(
                    "Your cart is empty."
                );

                return;
            }


            const fields =
                checkoutForm.querySelectorAll(
                    "input[required], select[required], textarea[required]"
                );


            let valid = true;


            fields.forEach(field => {

                if (!validateField(field)) {
                    valid = false;
                }

            });


            if (!valid) {

                showToast(
                    "Please complete all required fields."
                );

                const firstError =
                    checkoutForm.querySelector(
                        ".form-group.error"
                    );


                if (firstError) {

                    firstError.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }

                return;
            }


            /* Loading */

            const submitButton =
                checkoutForm.querySelector(
                    ".place-order-btn"
                );


            if (submitButton) {

                submitButton.classList.add("loading");

                submitButton.innerHTML = `
                    <i class="fa-solid fa-spinner"></i>
                    Processing Order...
                `;

            }


            await createOrder();

        });

    }


    /* =====================================================
       CREATE ORDER
    ===================================================== */

    async function createOrder() {

        const subtotal =
            calculateSubtotal();


        const deliveryMethod =
            document.querySelector('input[name="delivery"]:checked')?.value ||
            "standard";

        const paymentMethod =
            document.querySelector('input[name="payment"]:checked')?.value ||
            "card";


        const shipping =
            subtotal >= FREE_SHIPPING_LIMIT &&
            currentShipping === STANDARD_SHIPPING
                ? 0
                : currentShipping;


        const total =
            Math.max(
                0,
                subtotal +
                shipping -
                currentDiscount
            );


        const customerData =
            getCustomerData();


        const submitButton =
            checkoutForm?.querySelector(
                ".place-order-btn"
            );


        function resetButton() {

            if (submitButton) {

                submitButton.classList.remove("loading");

                submitButton.innerHTML = `
                    <i class="fa-solid fa-lock"></i>
                    Place Order
                `;

            }

        }


        function finishOrder(orderNumber) {

            localStorage.setItem(
                "luxoraLastOrder",
                JSON.stringify({
                    id: orderNumber,
                    date: new Date().toISOString(),
                    items: cart,
                    subtotal,
                    shipping,
                    discount: currentDiscount,
                    total,
                    coupon: appliedCoupon,
                    customer: customerData
                })
            );

            localStorage.removeItem("luxoraCart");
            localStorage.removeItem("cart");

            resetButton();

            if (orderNumberEl) {
                orderNumberEl.textContent = orderNumber;
            }

            openOrderModal();

            showToast(
                "Your order has been placed successfully."
            );

        }


        /* =================================================
           Try the real API first — this is what actually
           saves the order to the database and makes it show
           up in the admin panel / decrements stock. Falls
           back to a local-only order if the backend isn't
           running, so checkout still works during preview.
        ================================================= */

        try {

            const payload = {
                customer: {
                    firstName: customerData.firstName || "",
                    lastName: customerData.lastName || "",
                    email: customerData.email || "",
                    phone: customerData.phone || ""
                },
                shippingAddress: {
                    address: customerData.address || "",
                    apartment: customerData.apartment || "",
                    city: customerData.city || "",
                    state: customerData.state || "",
                    zip: customerData.zip || "",
                    country: customerData.country || ""
                },
                items: cart.map(item => ({
                    product: item.productId || undefined,
                    name: getProductName(item),
                    image: getProductImage(item),
                    price: getProductPrice(item),
                    qty: getProductQuantity(item)
                })),
                delivery: { method: deliveryMethod },
                payment: { method: paymentMethod },
                couponCode: appliedCoupon || "",
                notes: customerData.orderNotes || ""
            };

            const { order } = await luxoraApiFetch("/orders", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            finishOrder(order.orderNumber);

        } catch (err) {

            console.warn("LUXORA API unavailable, placing a local-only order:", err.message);

            const orderNumber =
                "LX-" +
                Date.now()
                    .toString()
                    .slice(-8);

            finishOrder(orderNumber);

        }

    }


    /* =====================================================
       CUSTOMER DATA
    ===================================================== */

    function getCustomerData() {

        if (!checkoutForm) return {};


        const formData =
            new FormData(checkoutForm);


        const customer = {};


        formData.forEach((value, key) => {

            customer[key] = value;

        });


        return customer;

    }


    /* =====================================================
       MODAL
    ===================================================== */

    function openOrderModal() {

        if (!orderModal) return;

        orderModal.hidden = false;

        document.body.style.overflow =
            "hidden";

    }


    function closeOrderModal() {

        if (!orderModal) return;

        orderModal.hidden = true;

        document.body.style.overflow =
            "";

    }


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeOrderModal
        );

    }


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeOrderModal
        );

    }


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                orderModal &&
                !orderModal.hidden
            ) {

                closeOrderModal();

            }

        }
    );


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer;


    function showToast(message) {

        if (!toast) return;


        if (toastMessage) {

            toastMessage.textContent =
                message;

        }


        toast.classList.add("show");


        clearTimeout(toastTimer);


        toastTimer =
            setTimeout(() => {

                toast.classList.remove("show");

            }, 3000);

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    renderCheckoutProducts();

    updateSummary();


    /* =====================================================
       DEFAULT DELIVERY
    ===================================================== */

    const defaultDelivery =
        document.querySelector(
            ".delivery-option.active"
        );


    if (defaultDelivery) {

        const radio =
            defaultDelivery.querySelector(
                "input[type='radio']"
            );


        const type =
            defaultDelivery.dataset.delivery ||
            defaultDelivery.dataset.type ||
            radio?.value ||
            "standard";


        if (
            type.toLowerCase() === "express"
        ) {

            currentShipping =
                EXPRESS_SHIPPING;

        } else {

            currentShipping =
                STANDARD_SHIPPING;

        }

        updateSummary();

    }


    /* =====================================================
       DEFAULT PAYMENT
    ===================================================== */

    const defaultPayment =
        document.querySelector(
            ".payment-option.active"
        );


    if (defaultPayment) {

        defaultPayment.click();

    }

});