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
        console.log('Data produk berhasil dimuat:', allProducts)
        renderProducts(allProducts)
        updateCartCount()
    } catch(error){
        console.error('Gagal mengambil data produk:', error)
    }
}

function renderProducts(products){
    const container = document.getElementById('product-container')
    container.innerHTML = ''

    console.log(products[0].tags)

    products.forEach(product => {
        const tagsHTML = product.tags?.map(t => `<span>${t}</span>`).join('') ?? '';

        const cardHTML = `
        <div class="custom-card">
        <div class="card-image">
          <img src="${product.image}" alt="${product.name}">
          <div class="category-badge">${product.category}</div>
        </div>
        <div class="card-body">
          <div class="card-name">${product.name}</div>
          <div class="card-price-wrap">
          <div class="card-price">${product.price}</div>
          <div class="card-price-real">${product.priceReal}</div>
          </div>
          <p class="card-text">${product.description}</p>
          <div class="card-tags">${tagsHTML}</div>
          <button class="cart-btn" onclick="addToCart(${product.id})">
            + Keranjang
          </button>
        </div>
      </div>
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

function renderCalculator() {
    const container = document.getElementById('calculate-custom-container');

    container.innerHTML = `
        <div class="calc-wrapper">
            <div class="calc-fields">

                <div class="calc-field">
                    <label class="calc-label">Jumlah LPFPM</label>
                    <div class="calc-options" id="lpfpm-options">
                        ${[50,100,150,200,250,300,350,400].map(v => `
                            <button class="calc-opt" data-value="${v}" onclick="selectOpt(this, 'lpfpm')">${v}</button>
                        `).join('')}
                    </div>
                </div>

                <div class="calc-field">
                    <label class="calc-label">Jumlah Sebar <span class="calc-hint">maks. 5x/hari</span></label>
                    <div class="calc-options" id="sebar-options">
                        ${[1,2,3,4,5].map(v => `
                            <button class="calc-opt" data-value="${v}" onclick="selectOpt(this, 'sebar')">${v}x</button>
                        `).join('')}
                    </div>
                </div>

                <div class="calc-field">
                    <label class="calc-label">Jumlah Hari <span class="calc-hint">maks. 5 hari</span></label>
                    <div class="calc-options" id="hari-options">
                        ${[1,2,3,4,5].map(v => `
                            <button class="calc-opt" data-value="${v}" onclick="selectOpt(this, 'hari')">${v} hari</button>
                        `).join('')}
                    </div>
                </div>

                <div class="calc-field">
                    <label class="calc-label">Screenshot</label>
                    <div class="calc-options" id="ss-options">
                        <button class="calc-opt" data-value="tidak" onclick="selectOpt(this, 'ss')">Tidak</button>
                        <button class="calc-opt" data-value="pendek" onclick="selectOpt(this, 'ss')">Pendek</button>
                        <button class="calc-opt" data-value="panjang" onclick="selectOpt(this, 'ss')">Panjang</button>
                    </div>
                </div>

                <div class="calc-field">
                    <label class="calc-label">Inrush <span class="calc-hint">kelipatan 1 jam — +Rp 100/jam</span></label>
                    <div class="calc-inrush">
                        <button class="calc-stepper" onclick="changeInrush(-1)">−</button>
                        <span id="inrush-val">0</span>
                        <button class="calc-stepper" onclick="changeInrush(1)">+</button>
                        <span class="calc-hint" style="margin-left:8px">jam</span>
                    </div>
                </div>

            </div>

            <div class="calc-result-wrap">
                <div class="calc-result" id="calc-result">
                    <div class="calc-result-label">Total Estimasi</div>
                    <div class="calc-result-price" id="calc-price">Rp 0</div>
                    <div class="calc-result-detail" id="calc-detail">— pilih opsi di atas —</div>
                    <button class="calc-order-btn" onclick="orderViaWA()">
                        Pesan via WhatsApp <i class="bi bi-whatsapp"></i>
                    </button>
                </div>

                <div class="calc-note">
                    <div class="calc-note-title">⚠ Catatan</div>
                    <ul>
                        <li>Tidak menerima list bermedia (foto/video)</li>
                        <li>Banned list 18+/21+, freelance, TMO, LGBT</li>
                        <li>Tidak menerima list real life</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

const calcState = { lpfpm: null, sebar: null, hari: null, ss: 'tidak', inrush: 0 };

function selectOpt(el, type) {
    const group = document.querySelectorAll(`#${type}-options .calc-opt`);
    group.forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    calcState[type] = el.dataset.value;
    if (type === 'ss') calcState.ss = el.dataset.value;
    updateCalc();
}

function changeInrush(delta) {
    calcState.inrush = Math.max(0, calcState.inrush + delta);
    document.getElementById('inrush-val').textContent = calcState.inrush;
    updateCalc();
}

function updateCalc() {
    const { lpfpm, sebar, hari, ss, inrush } = calcState;
    const priceEl = document.getElementById('calc-price');
    const detailEl = document.getElementById('calc-detail');

    if (!lpfpm || !sebar || !hari) {
        priceEl.textContent = 'Rp 0';
        detailEl.innerHTML = '<span style="color:#666">— pilih opsi di atas —</span>';
        return;
    }

    const lpfpmNum = parseInt(lpfpm);
    const sebarNum = parseInt(sebar);
    const hariNum  = parseInt(hari);

    const basePerSebar  = (lpfpmNum / 50) * 100;
    const baseTotal     = basePerSebar * sebarNum * hariNum;
    const ssFee         = ss === 'panjang' && lpfpmNum > 50 ? (lpfpmNum / 100) * 25 * sebarNum * hariNum : 0;
    const inrushFee     = inrush * 100;
    const jumlSs        = ssFee > 0 ? sebarNum * hariNum : 0;
    const total         = baseTotal + ssFee + inrushFee;

    const fmt  = (n) => 'Rp. ' + n.toLocaleString('id-ID');
    const row  = (label, val, sub = '') => `
        <div class="calc-detail-row">
            <div class="calc-detail-left">
                <span class="calc-detail-name">${label}</span>
                ${sub ? `<span class="calc-detail-sub">${sub}</span>` : ''}
            </div>
            <span class="calc-detail-val"> = ${val}</span>
        </div>`;

    priceEl.textContent = fmt(total);

    const orderCode = 'BNDT-' + Date.now().toString().slice(-6);
    const now = new Date();
    const tgl = now.toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'});
    const jam = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});

detailEl.innerHTML = `
    <div class="rcpt-head">
        <div class="rcpt-brand">Bandit's Store</div>
        <div class="rcpt-sub">wa.me/6285863714376</div>
    </div>

    <div class="rcpt-dots"></div>

    <div class="rcpt-meta">
        <div class="rcpt-meta-row"><span>Order</span><span>${orderCode}</span></div>
        <div class="rcpt-meta-row"><span>Tanggal</span><span>${tgl} ${jam}</span></div>
    </div>

    <div class="rcpt-dots"></div>

    <div class="rcpt-table-head">
        <span>Item</span>
        <span>Qty</span>
        <span>Harga</span>
    </div>

    <div class="rcpt-dots" style="margin:4px 0"></div>

    <div class="rcpt-item-row">
        <span>Jaseb ${sebarNum}× sebar ${hariNum} hari</span>
        <span>${lpfpmNum} lpfpm</span>
        <span>${fmt(baseTotal)}</span>
    </div>
    <div class="rcpt-item-note">${fmt(basePerSebar)} / sebar</div>

    ${ss !== 'tidak' ? `
    <div class="rcpt-item-row">
        <span>Screenshot ${ss}</span>
        <span>${ssFee ? jumlSs + 'x ss' : '-'}</span>
        <span>${ss === 'panjang' ? fmt(ssFee) : fmt(0)}</span>
    </div>
    <div class="rcpt-item-note">${ss === 'panjang' ? `Rp25 / screenshot` : 'tidak ada biaya tambahan'}</div>
    ` : ''}

    ${inrush > 0 ? `
    <div class="rcpt-item-row">
        <span>Inrush</span>
        <span>${inrush} jam</span>
        <span>${fmt(inrushFee)}</span>
    </div>
    <div class="rcpt-item-note">Rp100 / jam</div>
    ` : ''}

    <div class="rcpt-dots" style="margin-top:8px"></div>

    <div class="rcpt-total-row">
        <span>TOTAL</span>
        <span>${fmt(total)}</span>
    </div>

    <div class="rcpt-dots"></div>

    <div class="rcpt-footer">Terimakasih sudah order <br/> Silahkan lanjutkan proses pemesanan di WhatsApp</div>
`;
}

function orderViaWA() {
    const { lpfpm, sebar, hari, ss, inrush } = calcState;
    if (!lpfpm || !sebar || !hari) {
        alert('Lengkapi semua pilihan dulu ya!');
        return;
    }
    const priceText = document.getElementById('calc-price').textContent;
    const msg = encodeURIComponent(
        `Halo kak, mau order custom sebar!\n` +
        `• lpfpm: ${lpfpm}\n• Sebar: ${sebar}x/hari\n• Hari: ${hari} hari\n` +
        `• Screenshot: ${ss}\n• Inrush: ${inrush} jam\n• Estimasi: ${priceText}`
    );
    window.open(`https://wa.me/6285863714376?text=${msg}`, '_blank');
}

renderCalculator();