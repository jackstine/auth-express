const Token = require('../../../../appSystems/auth/logic/token')
require('chai').should()
 
let userInfo = {
  firstName: 'jacob',
  lastName: 'cukjati',
  username: 'jacobCukjati@gmail.com',
  email: 'jacobCukjati@gmail.com',
  userId: 'jacobCukjati@gmail.com',
  phone: '8503616563',
  password: 'password'
}
let vc = 'd4a2435d-9287-414c-aee7-824d5527e1d7'

describe('token', function () {
  it('#generateToken', function (done) {
    Token.generateToken(userInfo).then(resp => {
      console.log(resp)
      done()
    })
  })
  it('#authenticateToken', function (done) {
    Token.generateToken(userInfo).then(async resp => {
      console.log(resp)
      let auth = await Token.authenticateToken(resp)
      console.log(auth)
      auth.should.be.equal(true)
      // I thik throwing an error is ok
      let otherAuth = await Token.authenticateToken('eyJhbGciOiJIUzI1NiJ9.bmFtZUByYWVtaXN0ZW1haWwuY29t.d5qu_8bzMwhWygglDWKbY9n4daCYbnbR4w-enghUI5c')
      console.log(otherAuth)
      done()
    })
  })
  it('should login', function (done) {
    let user = userInfo.email
    let password = userInfo.password
    Token.login(user, password).then(resp => {
      console.log(resp)
      done()
    })
  })
})
