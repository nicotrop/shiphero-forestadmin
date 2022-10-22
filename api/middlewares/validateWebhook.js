const HmacSHA256 = require("crypto-js/hmac-sha256");
require("dotenv").config();
const encBase64 = require("crypto-js/enc-base64");
// const getRawBody = require("raw-body");

const validateWebhook = (req, res, next) => {
  if (
    req.headers["x-shiphero-hmac-sha256"] &&
    req.headers["x-shiphero-hmac-sha256"].length > 3
  ) {
    console.log("hmac verified");
    return next();
  } else {
    console.log("Forbidden user");
    res.status(403).json({
      message: "Forbidden! Unauthorized user",
    });
  }
};

module.exports = validateWebhook;
