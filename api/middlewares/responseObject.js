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
          tracking_url: `https://wwwapps.ups.com/WebTracking/processRequest?HTMLVersion=5.0&Requester=NES&AgreeToTermsAndConditions=yes&loc=en_US&tracknum=${elem.tracking_number}/trackdetails`,
        };
      }),
    };
    //Single package
  } else {
    webhookResponse = {
      code: "200",
      shipping_method: serviceDetails.name,
      tracking_number: data.tracking_number || data.trackingNumber,
      cost: data?.shipment_cost?.amount || data?.shipmentCost,
      label: data?.label_download?.pdf || req?.labelURL,
      customs_info: "",
      shipping_carrier: serviceDetails.shippingCarrier,
      tracking_url:
        serviceDetails.shippingCarrier === "DHL"
          ? `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${data.trackingNumber}`
          : `https://wwwapps.ups.com/WebTracking/processRequest?HTMLVersion=5.0&Requester=NES&AgreeToTermsAndConditions=yes&loc=en_US&tracknum=${data.tracking_number}/trackdetails`,
    };
  }
  console.log("Response object created");
  req.webhookResponse = webhookResponse;
  next();
};

module.exports = responseObject;
