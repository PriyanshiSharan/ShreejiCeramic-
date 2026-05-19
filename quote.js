const tbody = document.getElementById('quoteTableBody');

// Load selected Ids
const selectedIds = JSON.parse(localStorage.getItem('quoteIds') || '[]');

let quoteItems = [];
if (selectedIds.length > 0 && typeof productDatabase !== 'undefined') {
    quoteItems = productDatabase.filter(p => selectedIds.includes(p.modelNumber));
}

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewId = urlParams.get('view');

    if (viewId) {
        const saved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
        const quote = saved.find(q => q.id === viewId);
        
        if (quote) {
            // Populate form fields
            const nameField = document.getElementById('clientName');
            const phoneField = document.getElementById('clientPhone');
            const prepField = document.getElementById('preparedBy');
            const gstCheck = document.getElementById('applyGst');

            if(nameField) nameField.value = quote.clientName || '';
            if(phoneField) phoneField.value = quote.phone || '';
            if(prepField) prepField.value = quote.preparedBy || '';
            if(gstCheck) gstCheck.checked = !!quote.gstApplied;

            // Load products
            const modelNumbers = quote.items.map(i => i.modelNumber);
            quoteItems = productDatabase.filter(p => modelNumbers.includes(p.modelNumber));
            
            renderTable();

            // Apply item-specific data (qty, disc, room) after rendering
            quote.items.forEach(savedItem => {
                const row = document.querySelector(`tr[data-model="${savedItem.modelNumber}"]`);
                if (row) {
                    row.querySelector('.item-qty').value = savedItem.qty;
                    row.querySelector('.item-disc').value = savedItem.disc;
                    row.querySelector('.item-room').value = savedItem.room || '';
                }
            });
            calculateTotals();
        } else {
            renderTable();
        }
    } else {
        renderTable();
    }
}

function renderTable() {
    if (quoteItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#9ca3af;padding:2rem;">No items added to quote yet.</td></tr>`;
        return;
    }

    let html = '';
    quoteItems.forEach(item => {
        const price = item.price > 0 ? item.price : 12500;
        
        html += `
            <tr data-model="${item.modelNumber}">
                <td style="font-weight:600;color:var(--text-muted);">${item.modelNumber}</td>
                <td style="font-weight:600;">${item.description.split(' ').slice(0,4).join(' ')}</td>
                <td style="color:var(--text-light);">${item.finish || 'Standard'}</td>
                <td class="qty-col">
                    <div class="qty-control">
                        <div class="qty-btn" onclick="changeQty('${item.modelNumber}', -1)">−</div>
                        <input type="number" class="item-qty" value="1" min="1" readonly>
                        <div class="qty-btn" onclick="changeQty('${item.modelNumber}', 1)">+</div>
                    </div>
                </td>
                <td class="item-price" data-price="${price}">₹${price.toLocaleString('en-IN')}</td>
                <td><input type="number" class="item-disc" value="0" style="width:40px;text-align:center;border:1px solid #e5e7eb;border-radius:4px;" onchange="calculateTotals()" onkeyup="calculateTotals()"></td>
                <td style="font-weight:700;" class="item-total">₹${price.toLocaleString('en-IN')}</td>
                <td><input type="text" class="item-room" placeholder="e.g. Master Bath" style="width:100%;border:none;border-bottom:1px solid #e5e7eb;outline:none;"></td>
                <td style="text-align:center;">
                    <div class="remove-btn" onclick="removeItem('${item.modelNumber}')">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Wire up GST checkbox
    const gstCheck = document.getElementById('applyGst');
    if (gstCheck) {
        gstCheck.addEventListener('change', calculateTotals);
    }
    
    calculateTotals();
}

function changeQty(model, delta) {
    const row = document.querySelector(`tr[data-model="${model}"]`);
    if(!row) return;
    const input = row.querySelector('.item-qty');
    let val = parseInt(input.value) || 1;
    val += delta;
    if(val < 1) val = 1;
    input.value = val;
    calculateTotals();
}

function removeItem(model) {
    if(!confirm("Remove this item from the quote?")) return;
    
    // Update state
    quoteItems = quoteItems.filter(item => item.modelNumber !== model);
    
    // Update storage
    const selectedIds = JSON.parse(localStorage.getItem('quoteIds') || '[]');
    const newIds = selectedIds.filter(id => id !== model);
    localStorage.setItem('quoteIds', JSON.stringify(newIds));
    
    // Re-render
    renderTable();
}

function calculateTotals() {
    let subtotal = 0;
    
    document.querySelectorAll('#quoteTableBody tr').forEach(row => {
        const price = parseFloat(row.querySelector('.item-price').getAttribute('data-price'));
        const qty = parseFloat(row.querySelector('.item-qty').value) || 1;
        const discStr = row.querySelector('.item-disc').value;
        const disc = discStr ? parseFloat(discStr) : 0;
        
        const lineTotal = price * qty * (1 - disc / 100);
        subtotal += lineTotal;
        
        row.querySelector('.item-total').innerText = '₹' + lineTotal.toLocaleString('en-IN', {maximumFractionDigits:0});
    });

    const isGstApplied = document.getElementById('applyGst').checked;
    const gstAmount = isGstApplied ? subtotal * 0.18 : 0;
    const grandTotal = subtotal + gstAmount;

    // Update UI Summary
    const subEl = document.getElementById('summary-subtotal');
    const gstEl = document.getElementById('summary-gst');
    const totEl = document.getElementById('summary-total');
    
    if (subEl) subEl.innerText = '₹' + subtotal.toLocaleString('en-IN', {maximumFractionDigits:0});
    if (gstEl) gstEl.innerText = '₹' + gstAmount.toLocaleString('en-IN', {maximumFractionDigits:0});
    if (totEl) totEl.innerText = '₹' + grandTotal.toLocaleString('en-IN', {maximumFractionDigits:0});
}

init();

// Actions
function saveQuote() {
    if (quoteItems.length === 0) {
        alert("Please add items to quote first!");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const brand = urlParams.get('brand') || 'aquant';

    const payload = {
        id: "QT-" + Math.floor(1000 + Math.random() * 9000),
        brand: brand,
        date: new Date().toISOString(),
        clientName: document.getElementById('clientName').value || "Walk-in Client",
        phone: document.getElementById('clientPhone').value,
        preparedBy: document.getElementById('preparedBy').value,
        totalAmount: 0,
        itemsCount: quoteItems.length
    };

    const itemsData = [];
    let grandTotal = 0;
    document.querySelectorAll('#quoteTableBody tr').forEach(row => {
        const model = row.getAttribute('data-model');
        const price = parseFloat(row.querySelector('.item-price').getAttribute('data-price'));
        const qty = parseFloat(row.querySelector('.item-qty').value) || 1;
        const discStr = row.querySelector('.item-disc').value;
        const disc = discStr ? parseFloat(discStr) : 0;
        const room = row.querySelector('.item-room').value;
        
        const discounted = price - (price * disc / 100);
        grandTotal += (discounted * qty);

        itemsData.push({
            modelNumber: model,
            qty: qty,
            disc: disc,
            room: room
        });
    });

    if (document.getElementById('applyGst').checked) {
        grandTotal *= 1.18;
    }
    
    payload.totalAmount = grandTotal;
    payload.items = itemsData;
    payload.gstApplied = document.getElementById('applyGst').checked;

    const saved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    saved.push(payload);
    localStorage.setItem('savedQuotes', JSON.stringify(saved));
    
    // Clear cart and redirect
    localStorage.removeItem('quoteIds');
    alert("Quote saved successfully!");
    window.location.href = `saved.html?brand=${brand}`;
}

function getPDFOptions() {
    return {
        margin:       10,
        filename:     'Aquant_Quotation.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
}

function prepareForCapture() {
    document.getElementById('quoteTableSearch').style.display = 'none';
    // optionally hide inputs and replace with raw text for cleaner PDF
}

function restoreAfterCapture() {
    document.getElementById('quoteTableSearch').style.display = 'block';
}

function downloadPDF() {
    prepareForCapture();
    const element = document.getElementById('quote-document');
    html2pdf().set(getPDFOptions()).from(element).save().then(() => {
        restoreAfterCapture();
    });
}

function previewPDF() {
    // Basic print preview wrapper for now, triggers native browser print dialog
    prepareForCapture();
    const actions = document.querySelector('.table-footer-actions');
    const sidebar = document.querySelector('.sidebar');
    const header = document.querySelector('.top-header');
    
    // temporarily hide shell 
    if(sidebar) sidebar.style.display = 'none';
    if(header) header.style.display = 'none';
    if(actions) actions.style.display = 'none';
    document.querySelector('.main-area').style.marginLeft = '0';
    
    window.print();
    
    // restore
    if(sidebar) sidebar.style.display = 'block';
    if(header) header.style.display = 'flex';
    if(actions) actions.style.display = 'flex';
    document.querySelector('.main-area').style.marginLeft = '';
    restoreAfterCapture();
}
