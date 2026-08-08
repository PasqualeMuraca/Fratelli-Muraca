/**
 * Fratelli Muraca - Logic & Cart Management
 */

let cart = new Map();
let products = [];
const CART_STORAGE_KEY = 'muraca_cart_v1';

// Load cart state from localStorage
function loadCartFromStorage() {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            cart = new Map(parsed);
        }
    } catch (e) {
        console.warn('Impossibile caricare il carrello da localStorage:', e);
        cart = new Map();
    }
}

// Save cart state to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(Array.from(cart.entries())));
    } catch (e) {
        console.warn('Impossibile salvare il carrello su localStorage:', e);
    }
}

// Helper to format currency values cleanly
function formatCurrency(amount) {
    return Number(amount).toFixed(2).replace('.', ',') + ' €';
}

// Fetch products catalog from JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('Stato risposta non valido: ' + response.status);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Errore nel caricamento dei prodotti:', error);
        return [];
    }
}

// Show a simple floating toast feedback
function showToast(message, isError = false) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white ${isError ? 'bg-danger' : 'bg-dark'} border-0 show shadow mb-2`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center">
                <i class="bi ${isError ? 'bi-exclamation-circle' : 'bi-check-circle'} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Chiudi"></button>
        </div>
    `;

    toastContainer.appendChild(toastEl);
    setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.remove(), 400);
    }, 3000);
}

// Open modal lightbox zoom for product images
function openImageZoom(imgSrc, title) {
    const zoomedImg = document.getElementById('zoomedImage');
    const modalTitle = document.getElementById('imageZoomModalLabel');
    if (zoomedImg) zoomedImg.src = imgSrc;
    if (modalTitle) modalTitle.textContent = title;

    const modalEl = document.getElementById('imageZoomModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

// Build pre-compiled WhatsApp message
function formatOrder() {
    const form = document.getElementById('order_form');
    if (!form) return '';

    const name = form.name ? form.name.value.trim() : '';
    const surname = form.surname ? form.surname.value.trim() : '';
    const address = form.address ? form.address.value.trim() : '';
    const city = form.city ? form.city.value.trim() : '';
    const prov = form.prov ? form.prov.value.trim().toUpperCase() : '';
    const cap = form.cap ? form.cap.value.trim() : '';
    const phone = form.phone ? form.phone.value.trim() : '';
    const email = form.email ? form.email.value.trim() : '';

    let subtotalProducts = 0;
    let subtotalShipping = 0;
    let itemsText = '';

    cart.forEach((quantity, productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const prodCost = product.price * quantity;
        const shipCost = product.shipping * quantity;
        subtotalProducts += prodCost;
        subtotalShipping += shipCost;

        itemsText += `• *${product.name}* x${quantity} — ${formatCurrency(prodCost)}\n`;
    });

    const totalCost = subtotalProducts + subtotalShipping;

    let text = "👋 *Ciao Fratelli Muraca, vorrei effettuare un ordine:*\n\n";
    if (name || surname) text += "👤 *Destinatario:* " + (name + " " + surname).trim() + "\n";
    if (phone) text += "📞 *Telefono:* " + phone + "\n";
    if (email) text += "📧 *Email:* " + email + "\n";
    if (address || city || cap) {
        text += "📍 *Indirizzo:* " + [address, city, prov ? `(${prov})` : '', cap].filter(Boolean).join(', ') + "\n";
    }
    text += "\n📦 *Prodotti nel carrello:*\n" + (itemsText || 'Nessun prodotto') + "\n";
    text += "💰 *Riepilogo Importo:*\n";
    text += "• Prodotti: " + formatCurrency(subtotalProducts) + "\n";
    text += "• Spedizione: " + formatCurrency(subtotalShipping) + "\n";
    text += "🔥 *TOTALE COMPLESSIVO: " + formatCurrency(totalCost) + "*\n\n";
    text += "Attendo le vostre indicazioni per il pagamento ed i tempi di consegna. Grazie mille! 🌿";

    return text;
}

// Add a product to the cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentQty = cart.get(productId) || 0;
    cart.set(productId, currentQty + 1);

    saveCartToStorage();
    updateCart();
    showToast(`<strong>${product.name}</strong> aggiunto al carrello!`);
}

// Update quantity of a product (+ / -)
function updateQuantity(productId, delta) {
    if (!cart.has(productId)) return;

    const newQty = cart.get(productId) + delta;
    if (newQty <= 0) {
        cart.delete(productId);
    } else {
        cart.set(productId, newQty);
    }

    saveCartToStorage();
    updateCart();
}

// Delete product from cart
function deleteFromCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.delete(productId);

    saveCartToStorage();
    updateCart();
    if (product) {
        showToast(`${product.name} rimosso dal carrello`, true);
    }
}

// Clear entire cart
function clearCart() {
    if (cart.size === 0) return;
    cart.clear();
    saveCartToStorage();
    updateCart();
    showToast('Carrello svuotato', true);
}

// Render and update cart display
function updateCart() {
    const orderSection = document.getElementById('order');
    const cartList = document.getElementById('cart_ul');
    const emptyCartMsg = document.getElementById('empty-cart-message');
    const navCartBadge = document.getElementById('nav-cart-badge');

    // Calculate total item count
    let totalItemCount = 0;
    cart.forEach(qty => totalItemCount += qty);

    if (navCartBadge) {
        navCartBadge.textContent = totalItemCount;
        navCartBadge.style.display = totalItemCount > 0 ? 'inline-block' : 'none';
    }

    if (cart.size === 0) {
        if (cartList) cartList.innerHTML = '';
        if (emptyCartMsg) emptyCartMsg.classList.remove('d-none');
        if (orderSection) orderSection.classList.add('d-none');
        return;
    }

    if (emptyCartMsg) emptyCartMsg.classList.add('d-none');
    if (orderSection) orderSection.classList.remove('d-none');

    if (cartList) {
        cartList.innerHTML = '';
        cart.forEach((quantity, productId) => {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const li = document.createElement('div');
            li.className = 'card mb-3 border-0 shadow-sm rounded-3 overflow-hidden cart-item-card';

            const prodTotal = product.price * quantity;
            const shipTotal = product.shipping * quantity;

            li.innerHTML = `
                <div class="card-body p-3">
                    <div class="row align-items-center g-3">
                        <div class="col-3 col-sm-2 text-center" style="cursor: pointer;" onclick="openImageZoom('./products/${product.img_path}', '${product.name}')">
                            <img src="./products/${product.img_path}" alt="${product.name}" class="img-fluid rounded" style="max-height: 80px; object-fit: contain;">
                        </div>
                        <div class="col-9 col-sm-4">
                            <h6 class="fw-bold mb-1 font-heading text-dark-olive">${product.name}</h6>
                            <small class="text-muted d-block">${formatCurrency(product.price)} cad.</small>
                            <small class="text-muted"><i class="bi bi-truck"></i> Sped: ${formatCurrency(shipTotal)}</small>
                        </div>
                        <div class="col-7 col-sm-3 d-flex align-items-center justify-content-start justify-content-sm-center">
                            <div class="input-group input-group-sm w-auto">
                                <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${product.id}, -1)">
                                    <i class="bi bi-dash-lg"></i>
                                </button>
                                <span class="input-group-text px-3 bg-white fw-bold">${quantity}</span>
                                <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${product.id}, 1)">
                                    <i class="bi bi-plus-lg"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-5 col-sm-3 text-end">
                            <div class="fw-bold text-dark fs-6">${formatCurrency(prodTotal)}</div>
                            <button type="button" class="btn btn-link text-danger p-0 text-decoration-none mt-1" style="font-size: 0.85rem;" onclick="deleteFromCart(${product.id})">
                                <i class="bi bi-trash3"></i> Rimuovi
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cartList.appendChild(li);
        });
    }

    updateTotal();
    updateOrderLinks();
}

// Update total costs calculations
function updateTotal() {
    let totalProd = 0;
    let totalShip = 0;

    cart.forEach((quantity, productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        totalProd += product.price * quantity;
        totalShip += product.shipping * quantity;
    });

    const totalPriceEl = document.getElementById('total_price');
    const totalShippingEl = document.getElementById('total_shipping');
    const totalCostEl = document.getElementById('total_cost');

    if (totalPriceEl) totalPriceEl.textContent = formatCurrency(totalProd);
    if (totalShippingEl) totalShippingEl.textContent = formatCurrency(totalShip);
    if (totalCostEl) totalCostEl.textContent = formatCurrency(totalProd + totalShip);
}

// Validate order form inputs and format WhatsApp link
function updateOrderLinks() {
    const orderWhatsappBtn = document.getElementById('order_whatsapp');
    if (!orderWhatsappBtn) return;

    const messageText = formatOrder();
    orderWhatsappBtn.href = `https://wa.me/393384578681?text=${encodeURIComponent(messageText)}`;
}

// Initial setup on DOM Ready
document.addEventListener('DOMContentLoaded', async function () {
    loadCartFromStorage();
    products = await loadProducts();

    const shopDiv = document.getElementById('shop-div');
    if (shopDiv) {
        shopDiv.innerHTML = '';

        if (products.length === 0) {
            shopDiv.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-light border d-inline-block shadow-sm">
                        <i class="bi bi-exclamation-circle fs-4 d-block mb-2 text-muted"></i>
                        Impossibile caricare il catalogo prodotti al momento.<br>
                        Riprova più tardi o contattaci direttamente su WhatsApp.
                    </div>
                </div>
            `;
        } else {
            products.forEach(product => {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4 mb-4';

                col.innerHTML = `
                    <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card">
                        <div class="product-img-wrapper" onclick="openImageZoom('./products/${product.img_path}', '${product.name}')" title="Clicca per ingrandire">
                            <img src="./products/${product.img_path}" class="card-img-top product-img" alt="${product.name}">
                            <span class="badge bg-dark bg-opacity-50 position-absolute bottom-0 end-0 m-3 px-2 py-1 rounded-pill small zoom-hint-badge">
                                <i class="bi bi-zoom-in me-1"></i> Ingrandisci
                            </span>
                        </div>
                        <div class="card-body d-flex flex-column p-4">
                            <h5 class="card-title font-heading fw-bold text-dark-olive mb-2">${product.name}</h5>
                            <p class="card-text text-muted flex-grow-1 small leading-relaxed mb-4">${product.description || ''}</p>
                            <div class="pt-3 border-top d-flex align-items-center justify-content-between">
                                <div>
                                    <div class="fs-5 fw-bold text-dark-olive">${formatCurrency(product.price)}</div>
                                    <small class="text-muted d-block"><i class="bi bi-truck"></i> Sped. ${formatCurrency(product.shipping)}</small>
                                </div>
                                <button type="button" class="btn btn-olive rounded-pill px-4 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2" onclick="addToCart(${product.id})">
                                    <i class="bi bi-cart-plus fs-6"></i>
                                    <span>Acquista</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                shopDiv.appendChild(col);
            });
        }
    }

    // Attach input event listeners on form for real-time WhatsApp message updates
    const orderForm = document.getElementById('order_form');
    if (orderForm) {
        orderForm.addEventListener('input', updateOrderLinks);
    }

    // Dynamic copyright year update in footer
    const copyrightYearEl = document.getElementById('copyright-year');
    if (copyrightYearEl) {
        copyrightYearEl.textContent = new Date().getFullYear();
    }

    // Initial render of cart
    updateCart();
});
