const { SES } = require("@nodeauth/awslogic");
require("dotenv").config();

module.exports = {
  DBs: {
    authenticationServer: {
      host: process.env.AUTH_HOST,
      database: process.env.AUTH_DATABASE,
      user: process.env.AUTH_USER,
      password: process.env.AUTH_PASSWORD,
    },
  },
  google: {
    secret: process.env.GOOGLE_CLIENT_SECRET,
    clientId: process.env.GOOGLE_CLIENT_ID,
    token: process.env.GOOGLE_AUTH_TOKEN,
  },
  stripe: {
    secret: process.env.STRIPE_SECRET,
    clientId: process.env.STRIPE_CLIENT_ID,
  },
  websiteURL: "http://localhost:3000/",
  port: 8080,
  company_name: "Test Company",
  emailService: SES.createEmailService(process.env.AWS_EMAIL_SENDER, process.env.AWS_EMAIL_ARN),
};
