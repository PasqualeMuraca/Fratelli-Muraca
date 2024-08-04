
// Hashmap of products in the cart with the quantity
let cart = new Map();
let products = []; // Global variable to store loaded products

// Function to load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('Error in the request: ' + response.status);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

function formatOrder() {
    let form = document.getElementById('order_form');
    let name = form.name.value;
    let surname = form.surname.value;
    let address = form.address.value;
    let city = form.city.value;
    let cap = form.cap.value;
    let phone = form.phone.value;
    let email = form.email.value;

    let totale = 0;
    let text = '';
    text += "👋 Ciao, ecco il mio ordine\n";
    text += "👤 Destinatario: *" + name + " " + surname + "*\n";
    text += "📞 Telefono: " + phone + "\n";
    text += "📧 Email: " + email + "\n";
    text += "📍 Indirizzo " + address + ", " + city + " " + cap + "\n\n";
    text += "📦 Prodotti:\n";
    cart.forEach((quantity, productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        let prezzo = (product.price + product.shipping) * quantity;
        totale += prezzo;
        text += `${product.name} x${quantity}, prezzo: ${prezzo}€\n`;
    });

    text += "\n🔥 *Totale: " + totale + "€*\n";
    text += "\n\nFratelli Muraca cercherà di rispondere il prima possibile con le modalità di pagamento.\nGrazie per la pazienza! ❤️";
    return text;
}

// Function to add a product to the cart by product ID
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (cart.has(productId)) {
        cart.set(productId, cart.get(productId) + 1);
    } else {
        cart.set(productId, 1);
    }
    updateCart();
}

// Function to delete a product from the cart by product ID
function deleteFromCart(productId) {
    cart.delete(productId);
    updateCart();
}

// Function to clear the cart
function clearCart() {
    cart.clear();
    updateCart();
}

// Function to update the cart in the HTML
function updateCart() {
    let order_div = document.getElementById('order');
    if (cart.size === 0) {
        let cart_list = document.getElementById('cart_ul');
        cart_list.innerHTML = '<li>Il carrello è vuoto</li>';
        order_div.hidden = true;
        return;
    }

    order_div.hidden = false;
    let cart_list = document.getElementById('cart_ul');
    cart_list.scrollIntoView();
    cart_list.innerHTML = '';
    cart.forEach((quantity, productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        let li = document.createElement('li');
        li.innerHTML = `
            <h2>${product.name}</h2>
            <p>Quantità: ${quantity}</p>
            <p>Prezzo: ${product.price * quantity}€</p>
            <p>Costo spedizione: ${product.shipping * quantity}€</p>
            <button type="button" class="btn btn-danger" onclick="deleteFromCart(${product.id})">Rimuovi dal carrello</button>
        `;
        cart_list.appendChild(li);
    });

    updateTotal();
    updateOrderLinks();
}

// Function to update the total price in the HTML
function updateTotal() {
    let total = 0;
    let shipping = 0;
    cart.forEach((quantity, productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        total += product.price * quantity;
        shipping += product.shipping * quantity;
    });

    let total_price = document.getElementById('total_price');
    total_price.innerHTML = `Prezzo carello: ${total}€`;
    let total_shipping = document.getElementById('total_shipping');
    total_shipping.innerHTML = `Costo spedizione: ${shipping}€`;
    let total_cost = document.getElementById('total_cost');
    total_cost.innerHTML = `Totale: ${total + shipping}€`;
}

function updateOrderLinks() {
    let order_whatsapp = document.getElementById('order_whatsapp');
    let text = formatOrder();
    console.log(text);
    order_whatsapp.href = `https://wa.me/393382739450?text=${encodeURIComponent(text)}`;
}

// Main
document.addEventListener('DOMContentLoaded', async function () {
    products = await loadProducts();

    // For each product, append the information with li in a ul with id products_ul
    let shopDiv = document.getElementById('shop-div');
    products.forEach(product => {
        let div = document.createElement('div');
        div.classList.add('col-md-4');
        div.innerHTML = `
            <div class="card">
                <img height="500" src="media/${product.img_path}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">Prezzo: ${product.price}€</p>
                    <p class="card-text">Costo spedizione: ${product.shipping}€</p>
                    <button type="button" class="btn btn-primary" onclick="addToCart(${product.id})">Aggiungi al carrello</button>
                </div>
            </div>
        `;

        shopDiv.appendChild(div);
    });
});
