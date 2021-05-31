const authPG = require('@nodeauth/auth-pg')
const config = require('../config')

const createUser = async function (req, res, next) {
  let userInfo = req.body.user
  userInfo.user_id = userInfo.email
  let resp = await authPG.auth.users.createUserVerificationAndPassword(userInfo)
  // TODO need to create email to make link for user verification
  let v = resp.verification.verification_code
  let verificationLink = `${config.websiteURL}user/verify?firstName=${null}&lastName=${null}&verify=${v}`
  console.log(verificationLink)
  res.send(resp)
  // .catch(err => {
  //   console.log('asdlkfjhlkasdjflk')
  //   console.error(err)
  // })
}
// NOT IN THE PACKAGE
const updateUser = async function (req, res) {
  // TODO need auth
  let userInfo = req.body.user
  // TODO still need to finish this API
  authPG.auth.users.updateUser(userInfo).then(resp => {
    res.send(res)
  })
}

const verifyUser = async function (req, res) {
  let verificationCode = req.body.verificationCode
  authPG.auth.users.verifyUser(verificationCode).then(resp => {
    res.send(resp)
  })
}

const forgotPassword = async function (req, res) {
  let userId = req.body.email
  console.log(userId)
  authPG.auth.users.forgotPassword(userId).then(resp => {
    console.log(resp)
    // TODO send email to user with the new password, to confirm
    res.send({})
  })
}

const resetWithTempPassword = async function (req, res) {
  let userId = req.body.user_id
  let tempPassword = req.body.tempPassword
  let newPassword = req.body.newPassword
  authPG.auth.users.resetPasswordFromTemporaryPassword(userId, tempPassword, newPassword).then(async resp => {
    if (resp) {
      let user = await authPG.auth.users.getUser(userId)
      res.send({success: true, user})
    } else {
      // TODO need to send error on reset with temp password
      res.send('YOU SUCK')
    }
  })
}

const hasEmailForUser = async function (req, res) {
  // TODO need authentication
  let email = req.param.email
  // NOTE email is the same thing as user_id
  authPG.auth.users.getUser(email).then(hasEmail => {
    if (hasEmail) {
      res.send({hasEmail: true, email})
    } else {
      res.send({hasEmail: false, email})
    }
  })
}

const getUser = async function (req, res) {
  // TODO need authentication
  let user_id = req.param.user
  authPG.auth.users.getUser(user_id).then(user => {
    res.send(user)
  })
}

const UserRoutes = {
  extension: 'user',
  gets: [
    {func: hasEmailForUser, route: 'email'},
    {func: getUser, route: '/:user'}
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