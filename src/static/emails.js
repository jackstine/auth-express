const HB = require("../serverlogic/handlebars/hb");
const config = require("../config");

/**
 * Assumes all files are in the static folder directory
 * @param {*} to
 * @param {*} subject
 * @param {*} file
 * @param {*} data
 * @returns
 */
const sendEmail = async function (to, subject, file, data) {
  return await config.emailService.send(
    to,
    await HB.createHTML(`src/static/${file}`, data),
    subject
  );
};

module.exports = {
  createVerificationEmail: async function (to, data) {
    return sendEmail(to, "Verify email", "VerificationEmail.hbs", data);
  },
  createForgotPassword: function (to, data) {
    return sendEmail(to, "Forgot Password", "ForgotPassword.hbs", data);
  },
  beginCustomerSubscriptionEmail: function (to, data) {
    return sendEmail(to, "Subscription", "CustomerBeginSubscription.hbs", data);
  },
};
