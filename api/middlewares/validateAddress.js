const axios = require("axios");
require("dotenv").config();

const validateAddress = async (req, res, next) => {
  const { to_address } = req.body;
  try {
    const { data } = await axios.post(
      "https://api.shipengine.com/v1/addresses/validate",
      JSON.stringify([
        {
          address_line1: to_address.address_1,
          address_line2: to_address.address_2 || null,
          address_line3: to_address.address_3 || null,
          city_locality: to_address.city,
          state_province: to_address.state,
          postal_code: to_address.zip,
          country_code: to_address.country,
          address_residential_indicator: "unknown",
        },
      ]),
      {
        headers: {
          "Content-Type": "application/json",
          "API-Key": process.env.SHIPENGINE_API_KEY,
          Host: "api.shipengine.com",
        },
      }
    );
    console.log("Address verified by Shipengine, status:", data[0].status);
    if (data[0].status == "verified") {
      req.verifiedAddress = data[0].matched_address;
    } else {
      req.verifiedAddress = {
        address_line1: to_address.address_1,
        address_line2: to_address.address_2 || null,
        address_line3: to_address.address_3 || null,
        city_locality: to_address.city,
        state_province: to_address.state,
        postal_code: to_address.zip,
        country_code: to_address.country,
        address_residential_indicator: "yes",
      };
    }
    return next();
  } catch (error) {
    res.status(401).json({
      title: "Address validation failed",
      message: error.message,
    });
  }
};

module.exports = validateAddress;
