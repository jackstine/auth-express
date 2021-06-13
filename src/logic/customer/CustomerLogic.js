const stripeAPI = require("../../apis/stripe");
const CustomerRepo = require("./CustomerRepo");
const authPG = require("@nodeauth/auth-pg");
const emails = require("../../static/emails");
const config = require("../../config");

/*
 * let cust = customer.getByUserId(user.email)
 * if (!cust) {
 *    stripe.createCustomer()
 * } else {
 *  createSubscription()
 * }
 */

/**
 *
 * @param {*} user.email
 * @param {*} productPrice.product
 * @param {*} productPrice.price
 * @returns has_customer --
 * @returns customer -- from stripe
 * @returns subscription -- from stripe
 */
const authorizeCustomer = async function (user, productPrice, cust) {
  cust = cust ?? null;
  if (!cust) {
    let idOfUser = user.id;
    cust = await CustomerRepo.getCustomer(idOfUser);
  }
  console.log("THis is the customer");
  console.log(cust);
  if (!cust) {
    return {
      has_customer: false,
      ...productPrice,
    };
  } else {
    // TODO add in the metadata using the email
    let customerSub = await stripeAPI.createCustomerSubscription({
      customerId: cust.stripe_id,
      priceId: productPrice.price.id,
    });
    // use the price and product to get the information to send the user
    return {
      has_customer: true,
      ...customerSub,
    };
  }
};

/**
 *
 * @param {*} customerInfo.billing
 * @param {*} customerInfo.email
 * @returns
 */
const createCustomer = async function (customerInfo) {
  let user = await authPG.auth.users.getUser(customerInfo.email);
  if (user) {
    let stripeCustomer = {
      address: customerInfo.billing,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      metadata: {
        email: user.email,
      },
    };
    let sC = await stripeAPI.createCustomer(stripeCustomer);
    let dbC = await CustomerRepo.createCustomer(
      customerInfo.user_id,
      user.email,
      sC.id,
      customerInfo.billing
    );
    return dbC;
  } else {
    throw Error(`the user does not exist ${customerInfo.email}`);
  }
};

const getPaymentMethodsForCustomer = async function (customerId) {};

module.exports = {
  authorizeCustomer,
  createCustomer,
};
