const UserRepo = require('../../../../appSystems/auth/repos/UserRepo')
require('chai').should()

let userInfo = {
  firstName: 'jacob',
  lastName: 'cukjati',
  username: 'jacobCukjati@gmail.com',
  email: 'jacobCukjati@gmail.com',
  userId: 'jacobCukjati@gmail.com',
  phone: '8503616563'
}

describe('UserRepo', function () {
  it('#createUser', function (done) {
    UserRepo.createUser(userInfo).then(resp => {
      console.log(resp)
      done()
    })
  })
  it('#verifyUser', function (done) {
    UserRepo.verifyUser(userInfo.userId).then(async resp => {
      done()
    })
  })
  it('#hasEmail', function (done) {
    UserRepo.hasEmail(userInfo.email).then(async resp => {
      console.log(resp)
      done()
    })
  })
  it('#userIsVerified', function (done) {
    UserRepo.userIsVerified(userInfo.email).then(async resp => {
      console.log(resp)
      done()
    })
  })
  it('#getUserByUserId', function (done) {
    UserRepo.getUserByUserId(userInfo.email).then(async resp => {
      console.log(resp)
      done()
    })
  })
})
