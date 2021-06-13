const authPG = require("@nodeauth/auth-pg");
const emails = require("../static/emails");
const UserLogic = require("../appLogic/UserLogic");

const createUser = async function (req, res, next) {
  let userInfo = req.body.user;
  userInfo.email = userInfo.email;
  let resp = await authPG.auth.users.createUserVerificationAndPassword(userInfo);
  let v = resp.verification.verification_code;
  delete resp.verification;
  UserLogic.sendVerifyInformation(userInfo, v);
  res.send(resp);
};

const updateUser = async function (req, res) {
  /**
   * We need to update the user, only if the request is sent from
   * the user
   */
  let userInfo = req.body.user;
  // I have the auth token, which has the email in it.
  authPG.auth.users.updateUser(userInfo, req.__authenticationToken).then((resp) => {
    res.send(resp);
  });
};

const verifyUser = async function (req, res) {
  let verificationCode = req.body.verificationCode;
  authPG.auth.users.verifyUser(verificationCode).then((resp) => {
    res.send(resp);
  });
};

const forgotPassword = async function (req, res) {
  let email = req.body.email;
  authPG.auth.users.forgotPassword(email).then(async (resp) => {
    if (resp === null) {
      res.status(401);
      res.send();
    } else {
      // LATER get rid of console log here...
      console.log(resp);
      emails.createForgotPassword(email, {
        new_password: resp.password,
      });
      res.send({});
    }
  });
};

const resetWithTempPassword = async function (req, res) {
  let userId = req.body.email;
  let tempPassword = req.body.tempPassword;
  let newPassword = req.body.newPassword;
  authPG.auth.users
    .resetPasswordFromTemporaryPassword(userId, tempPassword, newPassword)
    .then(async (resp) => {
      if (resp) {
        let results = await Promise.all([
          authPG.auth.users.getUser(userId),
          authPG.auth.token.generateToken(userId),
        ]);
        res.send({ success: true, user: results[0], token: results[1] });
      } else {
        res.send("YOU SUCK");
      }
    });
};

const hasEmailForUser = async function (req, res) {
  let email = req.param.email;
  authPG.auth.users.getUser(email).then((hasEmail) => {
    if (hasEmail) {
      res.send({ hasEmail: true, email });
    } else {
      res.send({ hasEmail: false, email });
    }
  });
};

const getUser = async function (req, res) {
  let email = req.param.user;
  authPG.auth.users.getUser(email).then((user) => {
    res.send(user);
  });
};

const UserRoutes = {
  extension: "user",
  gets: [
    { func: hasEmailForUser, route: "email", auth: false },
    { func: getUser, route: ":user" },
  ],
  posts: [
    { func: createUser, route: "", auth: false },
    { func: verifyUser, route: "verify", auth: false },
    { func: forgotPassword, route: "password/forgot", auth: false },
    {
      func: resetWithTempPassword,
      route: "password/forgot/reset",
      auth: false,
    },
  ],
  puts: [{ func: updateUser, route: "" }],
};

module.exports = [UserRoutes];
