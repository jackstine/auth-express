const UserVerificationRepo = require('../../../../appSystems/auth/repos/UserVerificationRepo')
require('chai').should()

let userId = 'jacobcukjati@gmail.com'
let vc = 'c47f7f61-9957-4e0b-a867-f227d38bda77'

describe('UserVerificationRepo', function () {
  it('#getVerificationCode', function (done) {
    UserVerificationRepo.getVerificationCode(vc).then(resp => {
      console.log(resp)
      done()
    })
  })
  it('#createVerificationCode', function (done) {
    UserVerificationRepo.createVerificationCode(userId).then(async resp => {
      done()
    })
  })
})
