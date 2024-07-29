
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
    let cart_list = document.getElementById('cart_ul');
    cart_list.innerHTML = '';
    cart.forEach((quantity, productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        let li = document.createElement('li');
        li.innerHTML = `
            <h2>${product.name}</h2>
            <p>Quantità: ${quantity}</p>
            <p>Prezzo: ${product.price}€</p>
            <p>Costo spedizione: ${product.shipping}€</p>
            <button onclick="deleteFromCart(${product.id})">Rimuovi dal carrello</button>
        `;
        cart_list.appendChild(li);
    });
}

// Main
document.addEventListener('DOMContentLoaded', async function() {
    products = await loadProducts();
    
    // For each product, append the information with li in a ul with id products_ul
    let products_list = document.getElementById('products_ul');
    products.forEach(product => {
        let li = document.createElement('li');
        li.innerHTML = `
            <h2>${product.name}</h2>
            <img src="media/${product.img_path}" alt="${product.name}">
            <p>Prezzo: ${product.price}€</p>
            <p>Costo spedizione: ${product.shipping}€</p>
            <button onclick="addToCart(${product.id})">Aggiungi al carrello</button>
        `;
        products_list.appendChild(li);
    });
});
