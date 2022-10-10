const axios = require("axios");
const express = require("express");
const { PermissionMiddlewareCreator } = require("forest-express-mongoose");
require("dotenv").config();
const getAuth = require("../api/utils/getAuth");
const auth = getAuth();
const { secondshipments } = require("../models");

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator(
  "secondshipments"
);

// This file contains the logic of every route in Forest Admin for the collection secondshipments:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

//Create Smart Action
router.post(
  "/actions/void-shipment",
  permissionMiddlewareCreator.smartAction(),
  async (req, res) => {
    let shipmentID = req.body.data.attributes.ids[0];
    let shipment = await secondshipments.findById(shipmentID);
    console.log(shipment.label_id);
    console.log(process.env.SHIPENGINE_API_KEY);
    let response;
    //Void Shipment
    try {
      if (shipment.apiService == "shipengine") {
        const { data } = await axios.put(
          `https://api.shipengine.com/v1/labels/${shipment.label_id}/void`,
          {},
          {
            headers: {
              Host: "api.shipengine.com",
              "API-Key": process.env.SHIPENGINE_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );
        response = data;
      } else if (shipment.apiService == "shipstation") {
        const { data } = await axios.post(
          `https://ssapi.shipstation.com/shipments/voidlabel`,
          JSON.stringify({
            shipmentId: shipment.label_id,
          }),
          {
            headers: {
              Host: "ssapi.shipstation.com",
              Authorization: auth,
              "Content-Type": "application/json",
            },
          }
        );
        response = data;
      }
      shipment.label_status = "Voided";
      await shipment.save();
      res.send({ success: response.message });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Create a Shipment
router.post(
  "/secondshipments",
  permissionMiddlewareCreator.create(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
    next();
  }
);

// Update a Shipment
router.put(
  "/secondshipments/:recordId",
  permissionMiddlewareCreator.update(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
    next();
  }
);

// Delete a Shipment
router.delete(
  "/secondshipments/:recordId",
  permissionMiddlewareCreator.delete(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
    next();
  }
);

// Get a list of Shipments
router.get(
  "/secondshipments",
  permissionMiddlewareCreator.list(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
    next();
  }
);

// Get a number of Shipments
router.get(
  "/secondshipments/count",
  permissionMiddlewareCreator.list(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
    // Improve peformances disabling pagination: https://docs.forestadmin.com/documentation/reference-guide/performance#disable-pagination-count
    next();
  }
);

// Get a Shipment
router.get(
  "/secondshipments/\\b(?!count\\b):recordId",
  permissionMiddlewareCreator.details(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
    next();
  }
);

// Export a list of Shipments
router.get(
  "/secondshipments.csv",
  permissionMiddlewareCreator.export(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
    next();
  }
);

// Delete a list of Shipments
router.delete(
  "/secondshipments",
  permissionMiddlewareCreator.delete(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
    next();
  }
);

module.exports = router;
