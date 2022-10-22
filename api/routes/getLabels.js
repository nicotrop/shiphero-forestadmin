//Import packages
const express = require("express");
const router = express.Router();
require("dotenv").config();
const axios = require("axios");
const { format } = require("date-fns");
const parseISO = require("date-fns/parseISO");

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

    const finalArr = data.labels.map((elem) => {
      return {
        status: elem.status,
        created_at: format(parseISO(elem.created_at), "MM/dd/yyyy HH:mm"),
        shipment_cost: `${elem.shipment_cost.amount} ${elem.shipment_cost.currency}`,
        voided: elem.voided,
        voided_at: format(parseISO(elem.voided_at), "MM/dd/yyyy HH:mm"),
        service_code: elem.service_code,
        tracking_number: elem.tracking_number,
        labelPDF: elem.label_download.pdf,
      };
    });
    res.status(200).json({ label: finalArr });
  } catch (error) {
    res.status(400).json({
      title: "Order search failed",
      message: error,
    });
  }
});

module.exports = router;
