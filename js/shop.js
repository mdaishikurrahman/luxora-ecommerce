/* =========================================================
   LUXORA — SHOP PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       LOAD PRODUCTS FROM API (falls back to the static
       cards already in the HTML if the backend isn't running)
    ===================================================== */

    async function loadProductsFromAPI() {

        const grid = document.getElementById("shopProductGrid");

        if (!grid || typeof luxoraApiFetch !== "function") return;

        try {

            const data = await luxoraApiFetch("/products?limit=60");

            if (!data.items || !data.items.length) return;

            grid.innerHTML = data.items.map((p, index) => {

                const image = p.images?.[0] || "images/products/01-luxury-watch.jpg";
                const stars = "★".repeat(Math.round(p.rating || 0)) + "☆".repeat(5 - Math.round(p.rating || 0));
                const badgeHtml = p.badge
                    ? `<span class="product-badge sale absolute top-3.5 left-3.5 z-[3] px-2.5 py-1.5 bg-gold-dark text-white text-[8px] font-bold tracking-[1px]">${p.badge}</span>`
                    : "";

                return `
                <article class="shop-product-card group relative" data-category="${p.category}" data-date="${data.items.length - index}" data-price="${p.price}" data-rating="${p.rating || 0}" data-id="${p._id}" data-slug="${p.slug}">
                    <div class="shop-product-image relative h-[390px] flex items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#f3f0e9,#ddd8cd)]">
                        <a href="product.html?slug=${p.slug}">
                            <img alt="${p.name}" class="product-photo w-full h-full object-cover" loading="lazy" src="${image}"/>
                        </a>
                        ${badgeHtml}
                        <button class="wishlist-btn absolute top-3 right-3 z-[4] w-9 h-9 grid place-items-center rounded-full bg-white/90 text-[#222] transition-all duration-300 hover:bg-ink hover:text-white hover:scale-105" aria-label="Add to wishlist">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                        <a href="product.html?slug=${p.slug}" class="quick-view absolute left-3 right-3 bottom-3 z-[3] h-[42px] bg-ink/90 text-white text-[10px] font-bold tracking-[1px] uppercase opacity-0 translate-y-2.5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-gold-dark grid place-items-center">Quick View</a>
                    </div>
                    <div class="product-info pt-4">
                        <span class="product-category block mb-2 text-[#aaa] text-[8px] font-bold tracking-[1.3px]">${(p.categoryLabel || p.category || "").toUpperCase()}</span>
                        <h3 class="mb-2 text-ink font-heading text-[19px] font-semibold leading-[1.3]"><a href="product.html?slug=${p.slug}" class="hover:text-gold-dark transition">${p.name}</a></h3>
                        <div class="rating mb-3 text-gold-dark text-[10px] tracking-[1px]">${stars}<span class="ml-1 text-[#999] text-[9px] tracking-normal">(${p.reviewCount || 0})</span></div>
                        <div class="product-bottom flex items-center justify-between gap-2.5">
                            <strong class="text-ink text-[15px] font-bold">$${p.price}</strong>
                            <button class="add-cart relative text-ink text-[9px] font-bold tracking-[0.8px] uppercase hover:text-gold-dark transition after:content-[''] after:block after:w-0 after:h-px after:mt-1 after:bg-gold-dark after:transition-all hover:after:w-full" data-id="${p._id}" data-slug="${p.slug}" data-image="${image}" data-price="${p.price}" data-product="${p.name}">Add to Cart</button>
                        </div>
                    </div>
                </article>`;

            }).join("");

        } catch (err) {
            // API not reachable — keep the static fallback cards already in the HTML.
            console.warn("LUXORA API unavailable, showing static product list:", err.message);
        }

    }

    await loadProductsFromAPI();



    /* =====================================================
       ELEMENTS
    ===================================================== */

    const productGrid =
        document.getElementById("shopProductGrid");

    const products = productGrid
        ? Array.from(
            productGrid.querySelectorAll(".shop-product-card")
        )
        : [];

    const categoryFilters =
        document.querySelectorAll(".category-filter");

    const minPrice =
        document.getElementById("minPrice");

    const maxPrice =
        document.getElementById("maxPrice");

    const applyPrice =
        document.getElementById("applyPrice");

    const clearFilters =
        document.getElementById("clearFilters");

    const sortProducts =
        document.getElementById("sortProducts");

    const filterToggle =
        document.getElementById("filterToggle");

    const filterSidebar =
        document.getElementById("filterSidebar");

    const closeFilters =
        document.getElementById("closeFilters");

    const resultCount =
        document.querySelector(".result-count strong");

    const toast =
        document.getElementById("toast");

    const searchOverlay =
        document.getElementById("searchOverlay");

    const searchBtn =
        document.querySelector(".search-btn");

    const closeSearch =
        document.getElementById("closeSearch");

    const searchInput =
        document.querySelector(".search-input input");

    const searchButton =
        document.querySelector(".search-input button");



    /* =====================================================
       CART
    ===================================================== */

    let cart = JSON.parse(
        localStorage.getItem("luxoraCart")
    ) || [];


    function saveCart() {

        localStorage.setItem(
            "luxoraCart",
            JSON.stringify(cart)
        );

    }


    function updateCartCount() {

        const cartCount =
            document.querySelector(".cart-count");

        if (!cartCount) return;

        const totalItems =
            cart.reduce(
                (total, item) =>
                    total + Number(item.quantity || 1),
                0
            );

        cartCount.textContent = totalItems;

    }


    updateCartCount();



    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer;


    function showToast(message) {

        if (!toast) return;

        const text =
            toast.querySelector("span");

        if (text) {
            text.textContent = message;
        }

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);

    }



    /* =====================================================
       ADD TO CART
    ===================================================== */

    const addCartButtons =
        document.querySelectorAll(".add-cart");


    addCartButtons.forEach(button => {

        button.addEventListener("click", () => {

            const name =
                button.dataset.product;

            const price =
                Number(button.dataset.price);

            const productId =
                button.dataset.id || null;

            const image =
                button.dataset.image || "";


            const existingProduct =
                cart.find(
                    item => item.name === name
                );


            if (existingProduct) {

                existingProduct.quantity =
                    Number(existingProduct.quantity || 1) + 1;

            } else {

                cart.push({

                    name: name,

                    price: price,

                    quantity: 1,

                    productId: productId,

                    image: image

                });

            }


            saveCart();

            updateCartCount();

            showToast(
                `${name} added to cart`
            );


            /* Button feedback */

            const originalText =
                button.textContent;

            button.textContent =
                "Added ✓";

            button.style.color =
                "#b08d22";


            setTimeout(() => {

                button.textContent =
                    originalText;

                button.style.color =
                    "";

            }, 1500);

        });

    });



    /* =====================================================
       WISHLIST
    ===================================================== */

    const wishlistButtons =
        document.querySelectorAll(".wishlist-btn");


    let wishlist =
        JSON.parse(
            localStorage.getItem("luxoraWishlist")
        ) || [];


    wishlistButtons.forEach(button => {

        const card =
            button.closest(".shop-product-card");

        if (!card) return;


        const name =
            card.querySelector("h3")?.textContent.trim();


        if (wishlist.includes(name)) {

            button.classList.add("active");

            const icon =
                button.querySelector("i");

            if (icon) {

                icon.classList.remove(
                    "fa-regular"
                );

                icon.classList.add(
                    "fa-solid"
                );

            }

        }


        button.addEventListener("click", () => {

            const index =
                wishlist.indexOf(name);


            const icon =
                button.querySelector("i");


            if (index === -1) {

                wishlist.push(name);

                button.classList.add("active");

                if (icon) {

                    icon.classList.remove(
                        "fa-regular"
                    );

                    icon.classList.add(
                        "fa-solid"
                    );

                }

                showToast(
                    "Added to wishlist"
                );

            } else {

                wishlist.splice(index, 1);

                button.classList.remove(
                    "active"
                );

                if (icon) {

                    icon.classList.remove(
                        "fa-solid"
                    );

                    icon.classList.add(
                        "fa-regular"
                    );

                }

                showToast(
                    "Removed from wishlist"
                );

            }


            localStorage.setItem(
                "luxoraWishlist",
                JSON.stringify(wishlist)
            );

        });

    });



    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    function getSelectedCategories() {

        const selected = [];

        categoryFilters.forEach(filter => {

            if (
                filter.checked &&
                filter.value !== "all"
            ) {

                selected.push(
                    filter.value
                );

            }

        });

        return selected;

    }


    categoryFilters.forEach(filter => {

        filter.addEventListener("change", () => {

            if (filter.value === "all") {

                if (filter.checked) {

                    categoryFilters.forEach(
                        other => {

                            if (
                                other.value !== "all"
                            ) {

                                other.checked = false;

                            }

                        }
                    );

                }

            } else {

                const allFilter =
                    document.querySelector(
                        '.category-filter[value="all"]'
                    );


                if (filter.checked) {

                    if (allFilter) {
                        allFilter.checked = false;
                    }

                }


                const selected =
                    getSelectedCategories();


                if (selected.length === 0) {

                    if (allFilter) {
                        allFilter.checked = true;
                    }

                }

            }


            applyFilters();

        });

    });



    /* =====================================================
       PRICE FILTER
    ===================================================== */

    function getPriceRange() {

        let min =
            parseFloat(
                minPrice?.value
            );

        let max =
            parseFloat(
                maxPrice?.value
            );


        if (isNaN(min)) {
            min = 0;
        }


        if (isNaN(max)) {
            max = Infinity;
        }


        if (min < 0) {
            min = 0;
        }


        if (max < min) {

            const temp = min;

            min = max;

            max = temp;

        }


        return {
            min,
            max
        };

    }


    if (applyPrice) {

        applyPrice.addEventListener(
            "click",
            () => {

                applyFilters();

                showToast(
                    "Price filter applied"
                );

            }
        );

    }



    /* =====================================================
       RATING FILTER
    ===================================================== */

    const ratingFilters =
        document.querySelectorAll(
            'input[name="rating"]'
        );



    /* =====================================================
       MAIN FILTER FUNCTION
    ===================================================== */

    function applyFilters() {

        const selectedCategories =
            getSelectedCategories();


        const price =
            getPriceRange();


        const selectedRating =
            document.querySelector(
                'input[name="rating"]:checked'
            );


        const minimumRating =
            selectedRating
                ? Number(selectedRating.value)
                : 0;


        let visibleCount = 0;


        products.forEach(product => {

            const category =
                product.dataset.category;

            const productPrice =
                Number(product.dataset.price);

            const productRating =
                Number(product.dataset.rating);


            const categoryMatch =
                selectedCategories.length === 0 ||
                selectedCategories.includes(
                    category
                );


            const priceMatch =
                productPrice >= price.min &&
                productPrice <= price.max;


            const ratingMatch =
                productRating >= minimumRating;


            const shouldShow =
                categoryMatch &&
                priceMatch &&
                ratingMatch;


            if (shouldShow) {

                product.classList.remove(
                    "hidden"
                );

                visibleCount++;

            } else {

                product.classList.add(
                    "hidden"
                );

            }

        });


        updateResultCount(
            visibleCount
        );

    }



    /* =====================================================
       RESULT COUNT
    ===================================================== */

    function updateResultCount(count) {

        if (resultCount) {

            resultCount.textContent =
                count;

        }

    }



    /* =====================================================
       RATING EVENTS
    ===================================================== */

    ratingFilters.forEach(radio => {

        radio.addEventListener(
            "change",
            applyFilters
        );

    });



    /* =====================================================
       SIZE SELECTOR
    ===================================================== */

    const sizeButtons =
        document.querySelectorAll(
            ".size-options button"
        );


    sizeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                sizeButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                showToast(
                    `Size ${button.textContent.trim()} selected`
                );

            }
        );

    });



    /* =====================================================
       SORT PRODUCTS
    ===================================================== */

    if (sortProducts) {

        sortProducts.addEventListener(
            "change",
            () => {

                const value =
                    sortProducts.value;


                const sortedProducts =
                    [...products];


                if (value === "price-low") {

                    sortedProducts.sort(
                        (a, b) =>
                            Number(a.dataset.price) -
                            Number(b.dataset.price)
                    );

                }


                else if (value === "price-high") {

                    sortedProducts.sort(
                        (a, b) =>
                            Number(b.dataset.price) -
                            Number(a.dataset.price)
                    );

                }


                else if (value === "rating") {

                    sortedProducts.sort(
                        (a, b) =>
                            Number(b.dataset.rating) -
                            Number(a.dataset.rating)
                    );

                }


                else if (value === "newest") {

                    sortedProducts.sort(
                        (a, b) =>
                            Number(b.dataset.date) -
                            Number(a.dataset.date)
                    );

                }


                else {

                    sortedProducts.sort(
                        (a, b) =>
                            Number(b.dataset.date) -
                            Number(a.dataset.date)
                    );

                }


                sortedProducts.forEach(
                    product => {

                        productGrid.appendChild(
                            product
                        );

                    }
                );


                applyFilters();

            }
        );

    }



    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            () => {

                categoryFilters.forEach(
                    filter => {

                        filter.checked =
                            filter.value === "all";

                    }
                );


                if (minPrice) {
                    minPrice.value = 0;
                }


                if (maxPrice) {
                    maxPrice.value = 500;
                }


                ratingFilters.forEach(
                    radio => {

                        radio.checked =
                            radio.value === "0";

                    }
                );


                sizeButtons.forEach(
                    (button, index) => {

                        button.classList.toggle(
                            "active",
                            index === 1
                        );

                    }
                );


                if (sortProducts) {
                    sortProducts.value =
                        "featured";
                }


                products.forEach(
                    product =>
                        product.classList.remove(
                            "hidden"
                        )
                );


                updateResultCount(
                    products.length
                );


                showToast(
                    "All filters cleared"
                );

            }
        );

    }



    /* =====================================================
       MOBILE FILTER DRAWER
    ===================================================== */

    function openFilters() {

        if (!filterSidebar) return;

        filterSidebar.classList.add(
            "active"
        );

        document.body.classList.add(
            "no-scroll"
        );


        createFilterOverlay();

    }


    function closeFilterDrawer() {

        if (!filterSidebar) return;

        filterSidebar.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "no-scroll"
        );


        const overlay =
            document.querySelector(
                ".filter-overlay"
            );


        if (overlay) {

            overlay.classList.remove(
                "active"
            );

        }

    }


    function createFilterOverlay() {

        let overlay =
            document.querySelector(
                ".filter-overlay"
            );


        if (!overlay) {

            overlay =
                document.createElement("div");

            overlay.className =
                "filter-overlay";

            document.body.appendChild(
                overlay
            );


            overlay.addEventListener(
                "click",
                closeFilterDrawer
            );

        }


        overlay.classList.add(
            "active"
        );

    }


    if (filterToggle) {

        filterToggle.addEventListener(
            "click",
            openFilters
        );

    }


    if (closeFilters) {

        closeFilters.addEventListener(
            "click",
            closeFilterDrawer
        );

    }



    /* =====================================================
       CLOSE FILTER ON ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeFilterDrawer();

                closeSearchOverlay();

            }

        }
    );



    /* =====================================================
       SEARCH OVERLAY
    ===================================================== */

    function openSearchOverlay() {

        if (!searchOverlay) return;

        searchOverlay.classList.add(
            "active"
        );

        document.body.classList.add(
            "no-scroll"
        );


        setTimeout(() => {

            searchInput?.focus();

        }, 200);

    }


    function closeSearchOverlay() {

        if (!searchOverlay) return;

        searchOverlay.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "no-scroll"
        );

    }


    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            openSearchOverlay
        );

    }


    if (closeSearch) {

        closeSearch.addEventListener(
            "click",
            closeSearchOverlay
        );

    }



    /* =====================================================
       PRODUCT SEARCH
    ===================================================== */

    function searchProducts() {

        const query =
            searchInput?.value
                .trim()
                .toLowerCase();


        if (!query) {

            products.forEach(
                product =>
                    product.classList.remove(
                        "hidden"
                    )
            );

            applyFilters();

            return;

        }


        let count = 0;


        products.forEach(product => {

            const name =
                product.querySelector("h3")
                    ?.textContent
                    .toLowerCase() || "";


            const category =
                product.querySelector(
                    ".product-category"
                )
                    ?.textContent
                    .toLowerCase() || "";


            const matches =
                name.includes(query) ||
                category.includes(query);


            if (matches) {

                product.classList.remove(
                    "hidden"
                );

                count++;

            } else {

                product.classList.add(
                    "hidden"
                );

            }

        });


        updateResultCount(count);

        closeSearchOverlay();

        showToast(
            count === 0
                ? "No products found"
                : `${count} product${count > 1 ? "s" : ""} found`
        );

    }


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            searchProducts
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    searchProducts();

                }

            }
        );

    }



    /* =====================================================
       QUICK VIEW
    ===================================================== */

    const quickViewButtons =
        document.querySelectorAll(
            ".quick-view"
        );


    quickViewButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const card =
                    button.closest(
                        ".shop-product-card"
                    );

                if (!card) return;


                const name =
                    card.querySelector("h3")
                        ?.textContent.trim();


                const price =
                    card.dataset.price;


                showToast(
                    `${name} — $${price}`
                );

            }
        );

    });



    /* =====================================================
       PAGINATION UI
    ===================================================== */

    const pageButtons =
        document.querySelectorAll(
            ".pagination .page"
        );


    pageButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                pageButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                window.scrollTo({
                    top:
                        document.querySelector(
                            ".shop-section"
                        )?.offsetTop - 70 || 0,

                    behavior: "smooth"

                });


                showToast(
                    `Page ${button.textContent.trim()} selected`
                );

            }
        );

    });


    const nextPage =
        document.querySelector(
            ".next-page"
        );


    if (nextPage) {

        nextPage.addEventListener(
            "click",
            () => {

                const active =
                    document.querySelector(
                        ".pagination .page.active"
                    );


                const current =
                    active
                        ? Number(
                            active.textContent.trim()
                        )
                        : 1;


                const next =
                    document.querySelector(
                        `.pagination .page:nth-of-type(${current + 1})`
                    );


                if (next) {

                    next.click();

                } else {

                    showToast(
                        "You are on the last page"
                    );

                }

            }
        );

    }



    /* =====================================================
       NEWSLETTER
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
                        'input[type="email"]'
                    );


                if (!input) return;


                const email =
                    input.value.trim();


                if (!email) {

                    showToast(
                        "Please enter your email"
                    );

                    return;

                }


                localStorage.setItem(
                    "luxoraNewsletterEmail",
                    email
                );


                input.value = "";


                showToast(
                    "Thank you for subscribing!"
                );

            }
        );

    }



    /* =====================================================
       INITIAL FILTER STATE
    ===================================================== */

    updateResultCount(
        products.length
    );

});