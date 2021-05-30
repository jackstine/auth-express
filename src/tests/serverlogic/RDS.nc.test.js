const RDS = require('../../serverlogic/RDS')

const TEST_TABLE = "authentication.passwords"

describe("RDS", function () { 
    it('should connect', function (done) {
        RDS.CONNECTION.query(`SELECT * from ${TEST_TABLE}`).then(resp => {
            done()
        })
    })
})
