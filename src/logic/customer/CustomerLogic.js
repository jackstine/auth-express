const stripeAPI = require("../../apis/stripe");
const CustomerRepo = require("./CustomerRepo");
const authPG = require("@nodeauth/auth-pg");
const emails = require("../../static/emails");
const config = require("../../config");

/*
 * let cust = customer.getByUserId(user.user_id)
 * if (!cust) {
 *    stripe.createCustomer()
 * } else {
 *  createSubscription()
 * }
 */

/**
 *
 * @param {*} user.user_id
 * @param {*} productPrice.product
 * @param {*} productPrice.price
 * @returns has_customer --
 * @returns customer -- from stripe
 * @returns subscription -- from stripe
 */
const authorizeCustomer = async function (user, productPrice, cust) {
  cust = cust ?? null;
  if (!cust) {
    // TODO need to change back to user_id when I refactor
    let idOfUser = user.new_user_id ?? user.user_id;
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
    // TODO add in the metadata using the user_id
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
 * @param {*} customerInfo.user_id
 * @returns
 */
const createCustomer = async function (customerInfo) {
  let user = await authPG.auth.users.getUser(customerInfo.user_id);
  if (user) {
    let stripeCustomer = {
      address: customerInfo.billing,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      metadata: {
        user_id: user.user_id,
      },
    };
    let sC = await stripeAPI.createCustomer(stripeCustomer);
    let dbC = await CustomerRepo.createCustomer(
      customerInfo.new_user_id,
      user.email,
      sC.id,
      customerInfo.billing
    );
    return dbC;
  } else {
    throw Error(`the user does not exist ${customerInfo.user_id}`);
  }
};

const getPaymentMethodsForCustomer = async function (customerId) {};

module.exports = {
  authorizeCustomer,
  createCustomer,
};
