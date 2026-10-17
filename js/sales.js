/**
 * AS COMPUTER SHOP MANAGEMENT SYSTEM - FRONTEND
 * js/sales.js - Memo & Sales Entry
 */
const SalesView = {
  cart: [],

  render: async function() {
    const container = document.getElementById("main-view");
    if (!container) return;

    const products = State.products.length > 0 ? State.products : (await DB.getAll("products"));
    const services = State.services.length > 0 ? State.services : (await DB.getAll("services"));
    const customers = State.customers.length > 0 ? State.customers : (await DB.getAll("customers"));

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700;">New Sale & Memo Entry</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Issue invoices, digital services & product sales</p>
        </div>
        <button class="btn btn-secondary" onclick="SalesView.resetForm()">Clear Form</button>
      </div>

      <div class="grid-2">
        <!-- Left: Line items entry -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Add Items / Services</h3>
          </div>

          <!-- Services dropdown: Must display ONLY the service name, WITHOUT appended price -->
          <div class="form-group">
            <label class="form-label">Digital Service (Passport, NID, Printing, etc.)</label>
            <div style="display: flex; gap: 0.5rem;">
              <select id="service-select" class="form-control">
                <option value="">-- Select Service --</option>
                ${services.map(s => `<option value="${s.service_id}" data-rate="${s.default_rate}" data-name="${s.service_name}">${s.service_name}</option>`).join('')}
              </select>
              <button class="btn btn-primary" onclick="SalesView.addServiceLine()">Add Service</button>
            </div>
          </div>

          <!-- Product selector -->
          <div class="form-group" style="margin-top: 1rem;">
            <label class="form-label">Product / Hardware Accessory</label>
            <div style="display: flex; gap: 0.5rem;">
              <select id="product-select" class="form-control">
                <option value="">-- Select Product --</option>
                ${products.map(p => `<option value="${p.product_id}" data-rate="${p.selling_price}" data-name="${p.product_name}" data-stock="${p.stock_quantity}">${p.product_name} (Stock: ${p.stock_quantity})</option>`).join('')}
              </select>
              <button class="btn btn-secondary" onclick="SalesView.addProductLine()">Add Product</button>
            </div>
          </div>

          <!-- Cart Items Table -->
          <div class="table-responsive" style="margin-top: 1.25rem;">
            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="width: 75px;">Qty</th>
                  <th style="width: 100px;">Rate</th>
                  <th style="width: 90px;">Total</th>
                  <th style="width: 40px;"></th>
                </tr>
              </thead>
              <tbody id="cart-table-body">
                <tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 1.5rem;">No items added to invoice yet</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Billing & Customer Details -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Customer & Payment Summary</h3>
          </div>

          <div class="form-group">
            <label class="form-label">Customer</label>
            <select id="customer-select" class="form-control" onchange="SalesView.onCustomerChange(this.value)">
              <option value="WALK-IN">Walk-in / General Customer</option>
              ${customers.map(c => `<option value="${c.customer_id}">${c.customer_name} (${c.phone || 'No phone'}) - Due: ৳${c.total_due || 0}</option>`).join('')}
            </select>
          </div>

          <div class="grid-2" style="margin-top: 0.5rem;">
            <div class="form-group">
              <label class="form-label">Payment Method</label>
              <select id="payment-method" class="form-control">
                <option value="Cash">Cash</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Overall Discount (৳)</label>
              <input type="number" id="sale-discount" class="form-control" value="0" min="0" oninput="SalesView.recalculate()">
            </div>
          </div>

          <div style="background-color: var(--bg-secondary); border-radius: var(--radius-sm); padding: 1rem; margin: 1rem 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: var(--text-muted);">Subtotal:</span>
              <strong id="summary-subtotal">৳ 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: var(--text-muted);">Discount:</span>
              <span id="summary-discount">৳ 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 700; color: #fff; border-top: 1px solid var(--border-color); padding-top: 0.5rem; margin-bottom: 0.75rem;">
              <span>Grand Total:</span>
              <span id="summary-grand-total">৳ 0.00</span>
            </div>
            
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Paid Amount (৳)</label>
                <input type="number" id="sale-paid" class="form-control" value="0" min="0" oninput="SalesView.recalculate()">
              </div>
              <div class="form-group">
                <label class="form-label">Due Amount (৳)</label>
                <input type="text" id="sale-due" class="form-control" value="৳ 0.00" readonly style="font-weight: 700; color: var(--status-warning);">
              </div>
            </div>
          </div>

          <button class="btn btn-primary" style="width: 100%; padding: 0.8rem; font-size: 1rem;" onclick="SalesView.submitSale()">💾 Complete Sale & Print Memo</button>
        </div>
      </div>
    `;

    this.cart = [];
    this.renderCart();
  },

  addServiceLine: function() {
    const sel = document.getElementById("service-select");
    const opt = sel.options[sel.selectedIndex];
    if (!opt || !opt.value) return;

    this.cart.push({
      type: "Service",
      item_ref_id: opt.value,
      item_name: opt.getAttribute("data-name"),
      quantity: 1,
      rate: Number(opt.getAttribute("data-rate")) || 0,
      discount: 0
    });
    sel.value = "";
    this.renderCart();
  },

  addProductLine: function() {
    const sel = document.getElementById("product-select");
    const opt = sel.options[sel.selectedIndex];
    if (!opt || !opt.value) return;

    this.cart.push({
      type: "Product",
      item_ref_id: opt.value,
      item_name: opt.getAttribute("data-name"),
      quantity: 1,
      rate: Number(opt.getAttribute("data-rate")) || 0,
      discount: 0
    });
    sel.value = "";
    this.renderCart();
  },

  removeCartItem: function(idx) {
    this.cart.splice(idx, 1);
    this.renderCart();
  },

  renderCart: function() {
    const tbody = document.getElementById("cart-table-body");
    if (!tbody) return;

    if (this.cart.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 1.5rem;">No items added to invoice yet</td></tr>`;
      this.recalculate();
      return;
    }

    tbody.innerHTML = this.cart.map((item, idx) => `
      <tr>
        <td>
          <input type="text" class="form-control" style="padding:0.25rem 0.4rem; font-size:0.8rem;" value="${item.item_name}" onchange="SalesView.cart[${idx}].item_name = this.value">
          <small style="color:var(--text-dim);">${item.type}</small>
        </td>
        <td>
          <input type="number" class="form-control" min="1" value="${item.quantity}" style="padding:0.25rem 0.4rem; font-size:0.8rem;" oninput="SalesView.cart[${idx}].quantity = Number(this.value); SalesView.recalculate();">
        </td>
        <td>
          <input type="number" class="form-control" min="0" value="${item.rate}" style="padding:0.25rem 0.4rem; font-size:0.8rem;" oninput="SalesView.cart[${idx}].rate = Number(this.value); SalesView.recalculate();">
        </td>
        <td style="font-weight:600;" id="line-total-${idx}">
          ${Utils.formatCurrency(item.quantity * item.rate)}
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" style="color:var(--status-danger);" onclick="SalesView.removeCartItem(${idx})">✕</button>
        </td>
      </tr>
    `).join('');

    this.recalculate();
  },

  recalculate: function() {
    let subtotal = 0;
    this.cart.forEach((item, idx) => {
      const line = (Number(item.quantity) || 1) * (Number(item.rate) || 0);
      subtotal += line;
      const el = document.getElementById("line-total-" + idx);
      if (el) el.innerText = Utils.formatCurrency(line);
    });

    const discount = Number(document.getElementById("sale-discount")?.value) || 0;
    const grandTotal = Math.max(0, subtotal - discount);
    
    const paidInput = document.getElementById("sale-paid");
    if (paidInput && Number(paidInput.value) === 0 && this.cart.length > 0 && !paidInput.dataset.modified) {
      paidInput.value = grandTotal;
    }
    
    const paid = Number(paidInput?.value) || 0;
    const due = Math.max(0, grandTotal - paid);

    if (document.getElementById("summary-subtotal")) {
      document.getElementById("summary-subtotal").innerText = Utils.formatCurrency(subtotal);
      document.getElementById("summary-discount").innerText = Utils.formatCurrency(discount);
      document.getElementById("summary-grand-total").innerText = Utils.formatCurrency(grandTotal);
      document.getElementById("sale-due").value = Utils.formatCurrency(due);
    }
  },

  submitSale: async function() {
    if (this.cart.length === 0) {
      UI.toast("Please add at least one item or service", "warning");
      return;
    }

    const custSel = document.getElementById("customer-select");
    const custId = custSel.value;
    const custName = custSel.options[custSel.selectedIndex].text.split(" (")[0];
    const method = document.getElementById("payment-method").value;
    const discount = Number(document.getElementById("sale-discount").value) || 0;
    const paid = Number(document.getElementById("sale-paid").value) || 0;

    let subtotal = 0;
    this.cart.forEach(c => subtotal += (c.quantity * c.rate));
    const grandTotal = Math.max(0, subtotal - discount);
    const due = Math.max(0, grandTotal - paid);

    const payload = {
      customer_id: custId,
      customer_name: custName,
      items: this.cart,
      subtotal: subtotal,
      discount: discount,
      grand_total: grandTotal,
      paid_amount: paid,
      due_amount: due,
      payment_method: method,
      date: Utils.getTodayDateIso()
    };

    const res = await API.call("create_sale", payload);
    if (res.success) {
      UI.toast(`Invoice ${res.invoice_no} created successfully!`, "success");
      this.printInvoiceModal(res.invoice_no, payload);
      this.cart = [];
      this.renderCart();
    } else {
      UI.toast(res.message || "Failed to create sale", "error");
    }
  },

  printInvoiceModal: function(invoiceNo, sale) {
    const html = `
      <div id="print-area" class="printable-voucher">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem;">
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #000;">AS Computer</h2>
          <p style="font-size: 0.85rem; color: #333;">IT Training, Digital Services & Computer Sales</p>
          <p style="font-size: 0.85rem; color: #333;">Cumilla, Bangladesh | +880 1700-000000</p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.9rem;">
          <div>
            <strong>Invoice:</strong> ${invoiceNo}<br>
            <strong>Date:</strong> ${sale.date}
          </div>
          <div style="text-align: right;">
            <strong>Customer:</strong> ${sale.customer_name}<br>
            <strong>Payment:</strong> ${sale.payment_method}
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;" border="1">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 6px;">Item/Service</th>
              <th style="padding: 6px; width: 60px;">Qty</th>
              <th style="padding: 6px; width: 80px;">Rate</th>
              <th style="padding: 6px; width: 90px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(it => `
              <tr>
                <td style="padding: 6px;">${it.item_name}</td>
                <td style="padding: 6px; text-align: center;">${it.quantity}</td>
                <td style="padding: 6px; text-align: right;">${Utils.formatCurrency(it.rate)}</td>
                <td style="padding: 6px; text-align: right;">${Utils.formatCurrency(it.quantity * it.rate)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 220px; font-size: 0.9rem;">
            <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>${Utils.formatCurrency(sale.subtotal)}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Discount:</span><span>${Utils.formatCurrency(sale.discount)}</span></div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; border-top: 1px solid #000;"><span>Grand Total:</span><span>${Utils.formatCurrency(sale.grand_total)}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Paid:</span><span>${Utils.formatCurrency(sale.paid_amount)}</span></div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;"><span>Due:</span><span>${Utils.formatCurrency(sale.due_amount)}</span></div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 2rem; font-size: 0.8rem; color: #555;">
          ধন্যবাদ আবার আসবেন — AS Computer
        </div>
      </div>
    `;

    UI.modal(`Invoice Memo — ${invoiceNo}`, html, () => {
      window.print();
    }, "🖨️ Print Memo");
  },

  resetForm: function() {
    this.cart = [];
    this.renderCart();
  }
};\n