/* =========================================================
   LUMINA — cart logic
   Clicking "+" on any product adds it to the purchases panel.
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "lumina-cart";

    /* Change this to your real Instagram handle (no @) */
    const INSTAGRAM_USERNAME = "lumina__blooms";

    /* Change this to your real WhatsApp number, country code first, no + or spaces (e.g. "201001234567") */
    const WHATSAPP_NUMBER = "201003920301";

    const cartToggle = document.getElementById("cartToggle");
    const cartPanel = document.getElementById("cartPanel");
    const cartOverlay = document.getElementById("cartOverlay");
    const cartClose = document.getElementById("cartClose");
    const cartItemsEl = document.getElementById("cartItems");
    const cartEmptyEl = document.getElementById("cartEmpty");
    const cartCountEl = document.getElementById("cartCount");
    const cartTotalEl = document.getElementById("cartTotal");
    const addButtons = document.querySelectorAll(".add-to-cart");
    const cartCheckout = document.getElementById("cartCheckout");
    const cartCheckoutWhatsapp = document.getElementById("cartCheckoutWhatsapp");
    const toastEl = document.getElementById("toast");

    function loadCart() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (err) {
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (err) {
            /* storage unavailable — cart still works for this session */
        }
    }

    let cart = loadCart();

    function formatEGP(amount) {
        return amount.toLocaleString("en-US") + " EGP";
    }

    function render() {
        cartItemsEl.querySelectorAll(".cart-item").forEach((el) => el.remove());

        if (cart.length === 0) {
            cartEmptyEl.style.display = "block";
        } else {
            cartEmptyEl.style.display = "none";

            cart.forEach((item, index) => {
                const row = document.createElement("div");
                row.className = "cart-item";
                row.innerHTML = `
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span>${formatEGP(item.price)}</span>
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" data-action="decrease" data-index="${index}" aria-label="Decrease quantity">–</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" data-action="increase" data-index="${index}" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="cart-item-remove" data-action="remove" data-index="${index}" aria-label="Remove ${item.name}">✕</button>
                `;
                cartItemsEl.appendChild(row);
            });
        }

        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

        cartCountEl.textContent = totalItems;
        cartTotalEl.textContent = formatEGP(totalPrice);

        saveCart(cart);
    }

    function addToCart(name, price, img) {
        const existing = cart.find((item) => item.name === name);

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ name, price, img, qty: 1 });
        }

        render();
        openCart();
    }

    function openCart() {
        cartPanel.classList.add("is-open");
        cartOverlay.classList.add("is-open");
        cartPanel.setAttribute("aria-hidden", "false");
    }

    function closeCart() {
        cartPanel.classList.remove("is-open");
        cartOverlay.classList.remove("is-open");
        cartPanel.setAttribute("aria-hidden", "true");
    }

    function buildOrderMessage() {
        const lines = cart.map(
            (item) => `${item.qty} x ${item.name} — ${formatEGP(item.qty * item.price)}`
        );
        const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

        return (
            "Hi Lumina! I'd like to order:\n" +
            lines.join("\n") +
            `\n\nTotal: ${formatEGP(totalPrice)}`
        );
    }

    function showToast(message) {
        toastEl.textContent = message;
        toastEl.classList.add("is-visible");
        setTimeout(() => toastEl.classList.remove("is-visible"), 3200);
    }

    async function sendOrderOnInstagram() {
        if (cart.length === 0) {
            showToast("Add a piece to your order first.");
            return;
        }

        const message = buildOrderMessage();

        try {
            await navigator.clipboard.writeText(message);
            showToast("Order copied! Paste it in the Instagram chat.");
        } catch (err) {
            showToast("Couldn't copy automatically — write your order in the chat.");
        }

        window.open(`https://ig.me/m/${INSTAGRAM_USERNAME}`, "_blank", "noopener");
    }

    function sendOrderOnWhatsapp() {
        if (cart.length === 0) {
            showToast("Add a piece to your order first.");
            return;
        }

        const message = buildOrderMessage();
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank", "noopener");
    }

    addButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const { name, price, img } = button.dataset;
            addToCart(name, Number(price), img);
        });
    });

    cartItemsEl.addEventListener("click", (event) => {
        const target = event.target.closest("button[data-action]");
        if (!target) return;

        const index = Number(target.dataset.index);
        const action = target.dataset.action;

        if (action === "increase") {
            cart[index].qty += 1;
        } else if (action === "decrease") {
            cart[index].qty -= 1;
            if (cart[index].qty <= 0) cart.splice(index, 1);
        } else if (action === "remove") {
            cart.splice(index, 1);
        }

        render();
    });

    cartToggle.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);
    cartCheckout.addEventListener("click", sendOrderOnInstagram);
    cartCheckoutWhatsapp.addEventListener("click", sendOrderOnWhatsapp);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeCart();
    });

    render();
})();
