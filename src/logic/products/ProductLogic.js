const ProductAndPriceRepo = require('./ProductPriceRepo')
const stripeAPI = require('../../apis/stripe')
const e = require('express')
/**
 * -- get all products and prices that are active in database
-- get all products and prices from Stripe
-- return data through the API.
 */


/**
 * product : {
 *  product:
 *  prices: []
 * }
 */
const getAllActiveProducts = async function () {
  let pps = await ProductAndPriceRepo.getActive()
  let productIds = new Set(pps.map(el => el.product_id))
  let priceIds = new Set(pps.map(el => el.price_id))
  let stripePP = await Promise.all([
    stripeAPI.getActiveProducts(),
    stripeAPI.getAllPrices()
  ])
  let sProducts = stripePP[0]
  let sPrices = stripePP[1]
  sProducts = sProducts.data.filter(el => productIds.has(el.id))
  sPrices = sPrices.data.filter(el => priceIds.has(el.id))
  return sProducts.map(el => {
    return {
      product: el,
      prices: sPrices.filter(pr => pr.product === el.id)
    }
  })
}



module.exports = {
  getAllActiveProducts
}
