//Import packages
const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const upsList = require("../upsService");

//Set up Auth0
const getAuth = require("../utils/getAuth");
const auth = getAuth();

//Get list of carriers on shipstation
router.get("/", async (req, res) => {
  try {
    const { data } = await axios.get("https://ssapi.shipstation.com/carriers", {
      headers: {
        Authorization: auth,
        Host: "ssapi.shipstation.com",
      },
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

//Get list of service offered by carrier on shipstation; input carrier code (test with ups_walleted)
router.get("/code/:carrierCode", async (req, res) => {
  const { carrierCode } = req.params;
  try {
    const { data } = await axios.get(
      `https://ssapi.shipstation.com/carriers/listservices?carrierCode=${carrierCode}`,
      {
        headers: {
          Authorization: auth,
          Host: "ssapi.shipstation.com",
        },
      }
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({
      error,
    });
  }
});

//Check if serviceCode is available on file
router.get("/:serviceCode", (req, res) => {
  const { serviceCode } = req.params;
  const exist = upsList.find((elem) => elem.code === serviceCode);
  if (exist) {
    res.status(200).json({
      exist,
    });
  } else {
    res.status(400).json({
      error: "Service code not found",
    });
  }
});

module.exports = router;
