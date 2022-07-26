const admin = require("firebase-admin");

admin.initializeApp({
  credential: refreshToken(process.env.OAUTH_REFRESH_TOKEN),
});

module.exports = admin;
