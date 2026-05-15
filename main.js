let cart = JSON.parse(localStorage.getItem('CART_DATA')) || []
let allProducts = []
const navItems = document.querySelectorAll('nav ul li');
const sections = document.querySelectorAll('section')
const hamburger = document.querySelector('.btn-menu')
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
    rootMargin: '-80px 0px -50% 0px', 
    threshold: 0
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting && entry.intersectionRatio >= 0){
            changeActiveNav(entry.target.id)
        }
    })
}, options)

sections.forEach(section => observer.observe(section))

navItems.forEach(item => {
    // item.addEventListener('click', function(){
    //     navItems.forEach(li => li.classList.remove('active'))
    //     this.classList.add('active')
    // })

    item.addEventListener('click', function(){
    navMenu.classList.remove('show');
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
          <div class="card-price">${fmt(product.price)}</div>
          <div class="card-price-real">${fmt(product.priceReal)}</div>
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

function hitungHarga() {
  const { lpfpm, sebar, hari, ss, inrush } = calcState

  const lpfpmNum = parseInt(lpfpm)
  const sebarNum = parseInt(sebar)
  const hariNum  = parseInt(hari)

  const baseTotal = (lpfpmNum / 50) * 100 * sebarNum * hariNum
  const ssFee     = ss === 'panjang' && lpfpmNum > 50
    ? (lpfpmNum / 100) * 25 * sebarNum * hariNum
    : 0
  const inrushFee = inrush * 100

  return baseTotal + ssFee + inrushFee
}

function addCustomToCart() {
  const { lpfpm, sebar, hari, ss, inrush } = calcState
  if (!lpfpm || !sebar || !hari) return

  const item = {
    id: 'custom-' + Date.now(),
    type: 'custom',
    name: `Sebar ${sebar}x · ${hari} hari · ${lpfpm} lpfpm`,
    lpfpm, sebar, hari, ss, inrush,
    price: hitungHarga(),
    quantity: 1
  }

  cart.push(item)
  saveCart()
  updateCartCount()
}

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
                    

                    <button class="cart-btn" onclick="addCustomToCart()">
            + Keranjang
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
    const total         = hitungHarga();

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


// ── CART UI ──────────────────────────────────────────────────

function toggleCart() {
  const drawer  = document.getElementById('cart-drawer')
  const overlay = document.getElementById('cart-overlay')
  const isOpen  = drawer.classList.contains('open')
  drawer.classList.toggle('open', !isOpen)
  overlay.classList.toggle('open', !isOpen)
  if (!isOpen) renderCartUI()
}

function switchTab(tab) {
  document.getElementById('tab-cart').style.display    = tab === 'cart'    ? 'block' : 'none'
  document.getElementById('tab-receipt').style.display = tab === 'receipt' ? 'block' : 'none'
  document.getElementById('cart-footer').style.display = tab === 'cart'    ? 'block' : 'none'
  document.getElementById('tab-btn-cart').classList.toggle('active',    tab === 'cart')
  document.getElementById('tab-btn-receipt').classList.toggle('active', tab === 'receipt')
  document.getElementById('tab-btn-receipt').style.display = tab === 'cart' ? 'none' : 'block'
}

/* function renderCartUI() {
  const list    = document.getElementById('cart-items-list')
  const footer  = document.getElementById('cart-footer')

  if (!cart.length) {
    list.innerHTML = `
      <div class="cart-empty">
        <i class="bi bi-cart-x"></i>
        <p>Keranjang masih kosong</p>
      </div>`
    footer.style.display = 'none'
    return
  }

  console.log(cart)

  list.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div class="item-icon ${item.type}">
        ${item.type === 'paket' ? '<i class="bi bi-box-seam"></i>' : '<i class="bi bi-basket2"></i>'}
      </div>
      <div class="item-body">
        <span class="item-badge badge-${item.type}">${item.type}</span>
        <div class="item-name">${item.name}</div>
        <div class="qty-row">
          <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          <button class="del-btn" onclick="removeItem(${idx})">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
      <div class="item-price-wrap">
        <div class="item-price">${fmt(item.price * item.quantity)}</div>
        <div class="item-price-unit">${fmt(item.price)} / item</div>
      </div>
    </div>
  `).join('')

  const totalQty = cart.reduce((s, i) => s + i.quantity, 0)
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  document.getElementById('item-count').textContent  = totalQty
  document.getElementById('subtotal-val').textContent = fmt(subtotal)
  document.getElementById('total-val').textContent    = fmt(subtotal)
  footer.style.display = 'block'
} */

  function renderCartUI() {
  const list   = document.getElementById('cart-items-list')
  const footer = document.getElementById('cart-footer')

  if (!cart.length) {
    list.innerHTML = `
      <div class="cart-empty">
        <i class="bi bi-cart-x"></i>
        <p>Keranjang masih kosong</p>
      </div>`
    footer.style.display = 'none'
    return
  }

  console.log(cart)
  
  const formHTML = `
    <div class="customer-info-form" style="padding: 15px; background: #f9f9f9; border-radius: 8px; margin-bottom: 15px; border: 1px solid #eee;">
        <h4 style="margin-bottom:10px; font-size:14px; color:#333;">Data Pemesan</h4>
        <input type="text" id="cust-name" placeholder="Nama Lengkap" style="width:100%; padding:8px; margin-bottom:8px; border:1px solid #ddd; border-radius:4px;">
        <input type="text" id="cust-contact" placeholder="Nomor WA atau ID Telegram" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
    </div>
  `;
  
  const itemsHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div class="item-icon ${item.type}">
        ${item.type === 'paket' ? '<i class="bi bi-box-seam"></i>' : '<i class="bi bi-basket2"></i>'}
      </div>
      <div class="item-body">
        <span class="item-badge badge-${item.type}">${item.type}</span>
        <div class="item-name">${item.name}</div>

          <div class="item-spec-grid">
            <div class="item-spec-row">
              <span class="spec-label">LPFPM</span>
              <span class="spec-val">${item.lpfpm}</span>
            </div>
            <div class="item-spec-row">
              <span class="spec-label">Sebar</span>
              <span class="spec-val">${item.sebar}x / hari</span>
            </div>
            <div class="item-spec-row">
              <span class="spec-label">Hari</span>
              <span class="spec-val">${item.hari} hari</span>
            </div>
            <div class="item-spec-row">
              <span class="spec-label">Screenshot</span>
              <span class="spec-val">${item.ss}</span>
            </div>
            ${item.inrush > 0 ? `
            <div class="item-spec-row">
              <span class="spec-label">Inrush</span>
              <span class="spec-val">${item.inrush} jam</span>
            </div>` : ''}
          </div>

        <div class="qty-row">
          <span class="qty-label">Qty</span>
          <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          <button class="del-btn" onclick="removeItem(${idx})">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
      <div class="item-price-wrap">
        <div class="item-price">${fmt(item.price * item.quantity)}</div>
        <div class="item-price-unit">${fmt(item.price)} / item</div>
      </div>
    </div>
  `).join('')

  list.innerHTML = formHTML + itemsHTML;

  const totalQty = cart.reduce((s, i) => s + i.quantity, 0)
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  document.getElementById('item-count').textContent   = totalQty
  document.getElementById('subtotal-val').textContent = fmt(subtotal)
  document.getElementById('total-val').textContent    = fmt(subtotal)
  footer.style.display = 'block'
}

function changeQty(idx, delta) {
  cart[idx].quantity = Math.max(1, cart[idx].quantity + delta)
  saveCart()
  updateCartCount()
  renderCartUI()
}

function removeItem(idx) {
  cart.splice(idx, 1)
  saveCart()
  updateCartCount()
  renderCartUI()
}

function prosesOrder() {
    const name = document.getElementById('cust-name').value.trim();
  const contact = document.getElementById('cust-contact').value.trim();

  if (!name || !contact) {
    alert('Mohon isi Nama dan Nomor WA/ID Telegram terlebih dahulu!');
    return;
  }

  // Simpan sementara data pemesan ke object global atau localStorage
  window.customerData = { name, contact };

  renderReceipt()
  switchTab('receipt')
}

// function renderReceipt() {
//   const now    = new Date()
//   const tgl    = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
//   const jam    = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
//   const code   = 'BNDT-' + Date.now().toString().slice(-6)
//   const total  = cart.reduce((s, i) => s + i.price * i.quantity, 0)
//   const totalQty = cart.reduce((s, i) => s + i.quantity, 0)

//   const itemsHTML = cart.map(item => `
//     <div class="rcpt-item-row">
//       <span>${item.name} ×${item.quantity}</span>
//       <span>${fmt(item.price * item.quantity)}</span>
//     </div>
//     <div class="rcpt-item-desc">${fmt(item.price)}/item</div>
//   `).join('')

//   const waMsg = encodeURIComponent(
//     `Halo kak, mau order!\nOrder ID: ${code}\nTanggal: ${tgl} ${jam}\n\n` +
//     cart.map(i => `• ${i.name} ×${i.quantity} — ${fmt(i.price * i.quantity)}\n  ${i.desc}`).join('\n') +
//     `\n\nTotal: ${fmt(total)}`
//   )

//   document.getElementById('receipt-content').innerHTML = `
//     <div class="receipt-card">
//       <div class="rcpt-brand">Bandit's Store</div>
//       <div class="rcpt-sub">wa.me/6285863714376</div>
//       <hr class="rcpt-divider">
//       <div class="rcpt-row"><span>Order ID</span><span>${code}</span></div>
//       <div class="rcpt-row"><span>Tanggal</span><span>${tgl}, ${jam}</span></div>
//       <div class="rcpt-row"><span>Total item</span><span>${totalQty} item</span></div>
//       <hr class="rcpt-divider">
//       ${itemsHTML}
//       <hr class="rcpt-divider">
//       <div class="rcpt-total-row"><span>TOTAL</span><span>${fmt(total)}</span></div>
//       <hr class="rcpt-divider">
//       <div class="rcpt-footer-text">Terimakasih sudah order!<br>Lanjutkan konfirmasi via WhatsApp</div>
//     </div>
//     <a href="https://wa.me/6285863714376?text=${waMsg}" target="_blank" style="text-decoration:none">
//       <button class="btn-wa">
//         <i class="bi bi-whatsapp"></i> Konfirmasi via WhatsApp
//       </button>
//     </a>
//     <button class="btn-back-cart" onclick="switchTab('cart')">
//       ← Kembali ke keranjang
//     </button>
//   `
// }

function renderReceipt() {
  const now      = new Date()
  const tgl      = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const jam      = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const code     = 'BNDT-' + Date.now().toString().slice(-6)
  const total    = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0)
  
  const { name, contact } = window.customerData;

  const itemsHTML = cart.map(item => {
    const lpfpmNum   = parseInt(item.lpfpm  || 0)
    const sebarNum   = parseInt(item.sebar  || 0)
    const hariNum    = parseInt(item.hari   || 0)
    const basePerSebar = item.type === 'custom' ? (lpfpmNum / 50) * 100 : 0
    const baseTotal    = item.type === 'custom' ? basePerSebar * sebarNum * hariNum : item.price
    const ssFee        = item.type === 'custom' && item.ss === 'panjang' && lpfpmNum > 50
      ? (lpfpmNum / 100) * 25 * sebarNum * hariNum : 0
    const inrushFee    = item.type === 'custom' ? (item.inrush || 0) * 100 : 0

    return `
      <div class="rcpt-dots" style="margin:6px 0"></div>

      <div class="rcpt-item-row">
        <span>${item.type === 'custom'
          ? `Jaseb ${sebarNum}× sebar ${hariNum} hari`
          : item.name} ×${item.quantity}</span>
        <span>${fmt(item.price * item.quantity)}</span>
      </div>

      ${item.type === 'custom' ? `
        <div class="rcpt-item-note">${lpfpmNum} lpfpm · ${fmt(basePerSebar)}/sebar</div>

        ${item.ss !== 'tidak' ? `
        <div class="rcpt-item-row" style="font-size:11px; color:#888">
          <span>Screenshot ${item.ss}</span>
          <span>${item.ss === 'panjang' ? fmt(ssFee * item.quantity) : 'gratis'}</span>
        </div>` : ''}

        ${item.inrush > 0 ? `
        <div class="rcpt-item-row" style="font-size:11px; color:#888">
          <span>Inrush ${item.inrush} jam</span>
          <span>${fmt(inrushFee * item.quantity)}</span>
        </div>` : ''}
      ` : `
        
      `}
    `
  }).join('')

  const waMsg = encodeURIComponent(
    `Halo kak, mau order!\nOrder ID: ${code}\nTanggal: ${tgl} ${jam}\n\n` +
    cart.map(i => {
      const base = i.type === 'custom'
        ? `${i.lpfpm} lpfpm · ${i.sebar}x sebar · ${i.hari} hari · SS: ${i.ss}` + (i.inrush > 0 ? ` · Inrush ${i.inrush}j` : '')
        :  ''
      return `• ${i.name} ×${i.quantity} — ${fmt(i.price * i.quantity)}\n  ${base}`
    }).join('\n') +
    `\n\nTotal: ${fmt(total)}`
  )

  document.getElementById('receipt-content').innerHTML = `
    <div class="receipt-card">
      <div class="rcpt-head">
        <div class="rcpt-brand">Bandit's Store</div>
        <div class="rcpt-sub">wa.me/6285863714376</div>
      </div>
      <div class="rcpt-dots"></div>
      <div class="rcpt-meta">
      <div class="rcpt-meta-row" style="color: #000; font-weight: bold;"><span>Pemesan</span><span>${name}</span></div>
        <div class="rcpt-meta-row"><span>Kontak</span><span>${contact}</span></div>
        <div class="rcpt-dots" style="margin: 5px 0; border-style: none none dashed none;"></div>
        <div class="rcpt-meta-row"><span>Order</span><span>${code}</span></div>
        <div class="rcpt-meta-row"><span>Tanggal</span><span>${tgl} ${jam}</span></div>
        <div class="rcpt-meta-row"><span>Total item</span><span>${totalQty} item</span></div>
      </div>
      <div class="rcpt-dots"></div>
      <div class="rcpt-table-head">
        <span>Item</span><span>Harga</span>
      </div>
      ${itemsHTML}
      <div class="rcpt-dots" style="margin-top:8px"></div>
      <div class="rcpt-total-row">
        <span>TOTAL</span><span>${fmt(total)}</span>
      </div>
      <div class="rcpt-dots"></div>
      <div class="rcpt-footer">Terimakasih sudah order!<br>Silahkan lanjutkan proses pemesanan di WhatsApp</div>
    </div>
    <button class="btn-wa" onclick="downloadAndWA('${waMsg}')">
        <i class="bi bi-whatsapp"></i> Simpan & Kirim ke WhatsApp
    </button>
    <button class="btn-back-cart" onclick="switchTab('cart')">← Kembali ke keranjang</button>
  `
}

/* async function downloadReceipt() {
  const el = document.querySelector('.receipt-card')

  const canvas = await html2canvas(el, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true
  })

  const link = document.createElement('a')
  link.download = `receipt-BNDT-${Date.now().toString().slice(-6)}.jpg`
  link.href = canvas.toDataURL('image/jpeg', 0.95)
  link.click()
} */

const BOT_TOKEN = '8804770054:AAFj7Z7NKT1NRlyVdJmlkf07OZJAxZ2J6_0'
const CHAT_ID   = '5825458189'

async function downloadAndWA(waMsg) {
  const total  = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const code   = 'BNDT-' + Date.now().toString().slice(-6)

  const el     = document.querySelector('.receipt-card')
  const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 })

  await Promise.all([
    // _downloadFromCanvas(canvas, code),
    _kirimTelegramFromCanvas(canvas, code, total)
  ])

  setTimeout(() => {
    window.open(`https://wa.me/6285863714376?text=${waMsg}`, '_blank')
  }, 500)
}

function _downloadFromCanvas(canvas, code) {
  const link    = document.createElement('a')
  link.download = `receipt-${code}.jpg`
  link.href     = canvas.toDataURL('image/jpeg', 0.95)
  link.click()
}

async function _kirimTelegramFromCanvas(canvas, code, total) {
  try {
    const blob  = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95))
    const items = cart.map(i =>
      `• ${i.name} ×${i.quantity} — ${fmt(i.price * i.quantity)}` +
      (i.type === 'custom'
        ? `\n  ${i.lpfpm} lpfpm · ${i.sebar}x sebar · ${i.hari} hari · SS: ${i.ss}` +
          (i.inrush > 0 ? ` · Inrush ${i.inrush}j` : '')
        : '')
    ).join('\n')

    const formData = new FormData()
    formData.append('chat_id', CHAT_ID)
    formData.append('photo', blob, `receipt-${code}.jpg`)
    formData.append('caption',
      `🛒 *Order Baru!*\n` +
      `Pemesan: ${window.customerData.name}\n` +
      `Kontak: ${window.customerData.contact}\n` +
      `Order ID: \`${code}\`\n` +
      `Tanggal: ${new Date().toLocaleString('id-ID')}\n\n` +
      `${items}\n\n` +
      `*Total: ${fmt(total)}*`
    )
    formData.append('parse_mode', 'Markdown')

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body:   formData
    })

    const resJson = await res.json()
console.log('Telegram response:', resJson)

    return res.ok
  } catch(e) {
    console.error('Telegram error:', e)
    return false
  }
}
// helper format rupiah (kalau belum ada)
const fmt = n => 'Rp ' + Math.round(n).toLocaleString('id-ID')
