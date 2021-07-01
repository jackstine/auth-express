const CustomerLogic = require("../logic/customer/CustomerLogic");
const stripeAPI = require("../apis/stripe");
const auth = require('@nodeauth/auth-pg')

const authorizeCustomer = async function (req, res) {
  let user = req.body.user;
  let product = req.body.product;
  let price = req.body.price;
  let authCustomer = await CustomerLogic.authorizeCustomer(user, {
    product,
    price,
  });
  res.send(authCustomer);
};

const authorizeCreateCustomer = async function (req, res) {
  let user = req.body.user;
  let customer = req.body.customer;
  let price = req.body.price;
  // TODO we might need more information for the customer
  // might have to add this to the UI
  let cust = await CustomerLogic.createCustomer({
    email: user.email,
    user_id: user.id,
    ...customer,
  });
  let custSub = await CustomerLogic.authorizeCustomer(user, { price }, cust);
  // needs to return a new refresh token with the customer Information
  let refreshToken = await auth.auth.token.generateToken({...user, ...cust})
  res.send({...custSub, refreshToken});
};

// This never gets called yet....
const makeSubscriptionPayment = async function (req, res) {
  // LAST
  let sub = req.body.sub;
  let customer = req.body.customer;
  let paymentMethod = req.body.paymentMethod;
  let updatedSub = await stripeAPI.attachPaymentMethod(sub.id, paymentMethod.id, customer.id);
  let term = productPrice.price.recurring;
  emails.beginCustomerSubscriptionEmail(cust.email, {
    company: config.company_name,
    name: cust.name,
    plan_name: productPrice.product.name,
    sub_term: `${term.interval_count} ${term.interval}`,
  });
  console.log(updatedSub);
  res.send(updatedSub);
};

const addPaymentSource = async function (req, res) {
  // this needs to authenticate the customer
  // so that only the authorized customer can make this transaction
  // have to validate the custId
  // req.__authentication.custId
  let customer = req.body.customer;
  let source = req.body.source;
  let resp = await stripeAPI.createSourceForCustomer(customer.id, source.id);
  res.send(resp);
};

const getSources = async function (req, res) {
  let customer_id = req.query.id;
  // TODO need to ensure that this is the actual customer id.....
  let source = await stripeAPI.getSource(customer_id);
  res.send(source);
};

const getSubscriptions = async function (req, res) {
  let customer_id = req.query.id;
  let subscriptions = await stripeAPI.getCustomerSubscriptions(customer_id);
  res.send(subscriptions);
};

const cancelSubscription = async function (req, res) {
  res.send(await stripeAPI.cancelSubscription(req.body.id));
};

const CustomerRoute = {
  extension: "customers",
  gets: [
    { route: "source", func: getSources },
    { route: "subscriptions", func: getSubscriptions },
  ],
  posts: [
    { route: "authorize", func: authorizeCustomer, auth: false },
    { route: "authorize/customer", func: authorizeCreateCustomer },
    { route: "authorize/sale", func: makeSubscriptionPayment },
    { route: "authorize/source", func: addPaymentSource },
  ],
  deletes: [{ route: "subscriptions", func: cancelSubscription }],
};

module.exports = [CustomerRoute];
