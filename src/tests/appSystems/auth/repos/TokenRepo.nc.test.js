const TokenRepo = require('../../../../appSystems/auth/repos/TokenRepo')
const {sleep} = require('../../../../common/U_Time')
 
describe('TokenRepo', function () {
  it('#getTest should generate new keys when time limit is reached', function (done) {
    this.timeout(0)
    TokenRepo.getKeyStore().then(async resp => {
      console.log(resp)
      for (let i = 0; i < TokenRepo.MAX_COUNT + 5; i++) {
        console.log(await TokenRepo.getKeyStore())
        await sleep(1)
      }
      for (let i = 0; i < TokenRepo.MAX_COUNT; i++) {
        await sleep(1)
        console.log(await TokenRepo.getKeyStore())
      }
      done()
    })
  })
  it('#getLastInserted', function (done) {
    TokenRepo.getLastInserted().then(resp => {
      console.log(resp)
      done()
    })
  })
  it('#__overTimeLimit', function (done) {
    TokenRepo.__getAllKeys().then(rrr => {
      TokenRepo.__overTimeLimit().then(resp => {
        console.log(resp)
        done()
      }).catch(console.error)
    }).catch(console.error)
  })
})
