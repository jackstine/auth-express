const stripe = require('../../scripts/StripeScripts')

describe('#StripeScripts', function () {
  it('should create the products', function (done) {
    stripe.createInitialProducts().then(resp => {
      console.log(resp)
      done()
    }).catch(console.error)
  })
})