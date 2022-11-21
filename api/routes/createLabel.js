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
// const validateShippingService2 = require("../middlewares/validateShipping2.0");
// const requestPrep2 = require("../middlewares/requestPrep2.0");
// const handleRequest2 = require("../middlewares/handleRequest2.0");
// const storeDB2 = require("../middlewares/storeDB2.0");

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
  }
);

// router.post(
//   "/webhooks/generate-label/:alias",
//   validateWebhook,
//   checkPackageInput,
//   validateAddress,
//   validateShippingService2,
//   requestPrep2,
//   handleRequest2,
//   storeDB2,
//   responseObject,
//   async (req, res) => {
//     const webhookResponse = req.webhookResponse;
//     res.status(200).json(webhookResponse);
//     // res.status(200).json(req.requestBody);
//   }
// );

module.exports = router;
