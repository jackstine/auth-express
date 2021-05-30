const {crypt} = require('../../common/crypt')

let key = "r+HdJsLp+O8nlm0QeId04Pu11vjD/DPoyLkwUgCB"
let obj = {
  hello: 'there',
  my: 5555,
  is: {
    tough: 'to',
    bbb: new Date(2020, 1, 1)
  }
}
describe('crypt', function () {
  it('should encrypt and decrypt', function (done) {
    crypt.en(obj, key).then(resp => {
        crypt.de(resp, key).then(resp2 => {
        console.log(resp2)
        done()
      })
    })
  })
})