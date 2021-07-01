const CustomerRepo = require('../logic/customer/CustomerRepo')
const {CONNECTION} = require('../serverlogic/RDS')

CustomerRepo.deleteAllCustomers()
setTimeout(() => CONNECTION.close(), 2000)


