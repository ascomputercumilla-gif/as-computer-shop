/**
 * AS Computer - dashboard.js
 * Instantaneous dashboard rendering
 */
const Dashboard = {
  render: async function() {
    const container = document.getElementById("main-view");
    if (!container) return;

    // Load from fast local cache or IndexedDB immediately
    const sales = await DB.getAll("sales_history");
    const products = State.products.length > 0 ? State.products : (await DB.getAll("products"));
    const customers = State.customers.length > 0 ? State.customers : (await DB.getAll("customers"));
    
    const today = Utils.getTodayDateIso();
    const todaySales = sales.filter(s => s.date === today);
    const todaySalesTotal = todaySales.reduce((sum, s) => sum + (Number(s.grand_total) || 0), 0);
    const todayCashReceived = todaySales.reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0);
    const totalDues = customers.reduce((sum, c) => sum + (Number(c.total_due) || 0), 0);
    const lowStock = products.filter(p => (Number(p.stock_quantity) || 0) <= (Number(p.min_stock_alert) || 5));

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #fff;">Dashboard</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${Utils.formatDate(today)} | AS Computer Overview</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary" onclick="Router.navigate('sales')">➕ New Sale Memo</button>
          <button class="btn btn-secondary" onclick="Router.navigate('cash-closing')">💼 Daily Cash Closing</button>
        </div>
      </div>

      <!-- Metric Cards (Removed 'আজ' and 'গত মাস' labels as instructed) -->
      <div class="grid-4" style="margin-bottom: 1.25rem;">
        <div class="metric-card">
          <span class="metric-label">Sales Total</span>
          <span class="metric-value">${Utils.formatCurrency(todaySalesTotal)}</span>
          <span class="metric-sub">${todaySales.length} Transactions</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Cash Received</span>
          <span class="metric-value" style="color: var(--status-success);">${Utils.formatCurrency(todayCashReceived)}</span>
          <span class="metric-sub">Direct Inflow</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Customer Dues</span>
          <span class="metric-value" style="color: var(--status-warning);">${Utils.formatCurrency(totalDues)}</span>
          <span class="metric-sub">${customers.filter(c => Number(c.total_due) > 0).length} Customers</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Low Stock Alerts</span>
          <span class="metric-value" style="color: ${lowStock.length > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">${lowStock.length}</span>
          <span class="metric-sub">Requires Reorder</span>
        </div>
      </div>

      <!-- Quick Actions and Recents -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Transactions</h3>
            <button class="btn btn-secondary btn-sm" onclick="Router.navigate('sales')">View All</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${todaySales.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:var(--text-dim); padding: 1.5rem;">No transactions recorded today</td></tr>' : 
                  todaySales.slice(-5).reverse().map(s => `
                    <tr>
                      <td><strong>${s.invoice_no}</strong></td>
                      <td>${s.customer_name}</td>
                      <td>${Utils.formatCurrency(s.grand_total)}</td>
                      <td>${Utils.formatCurrency(s.paid_amount)}</td>
                      <td><span class="badge ${s.status.includes('Offline') ? 'badge-syncing' : 'badge-online'}">${s.status}</span></td>
                    </tr>
                  `).join('')
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Low Stock Overview</h3>
            <button class="btn btn-secondary btn-sm" onclick="Router.navigate('products')">Manage Stock</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Min Alert</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${lowStock.length === 0 ? '<tr><td colspan="4" style="text-align:center; color:var(--status-success); padding: 1.5rem;">All stock levels healthy</td></tr>' :
                  lowStock.slice(0, 5).map(p => `
                    <tr>
                      <td><strong>${p.product_name}</strong></td>
                      <td style="color: var(--status-danger); font-weight:700;">${p.stock_quantity} ${p.unit || 'pcs'}</td>
                      <td>${p.min_stock_alert}</td>
                      <td><button class="btn btn-primary btn-sm" onclick="Router.navigate('purchases')">Reorder</button></td>
                    </tr>
                  `).join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
};\n