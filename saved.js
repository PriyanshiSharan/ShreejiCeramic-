const container = document.getElementById('savedQuotesContainer');
const emptyState = document.getElementById('emptyState');

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentBrand = urlParams.get('brand') || 'aquant';
    
    let saved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    
    // Filter by brand
    saved = saved.filter(q => {
        // Handle legacy quotes (default to aquant)
        if (!q.brand) return currentBrand === 'aquant';
        return q.brand === currentBrand;
    });
    
    if (saved.length === 0) {
        container.innerHTML = ''; // Clear previous if any
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    let html = '';
    // Reverse array to show newest first!
    saved.reverse().forEach(quote => {
        html += `
            <div class="quote-form-card" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 1rem;">
                    <div>
                        <div style="font-size: 0.85rem; color: var(--text-light); font-weight: 600; margin-bottom: 0.25rem;">${quote.id}</div>
                        <h3 style="font-size: 1.1rem; color: var(--text-main); margin: 0;">${quote.clientName}</h3>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--text-muted);">
                    <div><strong>Date:</strong> ${quote.date}</div>
                    <div><strong>Prepared By:</strong> ${quote.preparedBy}</div>
                    <div><strong>Items:</strong> ${quote.itemsCount} products</div>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-light); font-weight: 600;">TOTAL AMOUNT</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary-blue);">₹${quote.totalAmount.toLocaleString('en-IN', {maximumFractionDigits:0})}</div>
                    </div>
                    
                    <div style="display:flex; gap: 0.75rem;">
                        <button class="remove-btn" style="background: #fee2e2; border: none; padding: 0.5rem; border-radius: 8px;" onclick="removeQuote('${quote.id}')">
                            <svg width="20" height="20" fill="none" stroke="#dc2626" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                        <button class="save-quote-btn" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="viewQuote('${quote.id}')">
                            View & Edit
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function removeQuote(id) {
    if(!confirm("Are you sure you want to delete this quotation?")) return;
    let saved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    saved = saved.filter(q => q.id !== id);
    localStorage.setItem('savedQuotes', JSON.stringify(saved));
    init();
}

function viewQuote(id) {
    // Redirect to quote page with the ID to load
    const urlParams = new URLSearchParams(window.location.search);
    const brand = urlParams.get('brand') || 'aquant';
    window.location.href = `quote.html?brand=${brand}&view=${id}`;
}

init();
