/**
 * AS Computer - products.js
 * Inventory & Catalog Management
 */
const ProductsView = {
  render: async function() {
    const container = document.getElementById("main-view");
    if (!container) return;

    const products = State.products.length > 0 ? State.products : (await DB.getAll("products"));

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700;">Inventory & Products</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Stock management, pricing, and reorder levels</p>
        </div>
        <button class="btn btn-primary" onclick="ProductsView.openNewProductModal()">➕ Add Product</button>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Purchase Rate</th>
                <th>Selling Rate</th>
                <th>Stock</th>
                <th>Min Alert</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td><strong>${p.product_name}</strong></td>
                  <td>${p.category_id || 'General'}</td>
                  <td>${Utils.formatCurrency(p.purchase_price)}</td>
                  <td>${Utils.formatCurrency(p.selling_price)}</td>
                  <td style="font-weight: 700; color: ${(Number(p.stock_quantity) <= Number(p.min_stock_alert)) ? 'var(--status-danger)' : 'var(--status-success)'};">
                    ${p.stock_quantity} ${p.unit || 'pcs'}
                  </td>
                  <td>${p.min_stock_alert || 5}</td>
                  <td><span class="badge badge-online">${p.status || 'Active'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openNewProductModal: function() {
    const html = `
      <div class="form-group">
        <label class="form-label">Product Name</label>
        <input type="text" id="new-prod-name" class="form-control" required placeholder="e.g. Wireless Mouse">
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Purchase Price (৳)</label>
          <input type="number" id="new-prod-cost" class="form-control" min="0" value="0">
        </div>
        <div class="form-group">
          <label class="form-label">Selling Price (৳)</label>
          <input type="number" id="new-prod-price" class="form-control" min="0" value="0">
        </div>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Opening Stock Quantity</label>
          <input type="number" id="new-prod-qty" class="form-control" min="0" value="10">
        </div>
        <div class="form-group">
          <label class="form-label">Min Stock Alert Level</label>
          <input type="number" id="new-prod-alert" class="form-control" min="1" value="5">
        </div>
      </div>
    `;

    UI.modal("Add New Product", html, async () => {
      const name = document.getElementById("new-prod-name").value;
      const cost = Number(document.getElementById("new-prod-cost").value) || 0;
      const price = Number(document.getElementById("new-prod-price").value) || 0;
      const qty = Number(document.getElementById("new-prod-qty").value) || 0;
      const alertLvl = Number(document.getElementById("new-prod-alert").value) || 5;

      if (!name) {
        UI.toast("Product name is required", "warning");
        return;
      }

      const payload = {
        product_name: name,
        purchase_price: cost,
        selling_price: price,
        stock_quantity: qty,
        min_stock_alert: alertLvl,
        unit: "pcs"
      };

      const res = await API.call("save_product", payload);
      if (res.success) {
        UI.toast("Product registered successfully!", "success");
        UI.closeModal();
        await API.bootstrap();
        ProductsView.render();
      } else {
        UI.toast(res.message || "Failed to register product", "error");
      }
    }, "💾 Save Product");
  }
};\n