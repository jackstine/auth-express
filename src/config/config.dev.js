require('dotenv').config()
module.exports = {
    DBs: {
        authenticationServer: {
            host: process.env.AUTH_HOST,
            database: process.env.AUTH_DATABASE,
            user: process.env.AUTH_USER,
            password: process.env.AUTH_PASSWORD
        }
    },
    google: {
      secret: process.env.GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID,
      token: process.env.GOOGLE_AUTH_TOKEN
    },
    websiteURL: 'http://localhost:3000/',
    port: 8080
}
