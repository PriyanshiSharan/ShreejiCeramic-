const container = document.getElementById('savedQuotesContainer');
const emptyState = document.getElementById('emptyState');
const countPill = document.getElementById('historyCountPill');
const searchInput = document.getElementById('historySearch');

let allSaved = [];

function getAvatarColor(name) {
    if (!name) return '#64748b';
    const colors = ['#ec4899', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function formatDate(dateStr) {
    // Attempt to format date nicely, fallback to string
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const options = { day: 'numeric', month: 'short' };
        const datePart = d.toLocaleDateString('en-GB', options);
        const timePart = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        return `${datePart} • ${timePart}`;
    } catch (e) {
        return dateStr;
    }
}

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentBrand = urlParams.get('brand') || 'aquant';
    
    let saved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    
    // Filter by brand
    allSaved = saved.filter(q => {
        // Handle legacy quotes (default to aquant)
        if (!q.brand) return currentBrand === 'aquant';
        return q.brand === currentBrand;
    });
    
    // Re-render
    renderList(allSaved);
}

function renderList(quotes) {
    if (countPill) countPill.innerText = `${quotes.length} files`;
    
    if (quotes.length === 0) {
        container.innerHTML = ''; 
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    let html = '<div class="history-section-header">OLDER</div>';
    
    // Reverse array to show newest first
    const displayQuotes = [...quotes].reverse();
    
    displayQuotes.forEach(quote => {
        const initial = (quote.clientName && quote.clientName.length > 0) ? quote.clientName.charAt(0).toUpperCase() : '?';
        const color = getAvatarColor(quote.clientName || '?');
        const formattedDate = formatDate(quote.date);
        
        html += `
            <div class="history-item">
                <div class="history-item-left">
                    <div class="avatar-circle" style="background-color: ${color};">${initial}</div>
                    <div class="history-info">
                        <div class="history-client">${quote.clientName || 'Unnamed Client'}</div>
                        <div class="history-date">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            ${formattedDate}
                        </div>
                    </div>
                </div>
                
                <div class="history-item-right">
                    <div class="history-price">₹${quote.totalAmount ? quote.totalAmount.toLocaleString('en-IN', {maximumFractionDigits:0}) : '0'}</div>
                    <button class="icon-btn edit-btn" onclick="viewQuote('${quote.id}')" title="Edit">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button class="icon-btn delete-btn" onclick="removeQuote('${quote.id}')" title="Delete">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allSaved.filter(q => 
            (q.clientName && q.clientName.toLowerCase().includes(query)) ||
            (q.id && q.id.toLowerCase().includes(query))
        );
        renderList(filtered);
    });
}

function removeQuote(id) {
    if(!confirm("Are you sure you want to delete this quotation?")) return;
    let saved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    saved = saved.filter(q => q.id !== id);
    localStorage.setItem('savedQuotes', JSON.stringify(saved));
    init(); // re-init to update counts and list
}

function viewQuote(id) {
    // Redirect to quote page with the ID to load
    const urlParams = new URLSearchParams(window.location.search);
    const brand = urlParams.get('brand') || 'aquant';
    window.location.href = `quote.html?brand=${brand}&view=${id}`;
}

init();

