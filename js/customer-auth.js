/* =========================================================
   LUXORA — Customer auth helpers
   Include AFTER js/api-config.js on any page that needs to
   know whether a customer is logged in (header account link,
   checkout pre-fill, account.html order history).
========================================================= */

const CustomerAuth = {
    getToken() {
        return localStorage.getItem("luxoraCustomerToken");
    },
    getUser() {
        try {
            return JSON.parse(localStorage.getItem("luxoraCustomerUser") || "null");
        } catch {
            return null;
        }
    },
    isLoggedIn() {
        return !!(this.getToken() && this.getUser());
    },
    setSession(token, user) {
        localStorage.setItem("luxoraCustomerToken", token);
        localStorage.setItem("luxoraCustomerUser", JSON.stringify(user));
    },
    logout() {
        localStorage.removeItem("luxoraCustomerToken");
        localStorage.removeItem("luxoraCustomerUser");
        window.location.href = "index.html";
    },
};

/**
 * Updates the "Account" nav icon link across pages: if the customer is
 * logged in, it links to account.html and gets a small logged-in dot;
 * if not, it links to login.html. Call this once on DOMContentLoaded.
 */
function applyCustomerAuthToNav() {
    const accountLink = document.querySelector(".user-icon");
    if (!accountLink) return;

    if (CustomerAuth.isLoggedIn()) {
        accountLink.setAttribute("href", "account.html");
        accountLink.setAttribute("aria-label", "My Account");
        accountLink.title = CustomerAuth.getUser()?.name || "My Account";
    } else {
        accountLink.setAttribute("href", "login.html");
        accountLink.setAttribute("aria-label", "Log in");
        accountLink.title = "Log in";
    }
}

document.addEventListener("DOMContentLoaded", applyCustomerAuthToNav);
