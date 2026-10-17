/**
 * AS COMPUTER SHOP MANAGEMENT SYSTEM - FRONTEND
 * js/cash-closing.js - Daily Cash Closing Module
 */
const CashClosingView = {
  activeDate: Utils.getTodayDateIso(),
  currentCalculation: null,
  existingRecord: null,
  denominations: {
    d_1000: 0, d_500: 0, d_200: 0, d_100: 0,
    d_50: 0, d_20: 0, d_10: 0, d_5: 0, d_2: 0, d_1: 0,
    coins_total: 0
  },

  render: async function() {
    const container = document.getElementById("main-view");
    if (!container) return;

    this.activeDate = Utils.getTodayDateIso();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700;">Daily Cash Closing</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Reconcile physical cash drawer with sales and due collections</p>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label style="font-size: 0.85rem; color: var(--text-muted);">Select Date:</label>
          <input type="date" id="closing-date-picker" class="form-control" style="width: auto;" value="${this.activeDate}" onchange="CashClosingView.onDateChange(this.value)">
          <button class="btn btn-secondary btn-sm" onclick="CashClosingView.loadDateData(CashClosingView.activeDate)">🔄 Refresh</button>
        </div>
      </div>

      <div id="closing-status-banner" style="margin-bottom: 1rem;"></div>

      <div class="grid-2">
        <!-- Left: Expected Cash Breakdown -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Cash Flow Reconciliation</h3>
            <span id="date-badge" class="badge badge-online">${this.activeDate}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.9rem;">
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span style="color: var(--text-muted);">Opening Cash (Previous Closing):</span>
              <strong id="val-opening-cash">৳ 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span style="color: var(--text-muted);">Sales Cash Received:</span>
              <strong id="val-sales-cash" style="color: var(--status-success);">৳ 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span style="color: var(--text-muted);">Customer Due Collection Cash:</span>
              <strong id="val-due-cash" style="color: var(--status-success);">৳ 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span style="color: var(--text-muted);">Previous Shortage Adjustment:</span>
              <strong id="val-shortage-adj">৳ 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 600;">
              <span>Total Cash Inflow:</span>
              <span id="val-total-inflow">৳ 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span style="color: var(--text-muted);">Cash Expenses Outflow:</span>
              <strong id="val-expenses-cash" style="color: var(--status-danger);">৳ 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <span style="color: var(--text-muted);">Cash Purchases / Other Outflow:</span>
              <strong id="val-purchases-cash" style="color: var(--status-danger);">৳ 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 700; color: #fff; background: var(--bg-secondary); padding: 0.75rem; border-radius: var(--radius-sm); margin-top: 0.5rem;">
              <span>Expected Cash in Drawer:</span>
              <span id="val-expected-cash" style="color: var(--accent-blue);">৳ 0.00</span>
            </div>
          </div>
        </div>

        <!-- Right: Physical Cash Count & Denominations -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Physical Cash Denomination Count</h3>
          </div>

          <div class="denom-grid">
            <div class="denom-box">
              <label>1000 Note</label>
              <input type="number" id="denom-1000" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
            <div class="denom-box">
              <label>500 Note</label>
              <input type="number" id="denom-500" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
            <div class="denom-box">
              <label>200 Note</label>
              <input type="number" id="denom-200" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
            <div class="denom-box">
              <label>100 Note</label>
              <input type="number" id="denom-100" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
            <div class="denom-box">
              <label>50 Note</label>
              <input type="number" id="denom-50" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
            <div class="denom-box">
              <label>20 Note</label>
              <input type="number" id="denom-20" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
            <div class="denom-box">
              <label>10 Note</label>
              <input type="number" id="denom-10" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
            <div class="denom-box">
              <label>5 Note</label>
              <input type="number" id="denom-5" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
            <div class="denom-box">
              <label>2 Note</label>
              <input type="number" id="denom-2" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
            <div class="denom-box">
              <label>1 Note</label>
              <input type="number" id="denom-1" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
            <div class="denom-box">
              <label>Coins Total (৳)</label>
              <input type="number" id="denom-coins" min="0" value="0" oninput="CashClosingView.onDenomChange()">
            </div>
          </div>

          <!-- Total Counted & Difference -->
          <div style="background-color: var(--bg-secondary); border-radius: var(--radius-sm); padding: 1rem; margin: 1rem 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-weight:600;">Total Physical Cash Counted:</span>
              <strong id="val-counted-cash" style="font-size: 1.1rem; color: #fff;">৳ 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-weight:600;">Difference (Counted - Expected):</span>
              <strong id="val-difference">৳ 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Closing Status:</span>
              <span id="badge-closing-status" class="badge badge-online">Pending</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Closing Notes / Discrepancy Reason</label>
            <input type="text" id="closing-notes" class="form-control" placeholder="Optional notes">
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button id="btn-save-closing" class="btn btn-primary" style="flex: 1;" onclick="CashClosingView.saveClosing()">💾 Save Daily Cash Closing</button>
            <button class="btn btn-secondary" onclick="CashClosingView.printVoucher()">🖨️ Print</button>
          </div>
        </div>
      </div>
    `;

    await this.loadDateData(this.activeDate);
  },

  onDateChange: function(newDate) {
    this.activeDate = newDate;
    this.loadDateData(newDate);
  },

  loadDateData: async function(targetDate) {
    const banner = document.getElementById("closing-status-banner");
    const saveBtn = document.getElementById("btn-save-closing");
    
    // Check editing permission rule:
    // Today's record: view and edit. Yesterday's record: view and edit. Older records: view and print only.
    const today = Utils.getTodayDateIso();
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().split("T")[0];
    const isEditable = (targetDate === today || targetDate === yesterday);

    if (saveBtn) {
      if (isEditable) {
        saveBtn.disabled = false;
        saveBtn.style.opacity = "1";
        saveBtn.title = "Record can be saved or edited";
      } else {
        saveBtn.disabled = true;
        saveBtn.style.opacity = "0.4";
        saveBtn.title = "Older records are read-only";
      }
    }

    // Try reading local / offline cash closings first
    const existingOffline = await DB.get("cash_closings", targetDate);
    
    // Call backend API for calculation & server record
    let res = null;
    try {
      if (typeof google !== "undefined" && google.script && google.script.run) {
        res = await new Promise(resolve => {
          google.script.run.withSuccessHandler(resolve).doGet({ parameter: { action: "get_cash_closing", date: targetDate } });
        });
      } else if (API.apiUrl) {
        const resp = await fetch(`${API.apiUrl}?action=get_cash_closing&date=${targetDate}`);
        res = await resp.json();
      }
    } catch(e) {
      console.warn("Backend cash closing fetch failed:", e);
    }

    if (res && res.success && res.calculation) {
      this.currentCalculation = res.calculation;
      this.existingRecord = res.existing && res.existing.found ? res.existing.record : null;
      if (res.existing && res.existing.found && res.existing.denominations) {
        this.setDenominations(res.existing.denominations);
      }
    } else {
      // Local fallback calculation from IndexedDB
      const sales = await DB.getAll("sales_history");
      const todaySales = sales.filter(s => s.date === targetDate && String(s.payment_method).toLowerCase() === "cash");
      const salesCash = todaySales.reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0);
      
      this.currentCalculation = {
        date: targetDate,
        opening_cash: 0,
        sales_cash: salesCash,
        due_collection_cash: 0,
        shortage_adjustment: 0,
        total_inflow: salesCash,
        expenses_outflow: 0,
        other_outflow: 0,
        total_outflow: 0,
        expected_cash: salesCash
      };
      this.existingRecord = existingOffline || null;
      if (existingOffline && existingOffline.denominations) {
        this.setDenominations(existingOffline.denominations);
      }
    }

    // Update UI elements
    const calc = this.currentCalculation;
    document.getElementById("val-opening-cash").innerText = Utils.formatCurrency(calc.opening_cash);
    document.getElementById("val-sales-cash").innerText = Utils.formatCurrency(calc.sales_cash);
    document.getElementById("val-due-cash").innerText = Utils.formatCurrency(calc.due_collection_cash);
    document.getElementById("val-shortage-adj").innerText = Utils.formatCurrency(calc.shortage_adjustment);
    document.getElementById("val-total-inflow").innerText = Utils.formatCurrency(calc.total_inflow);
    document.getElementById("val-expenses-cash").innerText = Utils.formatCurrency(calc.expenses_outflow);
    document.getElementById("val-purchases-cash").innerText = Utils.formatCurrency(calc.other_outflow);
    document.getElementById("val-expected-cash").innerText = Utils.formatCurrency(calc.expected_cash);

    // Banner message
    if (banner) {
      if (this.existingRecord) {
        banner.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--status-success); color: var(--status-success); padding: 0.6rem 1rem; border-radius: var(--radius-sm); font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
            <span>✅ Cash closing record exists for ${targetDate} (Status: <strong>${this.existingRecord.status}</strong>, Difference: <strong>৳${this.existingRecord.difference}</strong>)</span>
            <span>${isEditable ? '✏️ Editable' : '🔒 Read-Only'}</span>
          </div>
        `;
      } else {
        banner.innerHTML = `
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid var(--status-warning); color: var(--status-warning); padding: 0.6rem 1rem; border-radius: var(--radius-sm); font-size: 0.85rem;">
            ⚠️ No cash closing record found for this date. Enter physical count to reconcile.
          </div>
        `;
      }
    }

    this.onDenomChange();
  },

  setDenominations: function(d) {
    const fields = ["1000", "500", "200", "100", "50", "20", "10", "5", "2", "1"];
    fields.forEach(f => {
      const el = document.getElementById("denom-" + f);
      if (el) el.value = d["d_" + f] || 0;
    });
    const cEl = document.getElementById("denom-coins");
    if (cEl) cEl.value = d.coins_total || 0;
  },

  onDenomChange: function() {
    const d1000 = (Number(document.getElementById("denom-1000")?.value) || 0) * 1000;
    const d500 = (Number(document.getElementById("denom-500")?.value) || 0) * 500;
    const d200 = (Number(document.getElementById("denom-200")?.value) || 0) * 200;
    const d100 = (Number(document.getElementById("denom-100")?.value) || 0) * 100;
    const d50 = (Number(document.getElementById("denom-50")?.value) || 0) * 50;
    const d20 = (Number(document.getElementById("denom-20")?.value) || 0) * 20;
    const d10 = (Number(document.getElementById("denom-10")?.value) || 0) * 10;
    const d5 = (Number(document.getElementById("denom-5")?.value) || 0) * 5;
    const d2 = (Number(document.getElementById("denom-2")?.value) || 0) * 2;
    const d1 = (Number(document.getElementById("denom-1")?.value) || 0) * 1;
    const coins = Number(document.getElementById("denom-coins")?.value) || 0;

    const totalCounted = d1000 + d500 + d200 + d100 + d50 + d20 + d10 + d5 + d2 + d1 + coins;
    const expected = this.currentCalculation ? this.currentCalculation.expected_cash : 0;
    const diff = totalCounted - expected;

    document.getElementById("val-counted-cash").innerText = Utils.formatCurrency(totalCounted);
    const diffEl = document.getElementById("val-difference");
    diffEl.innerText = Utils.formatCurrency(diff);

    const statusBadge = document.getElementById("badge-closing-status");
    if (diff === 0) {
      diffEl.style.color = "var(--status-success)";
      statusBadge.className = "badge badge-online";
      statusBadge.innerText = "Matched";
    } else if (diff < 0) {
      diffEl.style.color = "var(--status-danger)";
      statusBadge.className = "badge badge-offline";
      statusBadge.innerText = `Short (৳${Math.abs(diff)})`;
    } else {
      diffEl.style.color = "var(--status-warning)";
      statusBadge.className = "badge badge-syncing";
      statusBadge.innerText = `Excess (+৳${diff})`;
    }
  },

  saveClosing: async function() {
    const calc = this.currentCalculation;
    if (!calc) return;

    const d1000 = Number(document.getElementById("denom-1000")?.value) || 0;
    const d500 = Number(document.getElementById("denom-500")?.value) || 0;
    const d200 = Number(document.getElementById("denom-200")?.value) || 0;
    const d100 = Number(document.getElementById("denom-100")?.value) || 0;
    const d50 = Number(document.getElementById("denom-50")?.value) || 0;
    const d20 = Number(document.getElementById("denom-20")?.value) || 0;
    const d10 = Number(document.getElementById("denom-10")?.value) || 0;
    const d5 = Number(document.getElementById("denom-5")?.value) || 0;
    const d2 = Number(document.getElementById("denom-2")?.value) || 0;
    const d1 = Number(document.getElementById("denom-1")?.value) || 0;
    const coins = Number(document.getElementById("denom-coins")?.value) || 0;

    const totalCounted = (d1000*1000) + (d500*500) + (d200*200) + (d100*100) + (d50*50) + (d20*20) + (d10*10) + (d5*5) + (d2*2) + (d1*1) + coins;
    const diff = totalCounted - calc.expected_cash;

    const payload = {
      closing_date: this.activeDate,
      opening_cash: calc.opening_cash,
      sales_cash: calc.sales_cash,
      due_collection_cash: calc.due_collection_cash,
      shortage_adjustment: calc.shortage_adjustment,
      total_inflow: calc.total_inflow,
      expenses_outflow: calc.expenses_outflow,
      other_outflow: calc.other_outflow,
      expected_cash: calc.expected_cash,
      counted_cash: totalCounted,
      difference: diff,
      status: diff === 0 ? "Matched" : (diff < 0 ? "Short" : "Excess"),
      notes: document.getElementById("closing-notes")?.value || "",
      denominations: {
        d_1000: d1000, d_500: d500, d_200: d200, d_100: d100,
        d_50: d50, d_20: d20, d_10: d10, d_5: d5, d_2: d2, d_1: d1,
        coins_total: coins
      }
    };

    const res = await API.call("save_cash_closing", payload);
    if (res.success) {
      UI.toast("Daily Cash Closing saved successfully!", "success");
      this.loadDateData(this.activeDate);
    } else {
      UI.toast(res.message || "Failed to save closing", "error");
    }
  },

  printVoucher: function() {
    const calc = this.currentCalculation;
    if (!calc) return;
    const counted = document.getElementById("val-counted-cash").innerText;
    const diff = document.getElementById("val-difference").innerText;
    const status = document.getElementById("badge-closing-status").innerText;

    const html = `
      <div id="print-area" class="printable-voucher">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem;">
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #000;">AS Computer</h2>
          <p style="font-size: 0.85rem; color: #333;">Daily Cash Closing Voucher</p>
          <p style="font-size: 0.85rem; color: #333;">Business Date: <strong>${this.activeDate}</strong></p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;" border="1">
          <tr><td style="padding: 6px;">Opening Cash</td><td style="padding: 6px; text-align: right;">${Utils.formatCurrency(calc.opening_cash)}</td></tr>
          <tr><td style="padding: 6px;">Sales Cash Received</td><td style="padding: 6px; text-align: right;">${Utils.formatCurrency(calc.sales_cash)}</td></tr>
          <tr><td style="padding: 6px;">Due Collection Cash</td><td style="padding: 6px; text-align: right;">${Utils.formatCurrency(calc.due_collection_cash)}</td></tr>
          <tr><td style="padding: 6px;">Expenses Outflow</td><td style="padding: 6px; text-align: right;">${Utils.formatCurrency(calc.expenses_outflow)}</td></tr>
          <tr><td style="padding: 6px;">Purchases / Other Outflow</td><td style="padding: 6px; text-align: right;">${Utils.formatCurrency(calc.other_outflow)}</td></tr>
          <tr style="font-weight: 700; background: #f0f0f0;"><td style="padding: 6px;">Expected Cash</td><td style="padding: 6px; text-align: right;">${Utils.formatCurrency(calc.expected_cash)}</td></tr>
          <tr style="font-weight: 700;"><td style="padding: 6px;">Counted Cash</td><td style="padding: 6px; text-align: right;">${counted}</td></tr>
          <tr style="font-weight: 700;"><td style="padding: 6px;">Difference / Status</td><td style="padding: 6px; text-align: right;">${diff} (${status})</td></tr>
        </table>
        <div style="margin-top: 2rem; display: flex; justify-content: space-between; font-size: 0.85rem;">
          <div>___________________<br>Closing Staff</div>
          <div>___________________<br>Owner / Director</div>
        </div>
      </div>
    `;

    UI.modal("Daily Cash Closing Voucher", html, () => {
      window.print();
    }, "🖨️ Print Voucher");
  }
};\n