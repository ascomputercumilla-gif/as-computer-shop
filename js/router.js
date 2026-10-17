/**
 * AS Computer - router.js
 * Client-Side Navigation
 */
const Router = {
  routes: {
    dashboard: Dashboard,
    sales: SalesView,
    products: ProductsView,
    customers: CustomersView,
    payments: PaymentsView,
    purchases: PurchasesView,
    expenses: ExpensesView,
    "cash-closing": CashClosingView,
    reports: ReportsView
  },

  init: function() {
    window.addEventListener("hashchange", () => {
      this.handleRoute();
    });
    this.handleRoute();
  },

  navigate: function(tabName) {
    window.location.hash = "#" + tabName;
  },

  handleRoute: function() {
    const hash = window.location.hash.replace("#", "") || "dashboard";
    State.activeTab = hash;

    // Update active nav item
    document.querySelectorAll(".nav-item").forEach(item => {
      if (item.getAttribute("data-tab") === hash) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    const view = this.routes[hash] || Dashboard;
    if (view && typeof view.render === "function") {
      view.render();
    }
  }
};\n