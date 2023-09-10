const dotenv = require("dotenv");
const config = dotenv.config({ path: `${__dirname}/../.././.env` });

if (config.error) {
  console.log("config error =====>>", config.error);
  throw new Error("Invalid Config");
}

const all = {
  env: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV == "production",
  isTest: process.env.NODE_ENV == "test" || process.env.NODE_ENV == "staging",
  isDev: process.env.NODE_ENV == "development" || process.env.NODE_ENV == null,
  PORT: process.env.PORT,
  MONGO: {
    URI: process.env.MONGODB_URI,
  },
  APP_URL: process.env.APP_URL,
  JWT: {
    SECRET: process.env.JWT_SECRET || "Secret",
    SALT_ROUNDS: process.env.SALT_ROUNDS || 10,
    EXPIRES_IN: process.env.EXPIRES_IN || "10h",
    REMEMBER_ME_EXPIRES_IN: process.env.REMEMBER_ME_EXPIRES_IN || "10d", // if user choose to remember me btn while logging into the portal
    COOKIE_EXPIRES_IN: process.env.COOKIE_EXPIRES_IN || "10h",
  },
  ETHEREAL: {
    ETHEREAL_USEREMAIL: process.env.ETHEREAL_USEREMAIL,
    ETHEREAL_USERPASSWORD: process.env.ETHEREAL_USERPASSWORD,
    EMAIL_SENDER_ADDRESS: process.env.EMAIL_SENDER_ADDRESS,
  },
  AWS: {
    AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
  },
};

module.exports = all;
