const TemporaryPasswordRepo = require('../../../../appSystems/auth/repos/TemporaryPasswordRepo')
const chai = require('chai')
chai.should()

describe("TemporaryPasswordRepo", function () {
  let userId = 'jacobCukjati@gmail.com'
  it('createTempPassword', function (done) {
    TemporaryPasswordRepo.createTempPassword(userId).then(resp => {
      console.log(resp)
      done()
    })
  })
  it('verifyTemporyPassword', function (done) {
    let tempPassword = 'ZYD2MDv4D'
    TemporaryPasswordRepo.verifyTemporyPassword(userId, tempPassword).then(resp => {
      console.log(resp)
      done()
    })
  })
  it('deleteAllOldTempPasswords', function (done) {
    TemporaryPasswordRepo.deleteAllOldTempPasswords().then(resp => {
      console.log(resp)
      done()
    })
  })
})
