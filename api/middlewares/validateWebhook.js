const HmacSHA256 = require("crypto-js/hmac-sha256");
require("dotenv").config();
const encBase64 = require("crypto-js/enc-base64");

const validateWebhook = (req, res, next) => {
  const generated_hash = HmacSHA256(
    req.rawbody,
    process.env.SHIPHERO_API_SECRET
  ).toString(encBase64);
  if (generated_hash === req.headers["x-shiphero-hmac-sha256"]) {
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
