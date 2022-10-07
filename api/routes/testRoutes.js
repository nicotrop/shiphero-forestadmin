//Import packages
const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const { format } = require("date-fns");
const cloudinary = require("cloudinary").v2;

//Import models
const { shipments: Shipments } = require("../../models");

//Configurer cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_name,
  api_key: process.env.API_key,
  api_secret: process.env.API_secret,
});

// Set up Auth0
const getAuth = require("../utils/getAuth");
const validateAddress = require("../middlewares/validateAddress");
const checkPackageInput = require("../middlewares/checkPackageInput");
const requestPrep = require("../middlewares/requestPrep");
const handleRequest = require("../middlewares/handleRequest");
const responseObject = require("../middlewares/responseObject");
const storeDB = require("../middlewares/storeDB");
const validateShippingService = require("../middlewares/validateShippingService");
const auth = getAuth();

//Set date format
const date = format(new Date(), "yyyy-MM-dd hh:mm:ss");

router.post("/mongodbtest", async (req, res) => {
  const body = {
    shipping_carrier: "UPS",
    shipping_method: "UPS Ground",
    tracking_number: "1Z945FA30398055331",
    cost: 3.99,
    to: "Atlanta, USA",
    zip: "30310",
    date: date,
    label:
      "https://res.cloudinary.com/ecomspaces-atl/image/upload/v1660842552/ups_walleted/ups_next_day_air_saver/Aug-2022/601830122.pdf",
    tracking_url: `https://wwwapps.ups.com/WebTracking/processRequest?HTMLVersion=5.0&Requester=NES&AgreeToTermsAndConditions=yes&loc=en_US&tracknum=${`Z945FA30398055331`}/trackdetails`,
  };
  try {
    const newShipment = new Shipments({
      shipping_carrier: body.shipping_carrier,
      shipping_method: body.shipping_method,
      tracking_number: body.tracking_number,
      cost: body.cost,
      to: body.to,
      zip: body.zip,
      labelURL: body.label,
      tracking_url: body.tracking_url,
      date: date,
    });
    await newShipment.save();
    res.status(200).json(newShipment);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

router.post("/cloudinarytest", async (req, res) => {
  const PDFupload = await cloudinary.uploader.upload(
    `data:application/pdf;base64,${req.fields.labelData}`,
    {
      folder: `/test`,
      public_id: `testRoute`,
    }
  );
  res.status(200).json(PDFupload);
});

router.post("/shipenginecarriers", async (req, res) => {
  try {
    const response = await axios.get(`https://api.shipengine.com/v1/carriers`, {
      headers: {
        Host: "api.shipengine.com",
        "API-Key": process.env.SHIPENGINE_API_KEY,
        "Content-Type": "application/json",
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
});

router.post("/shipenginecarrierse", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.shipengine.com/v1/carriers/se-3172942`,
      {
        headers: {
          Host: "api.shipengine.com",
          "API-Key": process.env.SHIPENGINE_API_KEY,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

router.post("/comparerates", async (req, res) => {
  const { to_address, from_address, packages } = req.body;
  try {
    const { data: shipengineRes } = await axios.post(
      "https://api.shipengine.com/v1/rates",
      JSON.stringify({
        rate_options: {
          carrier_ids: ["se-3182212"],
          package_types: [],
        },
        shipment: {
          validate_address: "no_validation",
          ship_to: {
            name: to_address.name,
            phone: to_address.phone,
            address_line1: to_address.address_1,
            city_locality: to_address.city,
            state_province: to_address.state,
            postal_code: to_address.zip,
            country_code: to_address.country,
            address_residential_indicator: "yes",
          },
          ship_from: {
            company_name: from_address.company_name,
            name: from_address.name,
            phone: from_address.phone,
            address_line1: from_address.address_1,
            address_line2: from_address.address_2 || "",
            city_locality: from_address.city,
            state_province: from_address.state,
            postal_code: from_address.zip,
            country_code: from_address.country,
            address_residential_indicator: "no",
          },
          packages: [
            {
              weight: {
                value: packages[0].weight_in_oz,
                unit: "ounce",
              },
            },
          ],
        },
      }),
      {
        headers: {
          Host: "api.shipengine.com",
          "API-Key": process.env.SHIPENGINE_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const { data: shipstationRes } = await axios.post(
      "https://ssapi.shipstation.com/shipments/getrates",
      JSON.stringify({
        carrierCode: "ups_walleted",
        serviceCode: null,
        packageCode: null,
        fromPostalCode: from_address.zip,
        toState: to_address.state,
        toCountry: to_address.country,
        toPostalCode: to_address.zip,
        toCity: to_address.city,
        weight: {
          value: packages[0].weight_in_oz,
          units: "ounces",
        },
        dimensions: {
          units: "inches",
          length: packages[0].length,
          width: packages[0].width,
          height: packages[0].height,
        },
        confirmation: "delivery",
        residential: false,
      }),
      {
        headers: {
          Host: "ssapi.shipstation.com",
          Authorization: auth,
          "Content-Type": "application/json",
        },
      }
    );

    const comparingRates = shipstationRes.map((rate) => {
      const shipengineRate = shipengineRes.rate_response.rates
        .map((elem) => {
          if (elem.service_code === rate.serviceCode) {
            return elem.shipping_amount.amount;
          }
        })
        .filter((elem) => elem !== undefined && elem !== null);
      return {
        serviceCode: rate.serviceCode,
        shipstationRate: rate.shipmentCost,
        shipengineRate: Number(shipengineRate) || null,
      };
    });

    res.status(200).json(comparingRates);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

router.post(
  "/shipengineLabel/:alias",
  // validateWebhook,
  checkPackageInput,
  validateAddress,
  validateShippingService,
  requestPrep,
  handleRequest,
  storeDB,
  responseObject,
  async (req, res) => {
    const webhookResponse = req.webhookResponse;
    res.status(200).json(webhookResponse);
  }
);

router.post("/voidlabel", async (req, res) => {
  const { labelID } = req.body;
  try {
    const { data } = await axios.put(
      `https://api.shipengine.com/v1/labels/${labelID}/void`,
      {
        headers: {
          Host: "api.shipengine.com",
          "API-Key": process.env.SHIPENGINE_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
});

module.exports = router;
