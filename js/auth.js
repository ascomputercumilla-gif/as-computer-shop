/**
 * AS Computer - auth.js
 * User Authentication & Session
 */
const AuthView = {
  checkSession: function() {
    const saved = localStorage.getItem("as_computer_user");
    if (saved) {
      try {
        State.currentUser = JSON.parse(saved);
      } catch(e) {}
    }
  },

  logout: function() {
    localStorage.removeItem("as_computer_user");
    UI.toast("Logged out successfully", "info");
    Router.navigate("dashboard");
  }
};\n