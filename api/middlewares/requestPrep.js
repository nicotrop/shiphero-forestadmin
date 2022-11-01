const { format } = require("date-fns");

const requestPrep = async (req, res, next) => {
  const { from_address, to_address } = req.body;

  //Import req objects
  const serviceDetails = req.serviceDetails;
  const packageDetails = req.packageDetails;

  //Use verified address from ShipEngine
  const verifiedAddress = req.verifiedAddress;

  //Create request body object
  let body = {};
  if (serviceDetails.shippingCarrier === "UPS") {
    body = {
      shipment: {
        service_code: serviceDetails.code,
        ship_to: {
          name: to_address.name,
          address_line1: verifiedAddress.address_line1,
          address_line2: verifiedAddress.address_line2 || "",
          address_line3: verifiedAddress.address_line3 || "",
          city_locality: verifiedAddress.city_locality,
          state_province: verifiedAddress.state_province,
          postal_code: verifiedAddress.postal_code,
          country_code: verifiedAddress.country_code,
          address_residential_indicator:
            verifiedAddress.address_residential_indicator === "yes" || "unknown"
              ? "yes"
              : "no",
        },
        ship_from: {
          name: "ecomspaces fulfillment",
          company_name: from_address.company_name,
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
  } else if (serviceDetails.shippingCarrier === "DHL") {
    //Format date for Shipstation
    const date = format(new Date(), "yyyy-MM-dd hh:mm:ss");

    body = {
      carrierCode: serviceDetails.carrierCode,
      serviceCode: serviceDetails.code,
      packageCode: "package",
      confirmation: "delivery",
      shipDate: date,
      weight: {
        value: packageDetails.weight.value,
        units: packageDetails.weight.unit,
      },
      dimensions: packageDetails.dimensions,
      shipFrom: {
        name: "ecomspaces fulfillment",
        company: from_address.company_name,
        street1: from_address.address_1,
        street2: from_address.address_2,
        street3: null,
        city: from_address.city,
        state: from_address.state,
        postalCode: from_address.zip,
        country: from_address.country,
        phone: from_address.phone,
        residential: false,
      },
      shipTo: {
        name: to_address.name,
        company: to_address.company_name,
        street1: to_address.address_1,
        street2: to_address.address_2,
        street3: null,
        city: to_address.city,
        state: to_address.state,
        postalCode: to_address.zip,
        country: to_address.country,
        phone: to_address.phone,
        residential: true,
      },
      insuranceOptions: {
        provider: "shipsurance",
        insureShipment: true,
        insuredValue: packageDetails.insured_value.amount,
      },
      internationalOptions:
        to_address.country !== "US"
          ? {
              contents: "merchandise",
              customsItems: req.shipstationCustoms,
              nonDelivery: "treat_as_abandoned",
            }
          : null,
      advancedOptions: null,
      testLabel: true,
    };
  }
  console.log("Request body created");
  req.requestBody = body;
  return next();
};

module.exports = requestPrep;
