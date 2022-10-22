const axios = require("axios");
require("dotenv").config();

const handleRequest2 = async (req, res, next) => {
  const bodyInput = req.requestBody;

  let data;
  try {
    const { data: shipEngineRes } = await axios.post(
      "https://api.shipengine.com/v1/labels",
      JSON.stringify(bodyInput),
      {
        headers: {
          Host: "api.shipengine.com",
          "API-Key": process.env.SHIPENGINE_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    data = shipEngineRes;
    req.labelData = data;
    console.log("Succesful request to service provider");
    next();
  } catch (error) {
    res.status(401).json({
      title: "Label creation failed",
      message: error,
    });
  }
};

module.exports = handleRequest2;
