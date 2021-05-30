const PasswordRepo = require('../../../../appSystems/auth/repos/PasswordRepo')
const chai = require('chai')
chai.should()

describe("PasswordRepo", function () {
  let userId = 'testuser'
  let ps1 = 'password'
  let ps2 = 'p@SSw0rd'
  it('should insert new password', function (done) {
    PasswordRepo.insert(userId, ps1).then(resp => {
      done()
    })
  })
  it('should verify the password', function (done) {
    PasswordRepo.checkPassword(userId, ps1).then(resp => {
      resp.should.be.equal(true)
      done()
    })
  })
  it('should verify that the password does not match', function (done) {
    PasswordRepo.checkPassword(userId, ps2).then(resp => {
      resp.should.be.equal(false)
      done()
    })
  })
  it('should update the password', function (done) {
    PasswordRepo.update(userId, ps1, ps2).then(resp => {
      done()
    }).catch(console.error)
  })
})
