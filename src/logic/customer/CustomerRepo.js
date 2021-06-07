const RDS = require('../../serverlogic/RDS')

/**
 * customers are not users
 * users can be a customer
 * a customer must be a user
 * billing {line1, line2, state, country, postal_code}
 * user_id, email, stripe_id, created_date
 * 
 * indexes on user_id, email, stripe_id
 */
class CustomerRepo extends RDS.RDS1 {
  constructor () {
    super({
      tableName: 'customers',
      schema: 'customers',
      columns: ['user_id', 'email', 'stripe_id', 'line1', 'line2', 'country', 'postal_code'],
      primaryIDColumn: ['user_id']
    })
  }

  async createCustomer (email, user_id, stripe_id, billing) {
    // Note: customers that need shipping will be done differently
    let record = {
      id: user_id,
      email: email,
      stripe_id: stripe_id,
      line1: billing.line1,
      line2: billing.line2,
      email: billing.email,
      country: billing.country,
      postal_code: billing.postal_code
    }
    return await this._insert(record)
  }
}


module.exports = new CustomerRepo()
