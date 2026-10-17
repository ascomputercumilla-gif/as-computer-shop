/**
 * AS Computer - payments.js
 * Customer Due Collection
 */
const PaymentsView = {
  render: async function() {
    const container = document.getElementById("main-view");
    if (!container) return;

    const customers = State.customers.length > 0 ? State.customers : (await DB.getAll("customers"));
    const dueCustomers = customers.filter(c => Number(c.total_due) > 0);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700;">Customer Due Collection</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Record full or partial due payments</p>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Collect Payment</h3>
          </div>

          <div class="form-group">
            <label class="form-label">Select Customer with Outstanding Due</label>
            <select id="pay-customer-select" class="form-control" onchange="PaymentsView.onCustomerSelect(this.value)">
              <option value="">-- Select Customer --</option>
              ${dueCustomers.map(c => `<option value="${c.customer_id}" data-due="${c.total_due}">${c.customer_name} (Due: ৳${c.total_due})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Current Outstanding Due</label>
            <input type="text" id="pay-current-due" class="form-control" readonly value="৳ 0.00" style="font-weight: 700; color: var(--status-warning);">
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Payment Amount (৳)</label>
              <input type="number" id="pay-amount" class="form-control" min="1" value="0">
            </div>
            <div class="form-group">
              <label class="form-label">Payment Method</label>
              <select id="pay-method" class="form-control">
                <option value="Cash">Cash</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Note / Receipt Reference</label>
            <input type="text" id="pay-note" class="form-control" placeholder="Due payment note">
          </div>

          <button class="btn btn-primary" style="width: 100%; padding: 0.75rem;" onclick="PaymentsView.submitPayment()">💾 Record Due Payment</button>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Customers with Due Balance</h3>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Due Balance</th>
                </tr>
              </thead>
              <tbody>
                ${dueCustomers.length === 0 ? '<tr><td colspan="3" style="text-align:center; color:var(--status-success); padding: 1.5rem;">No outstanding customer dues!</td></tr>' :
                  dueCustomers.map(c => `
                    <tr>
                      <td><strong>${c.customer_name}</strong></td>
                      <td>${c.phone || 'N/A'}</td>
                      <td style="color: var(--status-warning); font-weight: 700;">${Utils.formatCurrency(c.total_due)}</td>
                    </tr>
                  `).join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  onCustomerSelect: function(custId) {
    const sel = document.getElementById("pay-customer-select");
    const opt = sel.options[sel.selectedIndex];
    const due = opt ? (opt.getAttribute("data-due") || 0) : 0;
    document.getElementById("pay-current-due").value = Utils.formatCurrency(due);
    document.getElementById("pay-amount").value = due;
  },

  submitPayment: async function() {
    const custId = document.getElementById("pay-customer-select").value;
    const amount = Number(document.getElementById("pay-amount").value) || 0;
    const method = document.getElementById("pay-method").value;
    const note = document.getElementById("pay-note").value;

    if (!custId || amount <= 0) {
      UI.toast("Please select a customer and valid payment amount", "warning");
      return;
    }

    const payload = {
      customer_id: custId,
      amount: amount,
      payment_method: method,
      note: note,
      payment_date: Utils.getTodayDateIso()
    };

    const res = await API.call("record_payment", payload);
    if (res.success) {
      UI.toast("Payment recorded successfully!", "success");
      await API.bootstrap();
      PaymentsView.render();
    } else {
      UI.toast(res.message || "Failed to record payment", "error");
    }
  }
};\n