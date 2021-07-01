const authPG = require("@nodeauth/auth-pg");
const UserLogic = require("../appLogic/UserLogic");
const CustomerRepo = require('../logic/customer/CustomerRepo')


let tokenize = function (tokenData) {
  let cust = undefined
  try {
    cust = await CustomerRepo.getCustomerByEmail(tokenData.user.email)
  } catch (ex) { 
    // ignore all others
  }
  return cust
}

const login = async function (req, res) {
  let user = req.body.user;
  let cust = tokenize({user}) 
  let authResp = await authPG.auth.token.login(user.email, user.password, cust);
  if (authResp.success) {
    res.send(authResp);
  } else {
    res.status(401);
    res.send();
  }
};

const verifyToken = async function (req, res) {
  let email = req.__authentication.data.email;
  let user = await authPG.auth.users.getUser(email);
  res.send({ success: req.__authentication.success, user });
};

const verifyGoogle = async function (req, res) {
  // TODO need to finish up
  let googleInfo = await authPG.auth.__token.googleSignin(req.body.token, tokenize);
  /**
   * have to generate a token for the user as well???
   */
  if (googleInfo.success) {
    if (googleInfo.is_new_user) {
      // TODO use the verify email
      let v = googleInfo.verification.verification_code;
      delete googleInfo.verification;
      UserLogic.sendVerifyInformation(googleInfo.user, v);
    }
    res.send(googleInfo);
  } else {
    res.status(401);
    res.send("NOT AUTHORIZED");
  }
};

const AuthenticationRoutes = {
  extension: "auth",
  gets: [{ func: verifyToken, route: "token/verify" }],
  posts: [
    { func: login, route: "login", auth: false },
    { func: verifyGoogle, route: "google", auth: false },
  ],
};

module.exports = [AuthenticationRoutes];
