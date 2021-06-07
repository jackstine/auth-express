const RDS = require('../../serverlogic/RDS')

class ProductAndPriceRepo extends RDS.RDS1 {
  constructor () {
    super({
      tableName: 'products_and_pricing',
      schema: 'products',
      columns: ['product_id', 'price_id', 'info', 'active'],
      primaryIDColumn: ['product_id']
    })
  }

  async createProductAndPrice (product_id, price_id, info) {
    let record = {product_id,price_id,info,active: true} 
    return await this._insert(record)
  }

  async getActive () {
    return await this._selectWhere('active = true')
  }
}


module.exports = new ProductAndPriceRepo()
