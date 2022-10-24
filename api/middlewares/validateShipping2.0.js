const { carrierServices } = require("../../models");

const validateShippingService2 = async (req, res, next) => {
  const { alias } = req.params;
  const { packages, to_address } = req.body;

  //Look up service details
  const serviceDetails = await carrierServices.findOne({ alias: alias });
  req.serviceDetails = serviceDetails;
  // console.log(serviceDetails);

  //Create packageInput object
  if (serviceDetails) {
    //Check if county is available for shipping service
    if (serviceDetails.international === false && to_address.country !== "US") {
      console.log("This service is not available for international shipments");
      res.status(400).json({
        error: "This service is not available for international shipments",
      });
    } else if (
      serviceDetails.domestic === false &&
      to_address.country === "US"
    ) {
      console.log("This service is not available for domestic shipments");
      res.status(400).json({
        error: "This service is not available for domestic shipments",
      });
    } else if (serviceDetails.international === true) {
      //Loop through packages to sum up weight and dimensions
      const weight = packages
        .map((elem) => elem.weight_in_oz)
        .reduce((a, b) => a + b);
      const width = packages.map((elem) => elem.width).reduce((a, b) => a + b);
      const length = packages
        .map((elem) => elem.length)
        .reduce((a, b) => a + b);
      const height = packages
        .map((elem) => elem.height)
        .reduce((a, b) => a + b);

      //Sum value to insure with Shipsurance
      const customsValue = [];
      packages.forEach((element) => {
        element.line_items.forEach((item) => {
          customsValue.push(Number(item.customs_value));
        });
      });
      const insuredValue = customsValue.reduce((a, b) => a + b);

      //Create packageInput object
      const packageInput = [
        {
          weight: {
            value: weight,
            unit: "ounce",
          },
          insured_value: {
            currency: "usd",
            amount: insuredValue,
          },
          dimensions: {
            height: height,
            width: width,
            length: length,
            unit: "inch",
          },
        },
      ];

      req.packageDetails = packageInput;

      //Create customsItems array for International shipments
      const customsItemsArr = [];
      packages.map((elem) => {
        return elem.line_items.map((item) => {
          if (item.ignore_on_customs !== true) {
            return customsItemsArr.push({
              quantity: Number(item.quantity),
              value: {
                currency: "usd",
                amount: Number(item.customs_value),
              },
              harmonized_tariff_code: item.tariff_code,
              country_of_origin: item.country_of_manufacture || "US",
              description: item.customs_description,
              sku: item.sku,
              sku_description: item.customs_description,
            });
          }
        });
      });

      const customsArr = {
        customs: {
          contents: "merchandise",
          non_delivery: "treat_as_abandoned",
          customs_items: [...customsItemsArr],
        },
      };

      req.shipengineCustoms = { ...customsArr };

      console.log("Shipping service validated");
      next();
    } else {
      //Create packages array
      const packageInput = packages.map((elem) => {
        return {
          weight: {
            value: elem.weight_in_oz,
            unit: "ounce",
          },
          insured_value: {
            currency: "usd",
            amount: elem.line_items.reduce(
              (sum, value) => sum + Number(value.customs_value),
              0
            ),
          },
          dimensions: {
            height: elem.height,
            width: elem.width,
            length: elem.length,
            unit: "inch",
          },
        };
      });

      req.packageDetails = packageInput;

      console.log("Shipping service validated");
      next();
    }
  } else {
    console.log("Invalid shipping service");
    res.status(400).json({
      message: "Invalid shipping service",
    });
  }
};

module.exports = validateShippingService2;
