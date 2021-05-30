const authPG = require('@nodeauth/auth-pg')
const config = require('../config')

const createUser = function (req, res) {
  let userInfo = req.body.user
  userInfo.user_id = userInfo.email
  authPG.auth.users.createUserVerificationAndPassword(userInfo).then(resp => {
    // TODO need to create email to make link for user verification
    let v = resp.verification.verification_code
    let verificationLink = `${config.websiteURL}/user/verify?firstName=${null}&lastName=${null}&verify=${v}`
    console.log(verificationLink)
    res.send(resp)
  })
}
// NOT IN THE PACKAGE
const updateUser = function (req, res) {
  let userInfo = req.body.user
  // TODO still need to finish this API
  authPG.auth.users.updateUser(userInfo).then(resp => {
    res.send(res)
  })
}

const verifyUser = function (req, res) {
  let verificationCode = req.body.verificationCode
  authPG.auth.users.verifyUser(verificationCode).then(resp => {
    res.send(resp)
  })
}

const forgotPassword = function (req, res) {
  let userId = req.body.email
  console.log(userId)
  authPG.auth.users.forgotPassword(userId).then(resp => {
    console.log(resp)
    // TODO send email to user with the new password, to confirm
    res.send({})
  })
}

const resetWithTempPassword = function (req, res) {
  let userId = req.body.userId
  let tempPassword = req.body.tempPassword
  let newPassword = req.body.newPassword
  authPG.auth.users.resetPasswordFromTemporaryPassword(userId, tempPassword, newPassword).then(resp => {
    res.send(resp)
  })
}

// NOT IN THE PACKAGE
const hasEmailForUser = function (req, res) {
  let email = req.param.email
  authPG.auth.users.hasEmail(email).then(hasEmail => {
    res.send(hasEmail)
  })
}

const UserRoutes = {
  extension: 'user',
  gets: [
    {func: hasEmailForUser, route: 'email'}
  ],
  posts: [
    {func: createUser, route: ""},
    {func: updateUser, route: "update"},
    {func: verifyUser, route: "verify"},
    {func: forgotPassword, route: "password/forgot"},
    {func: resetWithTempPassword, route: "password/forgot/reset"}
  ]
}

module.exports = [UserRoutes]