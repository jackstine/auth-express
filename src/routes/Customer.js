const CustomerLogic = require('../logic/customer/CustomerLogic')
const stripeAPI = require('../apis/stripe')

const authorizeCustomer = async function (req, res) {
  let user = req.body.user
  let product = req.body.product
  let price = req.body.price
  let authCustomer = await CustomerLogic.authorizeCustomer(user, {product, price})
  res.send(authCustomer)
}

const authorizeCreateCustomer = async function (req, res) {
  let user = req.body.user
  let customer = req.body.customer
  let price = req.body.price
  // TODO we might need more information for the customer
  // might have to add this to the UI
  // TODO passed in the id of the user, as new_user_id
  let cust = await CustomerLogic.createCustomer({
    user_id: user.user_id,
    new_user_id: user.id,
    ...customer
  })
  let custSub = await CustomerLogic.authorizeCustomer(
    user,
    {price},
    cust
  )
  res.send(custSub)
}

const makeSubscriptionPayment = async function (req, res) {
  // LAST
  let sub = req.body.sub
  let customer = req.body.customer
  let paymentMethod = req.body.paymentMethod
  let updatedSub = await stripeAPI.attachPaymentMethod(sub.id, paymentMethod.id, customer.id)
  console.log(updatedSub)
  res.send(updatedSub)
}

const CustomerRoute = {
  extension: 'customers',
  posts: [
    {route: 'authorize', func: authorizeCustomer, auth: false},
    {route: 'authorize/customer', func: authorizeCreateCustomer},
    {route: 'authorize/sale', func: makeSubscriptionPayment}
  ]
}

module.exports = [CustomerRoute]