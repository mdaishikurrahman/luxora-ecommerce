/* =========================================================
   LUXORA Admin — shared helpers
   Handles: API base URL, auth token storage, fetch wrapper,
   auth guard, logout, small UI helpers (toast).
========================================================= */

const API_BASE = window.location.origin + "/api";

const Auth = {
    getToken() {
        return localStorage.getItem("luxoraAdminToken");
    },
    getUser() {
        try {
            return JSON.parse(localStorage.getItem("luxoraAdminUser") || "null");
        } catch {
            return null;
        }
    },
    setSession(token, user) {
        localStorage.setItem("luxoraAdminToken", token);
        localStorage.setItem("luxoraAdminUser", JSON.stringify(user));
    },
    clearSession() {
        localStorage.removeItem("luxoraAdminToken");
        localStorage.removeItem("luxoraAdminUser");
    },
    logout() {
        this.clearSession();
        window.location.href = "/admin/login.html";
    },
    // Call at the top of every protected admin page.
    guard() {
        const token = this.getToken();
        const user = this.getUser();
        if (!token || !user || user.role !== "admin") {
            window.location.href = "/admin/login.html";
        }
        return user;
    },
};

// Wrapper around fetch() that adds the auth header and handles JSON + 401s.
async function apiFetch(path, options = {}) {
    const token = Auth.getToken();
    const headers = { ...(options.headers || {}) };

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
        Auth.logout();
        throw new Error("Session expired. Please log in again.");
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || "Request failed.");
    }
    return data;
}

// Simple bottom-right toast, mirrors the storefront's toast style.
function showToast(message, isError = false) {
    let toast = document.getElementById("adminToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "adminToast";
        toast.className =
            "fixed bottom-6 right-6 z-[500] px-5 py-4 rounded flex items-center gap-3 text-sm text-white shadow-lg transition-all duration-300 translate-y-4 opacity-0";
        document.body.appendChild(toast);
    }
    toast.className = toast.className.replace(/bg-\S+/g, "");
    toast.classList.add(isError ? "bg-red-600" : "bg-ink");
    toast.textContent = message;

    requestAnimationFrame(() => {
        toast.classList.remove("translate-y-4", "opacity-0");
    });

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.add("translate-y-4", "opacity-0");
    }, 3000);
}

function money(n) {
    return `$${Number(n || 0).toFixed(2)}`;
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
