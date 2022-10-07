//Import model
const { format } = require("date-fns");
const { SecondShipments } = require("../../models/SecondShipments");
const cloudinary = require("cloudinary").v2;

const storeDB = async (req, res, next) => {
  const serviceDetails = req.serviceDetails;
  const data = req.labelData;
  const verifiedAddress = req.verifiedAddress;

  let labelURL;

  //TODO if statement if DHl or UPS create PDF with cloudinary
  if (serviceDetails.shippingCarrier === "DHL") {
    //Format month for cloudinary
    const month = format(new Date(), "MMM-yyyy");

    //Store label in cloudinary
    const PDFupload = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${req.labelData.labelData}`,
      {
        folder: `/${month}/${req.labelData.carrierCode}/${req.labelData.serviceCode}`,
        public_id: `${req.labelData.shipmentId}`,
      }
    );

    labelURL = PDFupload.secure_url;
  }

  req.labelURL = labelURL; //Store labelURL in req object

  //Store in database
  try {
    const newShipment = new SecondShipments({
      order_number: req.body.order_number,
      store_name: req.body.shop_name,
      shipping_carrier: serviceDetails.shippingCarrier,
      shipping_method: serviceDetails.name,
      label_id: data?.label_id || "n/a",
      tracking_number: data?.tracking_number || data.trackingNumber,
      cost: data?.shipment_cost?.amount || data?.shipmentCost,
      to_address: `${verifiedAddress.city_locality}, ${verifiedAddress.country_code}`,
      zip: verifiedAddress.postal_code,
      date: new Date(),
    });
    //Conditional if DHL or UPS
    if (serviceDetails.shippingCarrier === "DHL") {
      newShipment.shipment_type = "single-package";
      newShipment.apiService = "shipstation";
      newShipment.packages = [
        {
          name: `Package 1`,
          labelPDF: labelURL,
          tracking_number: data.trackingNumber,
          tracking_url: `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${data.trackingNumber}`,
        },
      ];
      newShipment.tracking_url = `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${data.trackingNumber}`;
    } else if (serviceDetails.shippingCarrier === "UPS") {
      newShipment.shipment_type =
        data.packages.length > 1 ? "multi-packages" : "single-package";
      newShipment.apiService = "shipengine";
      newShipment.packages = data.packages.map((elem, index) => {
        return {
          name: `Package ${index + 1}`,
          labelPDF: elem.label_download.pdf,
          trackingNumber: elem.tracking_number,
          trackingURL: `https://wwwapps.ups.com/WebTracking/processRequest?HTMLVersion=5.0&Requester=NES&AgreeToTermsAndConditions=yes&loc=en_US&tracknum=${elem.tracking_number}/trackdetails`,
        };
      });
      newShipment.tracking_url = `https://wwwapps.ups.com/WebTracking/processRequest?HTMLVersion=5.0&Requester=NES&AgreeToTermsAndConditions=yes&loc=en_US&tracknum=${data.tracking_number}/trackdetails`;
    }
    await newShipment.save();
    console.log("Shipment saved to database");
    return next();
  } catch (error) {
    res.status(401).json({
      title: "Database storage failed",
      message: error.message,
    });
  }
};

module.exports = storeDB;
