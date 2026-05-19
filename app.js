// Product data is now loaded from data.js as productDatabase
// which is dynamically generated from the PDF extraction.


// Formatting utility for Indian Rupees
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const productResultContainer = document.getElementById('productResult');
const quoteCountEl = document.getElementById('quoteCount');

// State
let quoteItems = [];

// Event Listeners
searchInput.addEventListener('input', handleSearch);

function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    
    // Clear display if query is empty
    if (query === '') {
        renderEmptyState();
        return;
    }

    // Filter logic
    const foundProduct = productDatabase.find(product => 
        product.modelNumber.toLowerCase() === query || 
        product.modelNumber.toLowerCase().replace(/\s+/g, '') === query.replace(/\s+/g, '')
    );

    if (foundProduct) {
        renderProductCard(foundProduct);
    } else {
        renderNotFoundState(query);
    }
}

function renderEmptyState() {
    productResultContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>Type a model number to find products</p>
            <small style="color: var(--text-secondary); margin-top: 5px;">Try: 2634 AB, 2638 AB, etc.</small>
        </div>
    `;
}

function renderNotFoundState(query) {
    productResultContainer.innerHTML = `
        <div class="error-state">
            <div class="error-icon">😕</div>
            <h3>Product not found</h3>
            <p>We couldn't find a model matching "<strong>${query}</strong>".</p>
        </div>
    `;
}

function renderProductCard(product) {
    // Generate the HTML for the product card
    const cardHtml = `
        <article class="product-card">
            <div class="product-image-container">
                <!-- Using an onerror fallback nicely for testing if local image doesn't exist yet -->
                <img src="images/${product.image}" alt="${product.modelNumber}" class="product-img" 
                     onerror="this.onerror=null; this.outerHTML='<div class=\\'img-placeholder\\'><span>🖼️</span><p>Image: images/${product.image}</p></div>'">
            </div>
            <div class="product-details">
                <div class="product-meta">
                    <span class="product-model">Model: ${product.modelNumber}</span>
                    <span class="product-price">${formatCurrency(product.price)}</span>
                </div>
                <h3 class="product-title">${product.description}</h3>
                
                <div class="product-attributes">
                    <div class="attribute">
                        <span class="attr-label">Finish</span>
                        <span class="attr-value">${product.finish}</span>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="add-btn" onclick="addToQuote('${product.modelNumber}')">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add to Quote
                    </button>
                </div>
            </div>
        </article>
    `;

    productResultContainer.innerHTML = cardHtml;
}

// Global scope function for the inline onclick handler
window.addToQuote = function(modelNumber) {
    if(!quoteItems.includes(modelNumber)){
        quoteItems.push(modelNumber);
        updateQuotePill();
        
        // Visual feedback
        const btn = document.querySelector('.add-btn');
        const originalText = btn.innerHTML;
        btn.style.backgroundColor = '#10b981'; // Success green
        btn.innerHTML = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Added to Quote
        `;
        
        setTimeout(() => {
            btn.style.backgroundColor = '';
            btn.innerHTML = originalText;
        }, 2000);
    }
};

function updateQuotePill() {
    quoteCountEl.textContent = quoteItems.length;
    // Add a tiny bump animation
    quoteCountEl.style.transform = 'scale(1.2)';
    setTimeout(() => {
        quoteCountEl.style.transform = 'scale(1)';
    }, 200);
}

// Initial render
renderEmptyState();
