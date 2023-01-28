//Import packages
const express = require("express");
const router = express.Router();
require("dotenv").config();
const axios = require("axios");
// const { format } = require("date-fns");
// const parseISO = require("date-fns/parseISO");

router.post("/orders", async (req, res) => {
  try {
    const { data } = await axios.get(`https://api.shipengine.com/v1/labels`, {
      headers: {
        Host: "api.shipengine.com",
        "API-Key": process.env.SHIPENGINE_API_KEY,
        "Content-Type": "application/json",
      },
      params: req.query,
    });
    res.status(200).json({ label: data });
  } catch (error) {
    res.status(400).json({
      title: "Order search failed",
      message: error,
    });
  }
});

router.get("/label/:tracking", async (req, res) => {
  const trackingNumber = req.params.tracking;
  try {
    const { data } = await axios.get(
      `https://api.shipengine.com/v1/labels?tracking_number=${trackingNumber}`,
      {
        headers: {
          Host: "api.shipengine.com",
          "API-Key": process.env.SHIPENGINE_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json({ label: data });
  } catch (error) {
    console.log("error message: ", error.message);
    res.status(400).json({
      error: error.message,
    });
  }
});

module.exports = router;
