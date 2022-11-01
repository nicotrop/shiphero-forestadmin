const responseObject = (req, res, next) => {
  const data = req.labelData;
  const serviceDetails = req.serviceDetails;
  const packageDetails = req.packageDetails;

  //Create response object for Shiphero
  let webhookResponse = {};
  //Multiple packages
  if (packageDetails.length > 1) {
    webhookResponse = {
      code: "200",
      packages: data.packages.map((elem, index) => {
        return {
          name: `Package ${index + 1}`,
          shipping_method: serviceDetails.name,
          tracking_number: elem.tracking_number,
          cost: data.shipment_cost.amount / data.packages.length,
          label: elem.label_download.pdf,
          customs_info: "",
          shipping_carrier: serviceDetails.shippingCarrier,
          tracking_url: `https://www.ups.com/mobile/track?trackingNumber={${elem.tracking_number}}`,
        };
      }),
    };
    //Single package
  } else if (
    typeof packageDetails === "object" &&
    serviceDetails.shippingCarrier === "DHL"
  ) {
    console.log("entered webhook response");
    webhookResponse = {
      code: "200",
      shipping_method: serviceDetails.name,
      tracking_number: data.trackingNumber,
      cost: data?.shipmentCost,
      label: req?.labelURL,
      customs_info: "",
      shipping_carrier: serviceDetails.shippingCarrier,
      tracking_url: `http://www.dhl.com/en/express/tracking.html?AWB=${data.trackingNumber}&brand=DHL`,
    };
  } else if (
    packageDetails.length === 1 &&
    serviceDetails.shippingCarrier === "UPS"
  ) {
    webhookResponse = {
      code: "200",
      shipping_method: serviceDetails.name,
      tracking_number: data.tracking_number,
      cost: data.shipment_cost.amount,
      label: data.label_download.pdf,
      customs_info: "",
      shipping_carrier: serviceDetails.shippingCarrier,
      tracking_url: `https://www.ups.com/mobile/track?trackingNumber=${data.tracking_number}`,
    };
  }
  console.log("Response object created");
  req.webhookResponse = webhookResponse;
  next();
};

module.exports = responseObject;
