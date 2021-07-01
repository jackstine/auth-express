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
      columns: ['user_id', 'email', 'stripe_id', 
        'line1', 'line2', 'country', 'postal_code',
        'city', 'state'
      ],
      primaryIDColumn: ['user_id']
    })
  }

  async createCustomer (user_id, email, stripe_id, billing) {
    // Note: customers that need shipping will be done differently
    let record = {
      user_id,
      email,
      stripe_id,
      line1: billing.line1,
      line2: billing.line2,
      country: billing.country,
      city: billing.city,
      state: billing.state,
      postal_code: billing.postal_code
    }
    return await this._insert(record)
  }

  async getCustomer (user_id) {
    return await this._selectOnePid(user_id)
  }

  async getCustomerByEmail (email) {
    return await this._selectWhere(`email='${email}'`)
  }

  async deleteAllCustomers () {
    return await this._execute('delete from customers.customers')
  }
}


module.exports = new CustomerRepo()
