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
  let user_id = req.__authentication.data.user_id
  let user = await authPG.auth.users.getUser(user_id)
  res.send({success: req.__authentication.success, user})
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
