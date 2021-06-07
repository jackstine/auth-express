const stripeAPI = require('../apis/stripe')
const ProductAndPriceRepo = require('../logic/products/ProductPriceRepo')

/**
 * 
 * @param {*} info.prodcut.name
 * @param {*} info.prodcut.shippable
 * @param {*} info.prodcut.active
 * @param {*} info.price.unitAmount
 * @param {*} info.prodcut.subscription - if true, else one-time...
 * @param {*} info.prodcut.nickname -
 */
const scriptToCreateStripeProductAndPrice = async function (ppInfo) {
  let pp = await stripeAPI.createProductandPrice(ppInfo)
  let info = {
    recurring: pp.price.recurring,
    unit_amount: pp.price.unit_amount,
    currency: pp.price.currency
  }
  let ppDB = await ProductAndPriceRepo.createProductAndPrice(pp.product.id, pp.price.id, info)
  return ppDB
}

const createInitialProducts = async function () {
  let memberPriceProduct = {
    product: {
      name: 'Member Tier',
      shippable: false,
      active: true,
      description: 'Member Tier, the first type of tier available'
    },
    price: {
      unit_amount: 1500,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'MemberPrice'
    }
  }
  let DeluxePriceProduct = {
    product: {
      name: 'Deluxe Tier',
      shippable: false,
      active: true
    },
    price: {
      unit_amount: 3000,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'DeluxePrice'
    }
  }
  let memberInfo = await scriptToCreateStripeProductAndPrice(memberPriceProduct)
  let deluxe = await scriptToCreateStripeProductAndPrice(DeluxePriceProduct)
  return {
    memberInfo,
    deluxe
  }
}


module.exports = {
  createInitialProducts
}