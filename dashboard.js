// Dashboard Logic - Enhanced with Detail Modal & Extras Linking
const gridContainer = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const countEl = document.getElementById('totalCount');
const modal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');

let selectedItems = new Set(); // Store modelNumbers

// Extras Configuration
const productExtras = {
    "1860": ["Extra-INT-Seat-Luxe", "Extra-INT-Remote"],
    "1850 W": ["1506", "Extra-INT-Seat-Elite", "Extra-INT-Remote", "Extra-Doorbell"],
    "1870 W": ["Extra-INT-Seat-Ritz", "Extra-Doorbell-Ritz", "Extra-INT-Remote-Ritz"],
    "1861": ["Extra-INT-Seat-Bloom", "Extra-INT-Remote-Bloom"]
};

// Format Currency
const formatIndCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Category Badge Logic
const getCategoryBadge = (product) => {
    if (product.cat) return product.cat.toUpperCase();
    const modelNumber = product.modelNumber;
    if(modelNumber.startsWith('26')) return 'IMPERIA SERIES';
    if(modelNumber.startsWith('19')) return 'CLASSICAL CERAMICS';
    if(modelNumber.startsWith('13')) return 'PRESTIGE COLLECTION';
    if(modelNumber.startsWith('25')) return 'HERITAGE SERIES';
    if(modelNumber.startsWith('18')) return 'CLASSICAL TOILETS';
    return currentBrand === 'kohler' ? 'KOHLER LUXURY' : 'AQUANT SERIES';
};

const brandTitleEl = document.querySelector('.header-brand');
const urlParams = new URLSearchParams(window.location.search);
let currentBrand = urlParams.get('brand') || 'aquant';

function init() {
    const currentCat = urlParams.get('cat');

    // Filter database by brand AND category (if present)
    let brandProducts = productDatabase.filter(p => {
        if (!p.brand) return currentBrand === 'aquant'; 
        return p.brand.toLowerCase() === currentBrand.toLowerCase();
    });

    if (currentCat) {
        brandProducts = brandProducts.filter(p => p.cat === currentCat);
        // Highlight active category link
        document.querySelectorAll('.nav-item').forEach(nav => {
            if (nav.href.includes(`cat=${encodeURIComponent(currentCat)}`)) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });
    }

    renderGrid(brandProducts);
    searchInput.addEventListener('input', (e) => handleSearch(e, brandProducts));
    closeModalBtn.addEventListener('click', closeProductDetails);
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeProductDetails();
    });

    // Populate selectedItems from localStorage
    const savedQuotes = JSON.parse(localStorage.getItem('quoteIds') || '[]');
    savedQuotes.forEach(id => selectedItems.add(id));
}

function handleSearch(e, products) {
    const query = e.target.value.toLowerCase().trim();
    const filtered = products.filter(p => 
        p.modelNumber.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
    renderGrid(filtered);
}

function toggleQuote(e, modelNumber) {
    if(e) e.stopPropagation(); // Prevent opening modal
    
    if(selectedItems.has(modelNumber)) {
        selectedItems.delete(modelNumber);
    } else {
        selectedItems.add(modelNumber);
    }
    
    localStorage.setItem('quoteIds', JSON.stringify(Array.from(selectedItems)));
    
    // Refresh the specific buttons/cards without full re-render
    const filteredByBrand = productDatabase.filter(p => {
        if (!p.brand) return currentBrand === 'aquant';
        return p.brand.toLowerCase() === currentBrand.toLowerCase();
    });

    renderGrid(filteredByBrand.filter(p => {
        const q = searchInput.value.toLowerCase().trim();
        return p.modelNumber.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }));
}

function showProductDetails(modelNumber) {
    const product = productDatabase.find(p => p.modelNumber === modelNumber);
    if(!product) return;

    const badge = getCategoryBadge(product);
    const extras = productExtras[modelNumber] || [];
    
    let extrasHtml = '';
    if(extras.length > 0) {
        extrasHtml = `
            <div class="extras-section">
                <h3 class="extras-title">Essential Extras for ${modelNumber}</h3>
                <div class="extras-grid">
                    ${extras.map(extraCode => {
                        const extraItem = productDatabase.find(p => p.modelNumber === extraCode);
                        if(!extraItem) return '';
                        const isExtraSelected = selectedItems.has(extraCode);
                        return `
                            <div class="extra-card">
                                <div class="extra-img">
                                    <img src="images/${extraItem.image}" alt="${extraCode}">
                                </div>
                                <div class="extra-code">${extraCode}</div>
                                <div class="extra-name">${extraItem.description}</div>
                                <div class="extra-price">Price: ${formatIndCurrency(extraItem.price)}</div>
                                <button class="btn-add-extra ${isExtraSelected ? 'added' : ''}" 
                                        onclick="toggleQuote(event, '${extraCode}'); showProductDetails('${modelNumber}');">
                                    ${isExtraSelected ? '✓ Added' : '+ Add to Quote'}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    const isSelected = selectedItems.has(modelNumber);


    let detailedSpecsHtml = '';
    if(product.detailedSpecs) {
        const ds = product.detailedSpecs;
        detailedSpecsHtml = `
            <div class="detailed-specs-container">
                <div class="specs-header">
                    <div class="specs-title">${ds.title}</div>
                    <div class="specs-subtitle">${ds.subtitle}</div>
                </div>
                
                <div class="specs-section">
                    <div class="specs-section-title">Description:</div>
                    <ul class="specs-list">
                        ${ds.functions.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>

                <div class="specs-meta-grid">
                    ${ds.size ? `
                        <div class="specs-meta-row">
                            <span class="specs-meta-label">Size:</span> ${ds.size}
                        </div>
                    ` : ''}
                    ${ds.trap ? `
                        <div class="specs-meta-row">
                            <span class="specs-meta-label">${ds.trap}</span>
                        </div>
                    ` : ''}
                    ${ds.mrp ? `
                        <div class="specs-meta-row">
                            <span class="specs-meta-label">MRP:</span> ${ds.mrp}
                        </div>
                    ` : ''}
                </div>

                <div class="specs-footer-note">
                    ${ds.footerNote}
                </div>
            </div>
        `;
    }

    modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-image-box">
                <img id="mainDetailImage" src="images/${product.image}" alt="${product.modelNumber}">
                ${product.gallery ? `
                    <div class="modal-gallery">
                        ${product.gallery.map((img, idx) => `
                            <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="switchMainImage(this, 'images/${img}')">
                                <img src="images/${img}" alt="Thumb ${idx}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="detail-info">
                <div class="detail-category">${badge}</div>
                <h1 class="detail-title">${product.description}</h1>
                <div class="detail-spec">
                    Model: ${product.modelNumber}<br>
                    Category: ${product.cat || 'Premium Sanitaryware'}<br>
                    Specification: ${product.finish || 'Standard White'}
                </div>
                <div class="detail-price-box">
                    <div class="mrp-label">MRP (Incl. of all taxes)</div>
                    <div class="detail-price">${formatIndCurrency(product.price)}</div>
                </div>
                <button class="btn-add-quote ${isSelected ? 'added' : ''}" onclick="toggleQuote(event, '${product.modelNumber}'); showProductDetails('${modelNumber}');">
                    ${isSelected ? '✓ Added to Quote' : '+ Add to Quotation List'}
                </button>
            </div>
        </div>
        ${detailedSpecsHtml}
        ${extrasHtml}
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function switchMainImage(thumb, imgSrc) {
    const mainImg = document.getElementById('mainDetailImage');
    if (mainImg) {
        mainImg.src = imgSrc;
    }
    // Update active state
    thumb.parentElement.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

function closeProductDetails() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function renderGrid(products) {
    countEl.textContent = products.length;
    
    if (products.length === 0) {
        gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 4rem; color: #6b7280;">No products match your search.</p>`;
        return;
    }

    let html = '';
    products.forEach((product) => {
        const isSelected = selectedItems.has(product.modelNumber);
        const badge = getCategoryBadge(product);
        
        html += `
            <div class="product-card ${isSelected ? 'selected' : ''}" onclick="showProductDetails('${product.modelNumber}')">
                <div class="card-badge">${badge}</div>
                
                <div class="card-add-btn ${isSelected ? 'added' : ''}" onclick="toggleQuote(event, '${product.modelNumber}')" title="Add to Quote">
                    ${isSelected ? '✓' : '+'}
                </div>
                
                <div class="card-image">
                    <img src="images/${product.image}" alt="${product.modelNumber}" loading="lazy" 
                         onerror="this.onerror=null; this.outerHTML='<span style=\\'color:#9ca3af;font-size:3rem;\\'>🖼️</span>'">
                </div>
                
                <div class="card-code">${product.modelNumber}</div>
                <div class="card-title">${product.description}</div>
                
                <div class="card-footer">
                    <div class="mrp-label">MRP</div>
                    <div class="card-price">${formatIndCurrency(product.price)}</div>
                </div>
            </div>
        `;
    });
    
    gridContainer.innerHTML = html;
}

init();
