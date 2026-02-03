require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI,
  dbName: process.env.MONGODB_DB_NAME || "stud_reg",
  sessionSecret: process.env.SESSION_SECRET || "dev_secret_change_me",
  sessionCookieName: process.env.SESSION_COOKIE_NAME || "sid",
};
