const authPG = require('@nodeauth/auth-pg')

const login = async function (req, res) {
  let user = req.body.user
  console.log(user)
  authPG.auth.token.login(user.email, user.password).then(resp => {
    // TODO when the user logins in with the forgotten password
    // I need to check a flag, and tell the front end
    // this will redirect the user to create a new password for that user
    console.log(resp)
    if (resp.success) {
      res.send(resp)
    } else {
      res.status(401, {message: 'GET OFF MY WEBSITE'})
    }
  })
}

// PROPABLY not going to call, will use in APIs to send new tokens to users.
const refreshToken = async function (req, res) {
  // TODO there is no authentication on this call
  let authToken = req.get('authentication')
  // TODO get the user info from the authTOken, and refresh it...... Something like that...
  authPG.auth.token.generateToken()
}

// this is going to be used to verify a token, not an API
const verifyToken = async function (req, res) {
  let authToken = req.get('authentication') // TODO put the authentication as the header for the token
  authPG.auth.token.authenticateToken(authToken).then(resp => {
    res.send(resp)
  })
}

const AuthenticationRoutes = {
  extension: 'auth',
  gets: [
    {func: verifyToken, route: "token/verify"}
  ],
  posts: [
    {func: login, route: "login"},
    {func: refreshToken, route: "token/refresh"}
  ]
}

module.exports = [AuthenticationRoutes]
