const {CONNECTION} = require('../serverlogic/RDS')

before(function (done) {
  // set UTC as default timezone
  process.env.TZ="UTC"
  done()
})

after(function (done) {
  CONNECTION.close().then(resp => {
    done()
  })
})
