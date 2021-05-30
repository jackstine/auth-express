const jwt = require('jsonwebtoken')

let crypt = {
  en: function (object, key) {
    return new Promise((res, rej) => {
      jwt.sign(object, key, { algorithm: 'HS256'}, function(err, decoded) {
        if (err) {
          rej(err)
        } else {
          res(decoded)
        }
      })
    })
  },
  de: function (object, key) {
    return new Promise((res, rej) => {
      jwt.verify(object, key, { algorithm: 'HS256'}, function(err, decoded) {
        if (err) {
          rej(err)
        } else {
          res(decoded)
        }
      })
    })
  }
}

const randomInt = function (max) {
  return Math.floor(Math.random() * max)
}

const generateRandomString = function (lengthOfString) {
  let allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>,!@#$%^&*'
  let randomString = []
  for (let i = 0; i < lengthOfString; i++) {
    randomString.push(allowedChars[randomInt(allowedChars.length)])
  }
  return randomString.join('')
}

module.exports = {
  crypt,
  generateRandomString
}
