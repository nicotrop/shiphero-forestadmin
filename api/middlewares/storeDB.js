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
      cost: data?.shipment_cost?.amount || data?.shipmentCost,
      to_address: `${verifiedAddress.city_locality}, ${verifiedAddress.country_code}`,
      zip: verifiedAddress.postal_code,
      date: new Date(),
    });
    //Conditional if DHL or UPS
    if (serviceDetails.shippingCarrier === "DHL") {
      newShipment.shipment_type = "single-package";
      newShipment.shipment_labelURL = labelURL;
      newShipment.apiService = "shipstation";
      newShipment.label_id = data.shipmentId;
      newShipment.tracking_number = data.trackingNumber;
      newShipment.packages = [
        {
          name: `Package 1`,
          labelPDF: labelURL,
          tracking_number: data.trackingNumber,
          tracking_url: `http://www.dhl.com/en/express/tracking.html?AWB=${data.trackingNumber}&brand=DHL`,
        },
      ];
      newShipment.tracking_url = `http://www.dhl.com/en/express/tracking.html?AWB=${data.trackingNumber}&brand=DHL`;
    } else if (serviceDetails.shippingCarrier === "UPS") {
      newShipment.shipment_type =
        data.packages.length > 1 ? "multi-packages" : "single-package";
      newShipment.apiService = "shipengine";
      newShipment.label_id = data.label_id;
      newShipment.tracking_number = data?.tracking_number;
      newShipment.shipment_labelURL = data.label_download.pdf;
      newShipment.packages = data.packages.map((elem, index) => {
        return {
          name: `Package ${index + 1}`,
          labelPDF: elem.label_download.pdf,
          trackingNumber: elem.tracking_number,
          trackingURL: `https://www.ups.com/mobile/track?trackingNumber={${elem.tracking_number}}`,
        };
      });
      newShipment.tracking_url = `https://www.ups.com/mobile/track?trackingNumber={${data.tracking_number}}`;
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
