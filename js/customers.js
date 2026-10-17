/**
 * AS Computer - customers.js
 * Customer Directory & Ledger Management
 */
const CustomersView = {
  render: async function() {
    const container = document.getElementById("main-view");
    if (!container) return;

    const customers = State.customers.length > 0 ? State.customers : (await DB.getAll("customers"));

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700;">Customer Directory & Dues</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Manage customer contacts, outstanding balances, and ledgers</p>
        </div>
        <button class="btn btn-primary" onclick="CustomersView.openNewCustomerModal()">➕ Add Customer</button>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Total Purchases</th>
                <th>Total Paid</th>
                <th>Outstanding Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(c => `
                <tr>
                  <td><strong>${c.customer_name}</strong></td>
                  <td>${c.phone || 'N/A'}</td>
                  <td>${c.address || 'Cumilla'}</td>
                  <td>${Utils.formatCurrency(c.total_purchases)}</td>
                  <td>${Utils.formatCurrency(c.total_paid)}</td>
                  <td style="font-weight: 700; color: ${Number(c.total_due) > 0 ? 'var(--status-warning)' : 'var(--status-success)'};">
                    ${Utils.formatCurrency(c.total_due)}
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="Router.navigate('payments')">Collect Due</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openNewCustomerModal: function() {
    const html = `
      <div class="form-group">
        <label class="form-label">Customer Name</label>
        <input type="text" id="new-cust-name" class="form-control" required placeholder="e.g. Karim Ahmed">
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="text" id="new-cust-phone" class="form-control" placeholder="017xxxxxxxx">
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <input type="text" id="new-cust-addr" class="form-control" placeholder="Cumilla, Bangladesh">
        </div>
      </div>
    `;

    UI.modal("Add New Customer", html, async () => {
      const name = document.getElementById("new-cust-name").value;
      const phone = document.getElementById("new-cust-phone").value;
      const addr = document.getElementById("new-cust-addr").value;

      if (!name) {
        UI.toast("Customer name is required", "warning");
        return;
      }

      const payload = { customer_name: name, phone: phone, address: addr };
      const res = await API.call("save_customer", payload);
      if (res.success) {
        UI.toast("Customer saved!", "success");
        UI.closeModal();
        await API.bootstrap();
        CustomersView.render();
      } else {
        UI.toast(res.message || "Failed to save customer", "error");
      }
    }, "💾 Save Customer");
  }
};\n