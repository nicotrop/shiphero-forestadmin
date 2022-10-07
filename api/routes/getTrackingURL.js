//Import packages
const express = require("express");
const router = express.Router();

router.get("/tracking", async (req, res) => {
  const trackingNumber = req.query.trackingNumber;
  if (
    trackingNumber === undefined ||
    trackingNumber === "" ||
    trackingNumber === null ||
    trackingNumber.length < 8
  ) {
    res.status(400).json({
      error: "Please provide a valid tracking number",
    });
  } else {
    res
      .status(200)
      .redirect(
        `https://wwwapps.ups.com/WebTracking/processRequest?HTMLVersion=5.0&Requester=NES&AgreeToTermsAndConditions=yes&loc=en_US&tracknum=${trackingNumber}/trackdetails`
      );
  }
});

router.get("/tracking/dhl", async (req, res) => {
  const trackingNumber = req.query.trackingNumber;
  if (
    trackingNumber === undefined ||
    trackingNumber === "" ||
    trackingNumber === null ||
    trackingNumber.length < 8
  ) {
    res.status(400).json({
      error: "Please provide a valid tracking number",
    });
  } else {
    res
      .status(200)
      .redirect(
        `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`
      );
  }
});

module.exports = router;
