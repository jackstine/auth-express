const CustomerLogic = require('../../../logic/customer/CustomerLogic')

let customerInfo = {
  user_id: '70d27b85-9a97-4aa5-9fae-0369b57c06ca',
  name: 'Jake Cukjati',
  billing: {
    city: 'Atlanta',
    country: 'US',
    line1: '214 7th Street',
    line2: '21 Apt',
    postal_code: '30304',
    state: 'GA',
  },
  email: 'ecstaticjack@gmail.com',
}

describe('#CustomerLogic', function () {
  describe('#authorizeCustomer', function () {
    it('it should return ', function (done) {
      let priceId = 'price_1Iz8BkDlG9dGBqJOoGajnfxV'
      let user_id = '70d27b85-9a97-4aa5-9fae-0369b57c06ca'
      CustomerLogic.authorizeCustomer({user_id: user_id},{price: {id: priceId}}).then(resp => {
        console.log(resp)
        done()
      }).catch(console.erro)
    })
  })
  describe('#createCustomer', function () {
    it('should create stripe and DB customer', function (done) {
      CustomerLogic.createCustomer(customerInfo).then(resp => {
        done()
      }).catch(console.error)
    })
  })
})