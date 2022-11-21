const upsService = require("../upsService.json");

const validateShippingService = (req, res, next) => {
  const { alias } = req.params;
  const { packages, to_address } = req.body;

  //Look up service details
  const serviceDetails = upsService.find((ups) => ups.alias === alias);
  req.serviceDetails = serviceDetails;

  //Check if county is available for shipping service
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
    }
  } else {
    console.log("Invalid shipping service");
    res.status(400).json({
      message: "Invalid shipping service",
    });
  }

  //Loop through packages to sum up weight and dimensions
  const weight = packages
    .map((elem) => elem.weight_in_oz)
    .reduce((a, b) => a + b);
  const width = packages.map((elem) => elem.width).reduce((a, b) => a + b);
  const length = packages.map((elem) => elem.length).reduce((a, b) => a + b);
  const height = packages.map((elem) => elem.height).reduce((a, b) => a + b);

  if (serviceDetails.shippingCarrier === "UPS") {
    //Create packageInput object
    // const packageInput = [
    //   {
    //     weight: {
    //       value: weight,
    //       unit: "ounce",
    //     },
    //     insured_value: {
    //       currency: "usd",
    //       // amount: value,
    //     },
    //     dimensions: {
    //       height: height,
    //       width: width,
    //       length: length,
    //       unit: "inch",
    //     },
    //   },
    // ];

    // // req.packageDetails = packageInput;
    // console.log(req.packageDetails);

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
  }

  if (
    serviceDetails.carrierCode === "dhl_express_worldwide" ||
    "ups_worldwide_expedited"
  ) {
    const customsValue = [];
    packages.forEach((element) => {
      element.line_items.forEach((item) => {
        customsValue.push(Number(item.customs_value));
      });
    });
    const value = customsValue.reduce((a, b) => a + b);
    if (serviceDetails.code === "dhl_express_worldwide") {
      const packageInput = {
        weight: { value: weight, unit: "ounces" },
        insured_value: { currency: "usd", amount: value },
        dimensions: { height, width, length, units: "inches" },
      };
      req.packageDetails = packageInput;
      //Create customsItems array for International shipments
      const customsItemsArr = [];
      packages.map((elem) => {
        return elem.line_items.map((item) => {
          if (item.ignore_on_customs !== true) {
            return customsItemsArr.push({
              customsItemId: item.line_item_id,
              description: item.customs_description,
              quantity: Number(item.quantity),
              value: Number(item.customs_value),
              harmonizedTariffCode: item.tariff_code,
              countryOfOrigin: item.country_of_manufacture || "US",
            });
          }
        });
      });
      req.shipstationCustoms = [...customsItemsArr];
    }
    if (serviceDetails.code === "ups_worldwide_expedited") {
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
    }
  }

  console.log("Shipping service validated");
  next();
  // }
};

module.exports = validateShippingService;
