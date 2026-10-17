/**
 * AS Computer - reports.js
 * Financial Reports & Analytics
 */
const ReportsView = {
  render: async function() {
    const container = document.getElementById("main-view");
    if (!container) return;

    const today = Utils.getTodayDateIso();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700;">Financial Reports & Statements</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Generate printable sales, expense, and due reports</p>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.25rem;">
        <div style="display: flex; gap: 0.75rem; align-items: flex-end; flex-wrap: wrap;">
          <div>
            <label class="form-label">Start Date</label>
            <input type="date" id="rep-start-date" class="form-control" value="${today}">
          </div>
          <div>
            <label class="form-label">End Date</label>
            <input type="date" id="rep-end-date" class="form-control" value="${today}">
          </div>
          <button class="btn btn-primary" onclick="ReportsView.generateReport()">Generate Report</button>
          <button class="btn btn-secondary" onclick="window.print()">🖨️ Print</button>
        </div>
      </div>

      <div id="report-output-area"></div>
    `;

    this.generateReport();
  },

  generateReport: async function() {
    const sDate = document.getElementById("rep-start-date")?.value || Utils.getTodayDateIso();
    const eDate = document.getElementById("rep-end-date")?.value || Utils.getTodayDateIso();
    const output = document.getElementById("report-output-area");
    if (!output) return;

    const sales = await DB.getAll("sales_history");
    const filtered = sales.filter(s => s.date >= sDate && s.date <= eDate);
    const totalSales = filtered.reduce((sum, s) => sum + (Number(s.grand_total) || 0), 0);
    const totalPaid = filtered.reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0);
    const totalDue = filtered.reduce((sum, s) => sum + (Number(s.due_amount) || 0), 0);

    output.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Sales Summary (${sDate} to ${eDate})</h3>
        </div>
        <div class="grid-3" style="margin-bottom: 1rem;">
          <div class="metric-card">
            <span class="metric-label">Total Invoiced</span>
            <span class="metric-value">${Utils.formatCurrency(totalSales)}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Total Collected</span>
            <span class="metric-value" style="color:var(--status-success);">${Utils.formatCurrency(totalPaid)}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Outstanding Due</span>
            <span class="metric-value" style="color:var(--status-warning);">${Utils.formatCurrency(totalDue)}</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 1.5rem; color:var(--text-dim);">No sales found for this period</td></tr>' :
                filtered.map(s => `
                  <tr>
                    <td><strong>${s.invoice_no}</strong></td>
                    <td>${s.date}</td>
                    <td>${s.customer_name}</td>
                    <td>${Utils.formatCurrency(s.grand_total)}</td>
                    <td>${Utils.formatCurrency(s.paid_amount)}</td>
                    <td>${Utils.formatCurrency(s.due_amount)}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};\n