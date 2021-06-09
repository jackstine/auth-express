const ProductAndPricingLogic = require('../logic/products/ProductLogic')

const getProductsAndPricing = async function (req, res) {
  let products = await ProductAndPricingLogic.getAllActiveProducts()
  res.send(products)
}

const ProductRoutes = {
  extension: 'products',
  gets: [
    {func: getProductsAndPricing, route: "", auth: false}
  ]
}

module.exports = [ProductRoutes]