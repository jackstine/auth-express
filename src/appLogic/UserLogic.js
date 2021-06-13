const config = require("../config");
const emails = require("../static/emails");

const sendVerifyInformation = function (userInfo, verification_code) {
  let verificationLink = `${config.websiteURL}user/verify?firstName=${userInfo.first_name}&lastName=${userInfo.last_name}&verify=${verification_code}`;
  emails.createVerificationEmail(userInfo.email, {
    company: config.company_name,
    name: `${userInfo.first_name} ${userInfo.last_name}`,
    verificationLink: verificationLink,
  });
  // LATER get rid of the console log on the verification Link
  console.log(verificationLink);
};

module.exports = {
  sendVerifyInformation,
};
