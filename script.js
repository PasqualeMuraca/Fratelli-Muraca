// fill an array of products taken from prodotti.json
let products = [];
fetch('products.json')
    .then(response => response.json())
    .then(data => {
        products = data;
    });


document.addEventListener('DOMContentLoaded', function() {
    // for each product append the information with li in a ul with id products_ul
    let products_list = document.getElementById('products_ul');
    products.forEach(product => {
        let li = document.createElement('li');
        console.log(product);
        li.innerHTML = `
            <h2>${product.name}</h2>
            <p>Prezzo: ${product.price}€</p>
            <p>Costo spedizione: ${product.shipping}€</p>
            <button>Aggiungi al carrello</button>
        `;
        products_list.appendChild(li);
    });
});

