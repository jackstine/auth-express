const HB = require("../serverlogic/handlebars/hb");

module.exports = {
  createVerificationEmail: function (data) {
    return HB.createHTML("src/static/VerificationEmail.hbs", data);
  },
  createForgotPassword: function (data) {
    return HB.createHTML("src/static/ForgotPassword.hbs", data);
  },
};
