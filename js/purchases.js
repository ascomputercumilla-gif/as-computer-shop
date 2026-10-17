/**
 * AS Computer - purchases.js
 * Supplier Purchases & Stock-In
 */
const PurchasesView = {
  render: async function() {
    const container = document.getElementById("main-view");
    if (!container) return;

    const products = State.products.length > 0 ? State.products : (await DB.getAll("products"));

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700;">Stock Purchases (Stock-In)</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Record new inventory batches from IT distributors</p>
        </div>
      </div>

      <div class="card" style="max-width: 700px; margin: 0 auto;">
        <div class="form-group">
          <label class="form-label">Select Product to Stock-In</label>
          <select id="pur-product-select" class="form-control">
            <option value="">-- Select Product --</option>
            ${products.map(p => `<option value="${p.product_id}" data-name="${p.product_name}" data-cost="${p.purchase_price}">${p.product_name} (Current Stock: ${p.stock_quantity})</option>`).join('')}
          </select>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Quantity to Add</label>
            <input type="number" id="pur-qty" class="form-control" min="1" value="10">
          </div>
          <div class="form-group">
            <label class="form-label">Purchase Rate (৳)</label>
            <input type="number" id="pur-rate" class="form-control" min="0" value="0">
          </div>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Supplier Name</label>
            <input type="text" id="pur-supplier" class="form-control" value="Local IT Distributor">
          </div>
          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select id="pur-method" class="form-control">
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary" style="width: 100%; padding: 0.75rem; margin-top: 1rem;" onclick="PurchasesView.submitPurchase()">💾 Save Purchase & Increment Stock</button>
      </div>
    `;
  },

  submitPurchase: async function() {
    const sel = document.getElementById("pur-product-select");
    const prodId = sel.value;
    const opt = sel.options[sel.selectedIndex];
    const prodName = opt ? opt.getAttribute("data-name") : "";
    const qty = Number(document.getElementById("pur-qty").value) || 0;
    const rate = Number(document.getElementById("pur-rate").value) || 0;
    const supp = document.getElementById("pur-supplier").value;
    const method = document.getElementById("pur-method").value;

    if (!prodId || qty <= 0) {
      UI.toast("Please select a product and valid quantity", "warning");
      return;
    }

    const payload = {
      supplier_name: supp,
      payment_method: method,
      purchase_date: Utils.getTodayDateIso(),
      paid_amount: qty * rate,
      items: [{
        product_id: prodId,
        product_name: prodName,
        quantity: qty,
        purchase_rate: rate
      }]
    };

    const res = await API.call("create_purchase", payload);
    if (res.success) {
      UI.toast("Stock successfully updated!", "success");
      await API.bootstrap();
      Router.navigate("products");
    } else {
      UI.toast(res.message || "Failed to record purchase", "error");
    }
  }
};\n