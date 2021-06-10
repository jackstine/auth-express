const config = require('../config')
const stripe = require('stripe')(config.stripe.secret);

/**
 * TEST CARDS - https://stripe.com/docs/billing/subscriptions/elements#test
 * Strong Authentication - https://stripe.com/docs/billing/migration/strong-customer-authentication
 * Payouts - https://stripe.com/docs/payouts
 * Refunds - https://stripe.com/docs/refunds
 * WebHook Fullfillment - https://stripe.com/docs/webhooks/integration-builder
 */

// TODO refactor this page
const createCustomer = async function (customerInfo) {
  // https://stripe.com/docs/api/customers/create
  const customer = await stripe.customers.create(customerInfo);
  return customer
}

const getAllCustomers = async function () {
  const customers = await stripe.customers.list();
  return customers
}

const getCustomer = async function (custId) {
  // https://stripe.com/docs/api/customers/retrieve
  return await stripe.customers.retrieve(custId);
}

const createProduct = async function (product) {
  return await stripe.products.create(product);
}

const createPrice = async function (price) {
  return await stripe.prices.create(price);
}

/**
 * 
 * @param {*} subscriptionInfo.stripe_customer_id
 * @param {*} subscriptionInfo.stripe_price_id
 * @returns 
 */
const signUpForSubscription = async function (subscriptionInfo) {
  const subscription = await stripe.subscriptions.create({
    customer: subscriptionInfo.customerId,
    items: [{
      price: subscriptionInfo.priceId,
    }],
    payment_behavior: "default_incomplete",
    expand: ['latest_invoice.payment_intent']
  });
  return subscription
}

const updateSubscription = async function (subId, paymentMethodId) {
  return await stripe.subscriptions.update(subId,{default_payment_method: paymentMethodId});
}

const cancelSubscription = async function (subscriptionId) {
  const deleted = await stripe.subscriptions.del(subscriptionId);
  return deleted
}

const getSubscription = async function (subId) {
  return await stripe.subscriptions.retrieve(subId)
}

const createCard = async function () {
  const card = await stripe.customers.createSource('cus_JcNF0qgdJ1Zo2K',{source: 'tok_visa'});
  return card
}

const createCardPaymentMethod = async function (pmInfo) {
  // https://stripe.com/docs/api/payment_methods/create
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: pmInfo.card.number,
      exp_month: pmInfo.card.exp_month,
      exp_year: pmInfo.card.exp_year,
      cvc: pmInfo.card.cvc
    },
    billing_details: {
      address: {
        ...pmInfo.billing.address
      },
      email: pmInfo.billing.email,
      name: pmInfo.billing.name,
      phone: pmInfo.billing.phone
    }
  });
  return paymentMethod
}

const getInvoice = async function (invoice_id) {
  // https://stripe.com/docs/api/invoices
  return await stripe.invoices.retrieve(invoice_id)
}

const getPaymentIntent = async function (pi_id) {
  return await stripe.paymentIntents.retrieve(pi_id);
}

const updateSub = async function (paymentInfo) {
  const subscription = await stripe.subscriptions.update(paymentInfo.subId,
    {
      default_payment_method: payment_intent.payment_method
    },
  );
}

/**
 * 
 * @param {customer} paymentInformation.customerId
 * @pa
 */
const createCustomerSubscription = async function (paymentInformation) {
    let customer = await getCustomer(paymentInformation.customerId)
    if (customer) {
      let sub = await signUpForSubscription({
        customerId: customer.id,
        priceId: paymentInformation.priceId
      })
      return {
        customer,
        subscription: sub
      }
    } else {
      throw Error(`The customer ${paymentInformation.customerId} does not exist, createCustomerSubscription()`)
    }
}

const createProductandPrice = async function (productInfo) {
  // https://stripe.com/docs/api/products/create
  // https://stripe.com/docs/api/prices/create
  let product = await createProduct(productInfo.product)
  productInfo.price.product = product.id
  let price = await createPrice(productInfo.price)
  return {
    product,
    price
  }
}

const getActiveProducts = async function () {
  // https://stripe.com/docs/api/products/list
  return await stripe.products.list({active: true})
}

const getAllPrices = async function () {
  // https://stripe.com/docs/api/prices/list
  return await stripe.prices.list()
}


const attachPaymentMethod = async function (subId, paymentId, customerId) {
  await stripe.paymentMethods.attach(paymentId, {customer: customerId});
  return await updateSubscription(subId, paymentId)
}

module.exports = {
  createCustomer,
  getAllCustomers,
  createProduct,
  createPrice,
  getCustomer,
  signUpForSubscription,
  cancelSubscription,
  updateSubscription,
  getSubscription,
  attachPaymentMethod,
  createCardPaymentMethod,
  getInvoice,
  getPaymentIntent,
  createProductandPrice,
  getAllPrices,
  getActiveProducts,
  createCustomerSubscription
}

