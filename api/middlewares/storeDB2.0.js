//Import model
const { format } = require("date-fns");
const { secondshipments } = require("../../models");
const cloudinary = require("cloudinary").v2;

const storeDB = async (req, res, next) => {
  const serviceDetails = req.serviceDetails;
  const data = req.labelData;
  const verifiedAddress = req.verifiedAddress;

  let labelURL;

  //If DHL (shipstation) create PDF with cloudinary
  if (serviceDetails.shippingCarrier === "DHL") {
    //Format month for cloudinary
    const month = format(new Date(), "MMM-yyyy");
    //Configurer cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUD_name,
      api_key: process.env.API_key,
      api_secret: process.env.API_secret,
    });

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
    const newShipment = new secondshipments({
      label_status: "Created",
      order_number: req.body.order_number,
      store_name: req.body.shop_name,
      shipping_carrier: serviceDetails.shippingCarrier,
      shipping_method: serviceDetails.name,
      tracking_number: data?.tracking_number || data.trackingNumber,
      cost: data?.shipment_cost?.amount || data?.shipmentCost,
      to_address: `${verifiedAddress.city_locality}, ${verifiedAddress.country_code}`,
      zip: verifiedAddress.postal_code,
      date: new Date(),
      shipment_type:
        data.packages.length > 1 ? "multi-packages" : "single-package",
      apiService: "shipengine",
      label_id: data.label_id,
      shipment_labelURL: data.label_download.pdf,
    });

    if (serviceDetails.shippingCarrier === "DHL") {
      newShipment.packages = data.packages.map((elem, index) => {
        return {
          name: `Package ${index + 1}`,
          labelPDF: elem.label_download.pdf,
          trackingNumber: elem.tracking_number,
          trackingURL: `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${data.trackingNumber}`,
        };
      });
      newShipment.tracking_url = `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${data.tracking_number}`;
    } else if (serviceDetails.shippingCarrier === "UPS") {
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
