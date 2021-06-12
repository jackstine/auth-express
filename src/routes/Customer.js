const CustomerLogic = require("../logic/customer/CustomerLogic");
const stripeAPI = require("../apis/stripe");

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
  // TODO passed in the id of the user, as new_user_id
  let cust = await CustomerLogic.createCustomer({
    user_id: user.user_id,
    new_user_id: user.id,
    ...customer,
  });
  let custSub = await CustomerLogic.authorizeCustomer(user, { price }, cust);
  res.send(custSub);
};

const makeSubscriptionPayment = async function (req, res) {
  // LAST
  let sub = req.body.sub;
  let customer = req.body.customer;
  let paymentMethod = req.body.paymentMethod;
  let updatedSub = await stripeAPI.attachPaymentMethod(
    sub.id,
    paymentMethod.id,
    customer.id
  );
  console.log(updatedSub);
  res.send(updatedSub);
};

const addPaymentSource = async function (req, res) {
  let customer = req.body.customer;
  let source = req.body.source;
  let resp = await stripeAPI.createSourceForCustomer(customer.id, source.id);
  console.log(resp);
  res.send(resp);
};

const getSources = async function (req, res) {
  let customer_id = req.query.id;
  // TODO need to ensure that this is the actual customer id.....
  let source = await stripeAPI.getSource(customer_id);
  console.log(source);
  res.send(source);
};

const CustomerRoute = {
  extension: "customers",
  gets: [{ route: "source", func: getSources }],
  posts: [
    { route: "authorize", func: authorizeCustomer, auth: false },
    { route: "authorize/customer", func: authorizeCreateCustomer },
    { route: "authorize/sale", func: makeSubscriptionPayment },
    { route: "authorize/source", func: addPaymentSource },
  ],
};

module.exports = [CustomerRoute];
