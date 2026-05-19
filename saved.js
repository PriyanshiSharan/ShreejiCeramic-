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
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return { datePart: dateStr, timePart: '' };
        const options = { day: 'numeric', month: 'short' };
        const datePart = d.toLocaleDateString('en-GB', options);
        const timePart = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        return { datePart, timePart };
    } catch (e) {
        return { datePart: dateStr, timePart: '' };
    }
}

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentBrand = urlParams.get('brand') || 'aquant';
    
    let saved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    
    // DEMO INJECTION: If the boss opens this and has no quotes, inject these fake ones automatically
    if (saved.length === 0) {
        saved = [
            {
                id: "QT-2002",
                brand: "aquant",
                date: new Date().toISOString(),
                clientName: "Sheldon Cooper",
                phone: "9876543210",
                preparedBy: "Admin",
                totalAmount: 96996,
                itemsCount: 2,
                items: [
                    { modelNumber: "1860 (Smart Toilet)", qty: 1, disc: 15 },
                    { modelNumber: "Concealed Valve", qty: 2, disc: 10 }
                ]
            },
            {
                id: "QT-6715",
                brand: "aquant",
                date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                clientName: "Walk-in Client",
                phone: "",
                preparedBy: "Sales Team",
                totalAmount: 24603,
                itemsCount: 1,
                items: [
                    { modelNumber: "Ceramic Wash Basin", qty: 3, disc: 0 }
                ]
            }
        ];
        localStorage.setItem('savedQuotes', JSON.stringify(saved));
    }
    
    // Filter by brand
    allSaved = saved.filter(q => {
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
        const formatted = formatDate(quote.date);
        
        // Build items HTML
        let itemsHtml = `<div class="timeline-items" id="items-${quote.id}" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border-color);">`;
        if (quote.items && quote.items.length > 0) {
            itemsHtml += `<table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">
                            <tr style="color: var(--text-muted); text-align: left;">
                                <th style="padding-bottom: 0.5rem; font-weight: 500;">Model Number</th>
                                <th style="padding-bottom: 0.5rem; font-weight: 500; text-align: center;">Qty</th>
                                <th style="padding-bottom: 0.5rem; font-weight: 500; text-align: right;">Disc.</th>
                            </tr>`;
            quote.items.forEach(item => {
                itemsHtml += `<tr>
                                <td style="padding: 0.25rem 0; font-weight: 500; color: var(--text-main);">${item.modelNumber || 'Unknown'}</td>
                                <td style="padding: 0.25rem 0; text-align: center;">${item.qty || 1}</td>
                                <td style="padding: 0.25rem 0; text-align: right;">${item.disc ? item.disc + '%' : '-'}</td>
                              </tr>`;
            });
            itemsHtml += `</table>`;
        } else {
            itemsHtml += `<div style="font-size: 0.85rem; color: var(--text-muted);">No items details found.</div>`;
        }
        itemsHtml += `</div>`;

        html += `
            <div class="timeline-row">
                <div class="timeline-left">
                    <div class="timeline-date">${formatted.datePart}</div>
                    <div class="timeline-time">${formatted.timePart}</div>
                </div>
                <div class="timeline-card" style="cursor: pointer;" onclick="toggleItems('${quote.id}')">
                    <div style="display: flex; align-items: center; width: 100%;">
                        <div class="timeline-avatar" style="background-color: ${color};">${initial}</div>
                        <div class="timeline-content">
                            <div class="timeline-client">${quote.clientName || 'Unnamed Client'}</div>
                            <div class="timeline-meta">ID: ${quote.id || 'N/A'}</div>
                        </div>
                        <div class="timeline-actions">
                            <div class="timeline-price">₹${quote.totalAmount ? quote.totalAmount.toLocaleString('en-IN', {maximumFractionDigits:0}) : '0'}</div>
                            <button class="icon-btn edit-btn" onclick="event.stopPropagation(); viewQuote('${quote.id}')" title="Edit">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button class="icon-btn delete-btn" onclick="event.stopPropagation(); removeQuote('${quote.id}')" title="Delete">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>
                    ${itemsHtml}
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
    init(); // Re-render list
}

function toggleItems(quoteId) {
    const el = document.getElementById('items-' + quoteId);
    if (el) {
        if (el.style.display === 'none') {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    }
}

function viewQuote(id) {
    // Redirect to quote page with the ID to load
    const urlParams = new URLSearchParams(window.location.search);
    const brand = urlParams.get('brand') || 'aquant';
    window.location.href = `quote.html?brand=${brand}&view=${id}`;
}

init();

