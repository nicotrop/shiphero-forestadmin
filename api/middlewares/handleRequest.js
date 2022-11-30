const axios = require("axios");
require("dotenv").config();
const getAuth = require("../utils/getAuth");
const auth = getAuth();
const sleep = require("../utils/sleep");

const handleRequest = async (req, res, next) => {
  const bodyInput = req.requestBody;
  const serviceDetails = req.serviceDetails;
  let data;
  try {
    //If carrier is UPS
    if (serviceDetails.shippingCarrier === "UPS") {
      sleep((60 / 198) * 1000).then(() =>
        console.log(
          "Slept 💤 for " + (((60 / 198) * 1000) / 1000).toFixed(2) + " seconds"
        )
      );

      //Make request to ShipEngine
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
      //If carrier is DHL
    } else if (serviceDetails.shippingCarrier === "DHL") {
      sleep((60 / 38) * 1000).then(() =>
        console.log(
          "Slept 💤 for " + (((60 / 38) * 1000) / 1000).toFixed(2) + " seconds"
        )
      );
      const { data: shipstationRes } = await axios.post(
        "https://ssapi.shipstation.com/shipments/createlabel",
        bodyInput,
        {
          headers: {
            Authorization: auth,
            Host: "ssapi.shipstation.com",
            "Content-Type": "application/json",
          },
        }
      );
      data = shipstationRes;
    }
    //Save one object for all the scenarios
    req.labelData = data;
    console.log("Succesful request to service provider");
    next();
  } catch (error) {
    console.log("Error ", error);
    res.status(401).json({
      title: "Label creation failed",
      message: error.message,
    });
  }
};

module.exports = handleRequest;
