const stripeAPI = require('../../apis/stripe')
const CustomerRepo = require('./CustomerRepo')


const createCustomer = async function (customerInfo) {
  // TODO need to have the customer Info
  let sC = await stripeAPI.createCustomer(customerInfo)
  let dbC = await CustomerRepo.createCustomer(customerInfo)
}

const getPaymentMethodsForCustomer = async function (customerId) {

}


