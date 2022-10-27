// const { format } = require("date-fns");

const requestPrep2 = async (req, res, next) => {
  const { from_address, to_address } = req.body;

  //Import req objects
  const serviceDetails = req.serviceDetails;
  const packageDetails = req.packageDetails;

  //Use verified address from ShipEngine
  const verifiedAddress = req.verifiedAddress;

  //Create request body object
  let body = {};
  body = {
    shipment: {
      service_code: serviceDetails.service_code,
      ship_to: {
        name: to_address.name,
        address_line1: verifiedAddress.address_line1,
        city_locality: verifiedAddress.city_locality,
        state_province: verifiedAddress.state_province,
        postal_code: verifiedAddress.postal_code,
        country_code: verifiedAddress.country_code,
        phone: to_address.phone || "",
        address_residential_indicator:
          verifiedAddress.address_residential_indicator === "yes" || "unknown"
            ? "yes"
            : "no",
      },
      ship_from: {
        company_name: from_address.company_name,
        name: "ecomspaces fulfillment",
        phone: from_address.phone,
        address_line1: from_address.address_1,
        city_locality: from_address.city,
        state_province: from_address.state,
        postal_code: from_address.zip,
        country_code: from_address.country,
        address_residential_indicator: "no",
      },
      insurance_provider: "shipsurance",
      packages: packageDetails,
    },
  };

  //Add customs info for international shipments if needed
  if (serviceDetails.international === true) {
    body.shipment.customs = req.shipengineCustoms.customs;
  }
  console.log("Request body created");
  req.requestBody = body;
  return next();
};

module.exports = requestPrep2;
