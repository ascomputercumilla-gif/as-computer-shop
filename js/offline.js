/**
 * AS Computer - offline.js
 * Offline transaction interception & local storage
 */
const Offline = {
  handleAction: async function(action, payload) {
    const clientOpId = Utils.generateUUID();
    const nowIso = new Date().toISOString();
    const today = Utils.getTodayDateIso();

    switch (action) {
      case "create_sale": {
        const invoiceNo = "INV-" + today.replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
        const saleRecord = {
          invoice_no: invoiceNo,
          customer_id: payload.customer_id || "WALK-IN",
          customer_name: payload.customer_name || "General Customer",
          subtotal: payload.subtotal,
          discount: payload.discount,
          grand_total: payload.grand_total,
          paid_amount: payload.paid_amount,
          due_amount: payload.due_amount,
          payment_method: payload.payment_method || "Cash",
          date: payload.date || today,
          status: "Pending Sync (Offline)",
          items: payload.items,
          created_at: nowIso,
          client_op_id: clientOpId
        };

        // Save to local sales history & update local stock
        await DB.put("sales_history", saleRecord);
        
        if (payload.items) {
          for (const item of payload.items) {
            if (item.type === "Product" && item.item_ref_id) {
              const prod = await DB.get("products", item.item_ref_id);
              if (prod) {
                prod.stock_quantity = Math.max(0, (Number(prod.stock_quantity) || 0) - (Number(item.quantity) || 1));
                await DB.put("products", prod);
              }
            }
          }
        }

        // Queue for background synchronization
        await this.queueOperation("Sales", "CREATE", payload, clientOpId);
        UI.toast("Sale saved locally (Offline mode)", "warning");
        return { success: true, offline: true, invoice_no: invoiceNo, sale: saleRecord };
      }

      case "save_cash_closing": {
        const closingRecord = {
          ...payload,
          closing_id: "CC-OFFLINE-" + payload.closing_date.replace(/-/g, ""),
          status: "Pending Sync (Offline)",
          client_op_id: clientOpId
        };
        await DB.put("cash_closings", closingRecord);
        await this.queueOperation("CashClosing", "SAVE", payload, clientOpId);
        UI.toast("Cash closing stored locally for synchronization", "warning");
        return { success: true, offline: true, closing_id: closingRecord.closing_id, record: closingRecord };
      }

      case "record_payment": {
        const paymentId = "PAY-OFFLINE-" + Math.floor(1000 + Math.random() * 9000);
        await this.queueOperation("Payments", "CREATE", payload, clientOpId);
        UI.toast("Due payment queued for synchronization", "warning");
        return { success: true, offline: true, payment_id: paymentId };
      }

      default:
        return { success: false, message: "Action not supported offline yet: " + action };
    }
  },

  queueOperation: async function(module, opType, payload, clientOpId) {
    const queueItem = {
      client_op_id: clientOpId || Utils.generateUUID(),
      device_id: "pwa-client",
      module: module,
      type: opType,
      payload: payload,
      queued_at: new Date().toISOString()
    };
    await DB.put("outbox", queueItem);
    await Sync.updatePendingCount();
  }
};\n