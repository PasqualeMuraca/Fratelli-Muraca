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

// main
document.addEventListener('DOMContentLoaded', async function() {
    var products = await loadProducts();

    // for each product append the information with li in a ul with id products_ul
    let products_list = document.getElementById('products_ul');
    products.forEach(product => {
        let li = document.createElement('li');
        li.innerHTML = `
            <h2>${product.name}</h2>
            <p>Prezzo: ${product.price}€</p>
            <p>Costo spedizione: ${product.shipping}€</p>
            <button>Aggiungi al carrello</button>
        `;
        products_list.appendChild(li);
    });

});
