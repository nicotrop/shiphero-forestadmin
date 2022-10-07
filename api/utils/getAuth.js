require("dotenv").config();

const getAuth = () => {
  const toBeEncoded = process.env.API_KEY + ":" + process.env.API_SECRET;
  let bufferObj = Buffer.from(toBeEncoded, "utf8");
  let base64 = bufferObj.toString("base64");
  let auth = "Basic " + base64;
  return auth;
};

module.exports = getAuth;
