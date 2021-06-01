const authPG = require('@nodeauth/auth-pg')

const login = async function (req, res) {
  let user = req.body.user
  let authResp = await authPG.auth.token.login(user.email, user.password)
  if (authResp.success) {
    res.send(authResp)
  } else {
    res.status(401)
    res.send()
  }
}

const verifyToken = async function (req, res) {
  let authToken = req.get('authentication')
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
    {func: login, route: "login", auth: false}
  ]
}

module.exports = [AuthenticationRoutes]
