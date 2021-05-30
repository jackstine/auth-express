const Users = require('../../../../appSystems/auth/logic/users')
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
let vc = '3e5764ed-fa5a-4e40-be4e-fbe228d009d2'

describe('Users', function () {
  it('#createUser', function (done) {
    Users.createUser(userInfo).then(resp => {
      console.log(resp)
      done()
    })
  })
  it('#verifyUser', function (done) {
    Users.verifyUser(vc).then(resp => {
      console.log(resp)
      done()
    })
  })
})
