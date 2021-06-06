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

const verifyGoogle = async function (req, res) {
  // TODO need to finish up
  let googleInfo = await authPG.auth.token.googleSignIn(req.body.token)
  if (googleInfo.success) {
    if (googleInfo.is_new_user) {
      let v = resp.verification.verification_code
      delete resp.verification
      let verificationLink = `${config.websiteURL}user/verify?firstName=${user.first_name}&lastName=${user.last_name}&verify=${v}`
      console.log(verificationLink)
      // TODO send verification token
    }
    res.send(googleInfo)
  }
  res.status(401)
  res.send('NOT AUTHORIZED')
}

const AuthenticationRoutes = {
  extension: 'auth',
  gets: [
    {func: verifyToken, route: "token/verify"}
  ],
  posts: [
    {func: login, route: "login", auth: false},
    {func: verifyGoogle, route: 'google', auth: false}
  ]
}

module.exports = [AuthenticationRoutes]
