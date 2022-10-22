//Import packages
const express = require("express");
const router = express.Router();
require("dotenv").config();

//Import middlewares
const validateWebhook = require("../middlewares/validateWebhook");
const checkPackageInput = require("../middlewares/checkPackageInput");
const validateAddress = require("../middlewares/validateAddress");
const validateShippingService = require("../middlewares/validateShippingService");
const requestPrep = require("../middlewares/requestPrep");
const handleRequest = require("../middlewares/handleRequest");
const storeDB = require("../middlewares/storeDB");
const responseObject = require("../middlewares/responseObject");

router.post(
  "/webhooks/print-label/:alias",
  validateWebhook,
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
    // res.status(200).json({ message: "Webhook received" });
  }
);

module.exports = router;
