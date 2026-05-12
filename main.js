let cart = JSON.parse(localStorage.getItem('CART_DATA')) || []
let allProducts = []
const navItems = document.querySelectorAll('nav ul li');
const sections = document.querySelectorAll('section')
const hamburger = document.querySelector('.btn-hamburger')
const navMenu = document.querySelector('nav ul')

const changeActiveNav = (id) => {
    navItems.forEach(li => {
        li.classList.remove('active')

        if(li.querySelector('a').getAttribute('href') === `#${id}`){
            li.classList.add('active')
        }
    })
}

const options = {
    threshold: 0.6
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            changeActiveNav(entry.target.id)
        }
    })
}, options)

sections.forEach(section => observer.observe(section))

navItems.forEach(item => {
    item.addEventListener('click', function(){
        navItems.forEach(li => li.classList.remove('active'))
        this.classList.add('active')
    })
})

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('show')
})

async function loadProducts() {
    try{
        const response = await fetch('products.json')
        allProducts = await response.json()
        renderProducts(allProducts)
        updateCartCount()
    } catch(error){
        console.error('Gagal mengambil data produk:', error)
    }
}

function renderProducts(products){
    const container = document.getElementById('product-container')
    container.innerHTML = ''

    products.forEach(product => {
        const tagsHTML = product.tags.map(tag => `<span>${tag}</span>`)

        const cardHTML = `
        <article class="custom-card">
                <div class="card-image">
                  <span class="category-badge">${product.category}</span>
                  <img src="${product.image}" alt="Product 01">
                </div>

                <div class="card-body">
                  <div class="card-desc">
                    <h3 class="card-name">${product.name}</h3>
                    <div class="price-section">
                    <p class="card-price">${product.price}</p>
                    <span class="sub-price">/${product.perpfpm}  lpfpm</span>
                    </div>
                    <p class="card-text">${product.description}</p>
                    <div class="card-tags">
                      ${tagsHTML}
                    </div>
                  </div>
                  <button class="cart-btn" onclick="addToCart(${product.id})">
                        <i class="bi bi-cart-plus"></i> Add To Cart
                    </button>
                </div>
              </article>
        `

        container.innerHTML += cardHTML
    })
}

loadProducts()

function addToCart(productId){
    const product = allProducts.find(p => p.id === productId)

    const existingItem = cart.find(item => item.id === productId)

    if(existingItem){
        existingItem.quantity += 1
    } else {
        cart.push({
            ...product,
            quantity: 1
        })
    }

    saveCart()
    updateCartCount()

    console.log('Isi keranjang :', cart)
}

function saveCart(){
    localStorage.setItem('CART_DATA', JSON.stringify(cart))
}

function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    // Hitung total quantity semua barang di keranjang
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElement.innerText = totalItems;
}