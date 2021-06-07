const express = require('express')
const http = require('http')
const cors = require('cors')
const bodyParser = require('body-parser')
const config = require('./config')
const {CONNECTION} = require('./serverlogic/RDS')

/** BEGIN AUTH-PG */
const authPG = require('@nodeauth/auth-pg')
const pg = require('pg')
const client = new pg.Client(config.DBs.authenticationServer)
CONNECTION.con = client
authPG.create({pgClient: client})
client.connect()
/** END AUTH-PG */



const app = express()
app.use(cors())
// TODO bodyParser is dprecated
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
// ERROR HANDLING DONE IN ./APIs.js

/** BEGIN API ROUTES */
const APIS = require('./APIs')
const AuthRoutes = require('./routes/AuthenticationRoute')
const UserRoutes = require('./routes/UserRoutes')
APIS(app, [AuthRoutes, UserRoutes])
/** END APIS ROUTES */

const httpServer = http.createServer(app)

const SERVER_PORT = config.port


httpServer.listen(SERVER_PORT, () => {
  console.log(`Example app listening at http://localhost:${SERVER_PORT}`)
})
