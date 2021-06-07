const ProductLogic = require('../../../logic/products/ProductLogic')

describe('ProductLogic', function () {
  describe('#getAllActiveProducts', function () {
    it('should get all the active products', function (done) {
      ProductLogic.getAllActiveProducts().then(resp => {
        console.log(resp)
        done()
      }).catch(console.error)
    })
  })
})
