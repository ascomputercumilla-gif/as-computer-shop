/**
 * AS Computer - expenses.js
 * Operating Expenses Management
 */
const ExpensesView = {
  render: async function() {
    const container = document.getElementById("main-view");
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700;">Operating Expenses</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Shop rent, electricity, wifi, tea & refreshments</p>
        </div>
      </div>

      <div class="card" style="max-width: 650px; margin: 0 auto;">
        <div class="card-header">
          <h3 class="card-title">Record New Expense</h3>
        </div>

        <div class="form-group">
          <label class="form-label">Expense Category</label>
          <select id="exp-category" class="form-control">
            <option value="Shop Rent">Shop Rent</option>
            <option value="Electricity Bill">Electricity Bill</option>
            <option value="Internet & WiFi">Internet & WiFi</option>
            <option value="Refreshment & Tea">Refreshment & Tea</option>
            <option value="Office Stationery">Office Stationery</option>
            <option value="Equipment Maintenance">Equipment Maintenance</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Amount (৳)</label>
            <input type="number" id="exp-amount" class="form-control" min="1" required placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select id="exp-method" class="form-control">
              <option value="Cash">Cash</option>
              <option value="bKash">bKash</option>
              <option value="Bank">Bank</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Payee / Description</label>
          <input type="text" id="exp-note" class="form-control" placeholder="e.g. Monthly electricity bill">
        </div>

        <button class="btn btn-primary" style="width: 100%; padding: 0.75rem; margin-top: 0.5rem;" onclick="ExpensesView.submitExpense()">💾 Save Expense</button>
      </div>
    `;
  },

  submitExpense: async function() {
    const cat = document.getElementById("exp-category").value;
    const amount = Number(document.getElementById("exp-amount").value) || 0;
    const method = document.getElementById("exp-method").value;
    const note = document.getElementById("exp-note").value;

    if (amount <= 0) {
      UI.toast("Please enter a valid expense amount", "warning");
      return;
    }

    const payload = {
      category_id: cat,
      category_name: cat,
      amount: amount,
      payment_method: method,
      note: note,
      expense_date: Utils.getTodayDateIso()
    };

    const res = await API.call("create_expense", payload);
    if (res.success) {
      UI.toast("Expense recorded!", "success");
      document.getElementById("exp-amount").value = "";
      document.getElementById("exp-note").value = "";
    } else {
      UI.toast(res.message || "Failed to record expense", "error");
    }
  }
};\n