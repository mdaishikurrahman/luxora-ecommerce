/* Injects the sidebar + topbar into #adminLayout on every admin page.
   Usage: <div id="adminLayout" data-active="products"></div>
          <script src="js/admin-layout.js"></script>  (after admin-common.js)
*/
(function renderAdminLayout() {
    const mount = document.getElementById("adminLayout");
    if (!mount) return;

    const active = mount.dataset.active || "";
    const user = Auth.getUser();

    const links = [
        { key: "dashboard", href: "index.html", icon: "fa-gauge", label: "Dashboard" },
        { key: "products", href: "products.html", icon: "fa-tag", label: "Products" },
        { key: "orders", href: "orders.html", icon: "fa-bag-shopping", label: "Orders" },
        { key: "coupons", href: "coupons.html", icon: "fa-percent", label: "Coupons" },
        { key: "messages", href: "messages.html", icon: "fa-envelope", label: "Messages" },
    ];

    const linkHtml = links
        .map(
            (l) => `
        <a href="${l.href}" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition
            ${l.key === active ? "bg-gold/15 text-gold-dark" : "text-white/60 hover:text-white hover:bg-white/5"}">
            <i class="fa-solid ${l.icon} w-4 text-center"></i> ${l.label}
        </a>`
        )
        .join("");

    mount.innerHTML = `
    <div class="flex min-h-screen bg-soft">
        <aside class="w-64 flex-none bg-dark flex flex-col">
            <div class="h-20 flex items-center px-6 border-b border-white/10">
                <a href="index.html" class="font-heading text-xl font-semibold text-white">LUXORA<span class="text-gold">.</span></a>
                <span class="ml-2 text-[10px] tracking-[2px] text-white/40 uppercase">Admin</span>
            </div>
            <nav class="flex-1 px-3 py-6 flex flex-col gap-1">${linkHtml}</nav>
            <div class="px-4 py-5 border-t border-white/10">
                <p class="text-white text-sm font-medium truncate">${user ? user.name : ""}</p>
                <p class="text-white/40 text-xs truncate mb-3">${user ? user.email : ""}</p>
                <button id="adminLogoutBtn" class="w-full text-left text-xs font-semibold uppercase tracking-wide text-white/60 hover:text-gold transition flex items-center gap-2">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> Log out
                </button>
            </div>
        </aside>
        <div class="flex-1 min-w-0">
            <header class="h-20 bg-white border-b border-line flex items-center justify-between px-8">
                <h1 id="adminPageTitle" class="font-heading text-2xl font-semibold text-ink"></h1>
                <a href="/index.html" target="_blank" class="text-xs font-semibold text-muted hover:text-gold-dark transition">
                    View storefront <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i>
                </a>
            </header>
            <main id="adminMain" class="p-8"></main>
        </div>
    </div>`;

    document.getElementById("adminLogoutBtn").addEventListener("click", () => Auth.logout());
})();
