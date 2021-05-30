const env = process.env.AUTH_ENV
const config = require('./config.' + env)
module.exports = config;
