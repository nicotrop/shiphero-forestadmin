const axios = require("axios");
const { format, parseISO } = require("date-fns");
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

//Void Shipment
router.post(
  "/actions/void-shipment",
  permissionMiddlewareCreator.smartAction(),
  async (req, res) => {
    let shipmentID = req.body.data.attributes.ids[0];
    let shipment = await secondshipments.findById(shipmentID);
    // console.log(shipment.label_id);
    // console.log(process.env.SHIPENGINE_API_KEY);
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

      if (response.approved == true) {
        shipment.label_status = "Voided";
        await shipment.save();
        res.send({ success: response.message });
      } else {
        res.send({ error: "Unable to void label. Try again later" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Lookup label status
router.post(
  "/actions/check-label-status",
  permissionMiddlewareCreator.smartAction(),
  async (req, res) => {
    let shipmentID = req.body.data.attributes.ids[0];
    let shipment = await secondshipments.findById(shipmentID);

    console.log(shipment.tracking_number);

    if (shipment.apiService == "shipengine") {
      const config = {
        headers: {
          Host: "api.shipengine.com",
          "API-Key": process.env.SHIPENGINE_API_KEY,
          "Content-Type": "application/json",
        },
        params: {
          tracking_number: shipment.tracking_number,
        },
      };

      try {
        const { data } = await axios.get(
          `https://api.shipengine.com/v1/labels`,
          config
        );

        console.log(data);

        const finalArr = data.labels.map((elem) => {
          return {
            status: elem.status,
            created_at: format(parseISO(elem.created_at), "MM/dd/yyyy HH:mm"),
            shipment_cost: `${elem.shipment_cost.amount} ${elem.shipment_cost.currency}`,
            voided: elem.voided,
            voided_at: format(parseISO(elem.voided_at), "MM/dd/yyyy HH:mm"),
          };
        });
        res.send({
          html: `
        <strong class="c-form__label--read c-clr-1-2">Status</strong>
        <p class="c-clr-1-4 l-mb">${finalArr[0].status}</p>
        <strong class="c-form__label--read c-clr-1-2">Label creation date</strong>
        <p class="c-clr-1-4 l-mb">${finalArr[0].created_at}</p>
        <strong class="c-form__label--read c-clr-1-2">Shipment cost</strong>
        <p class="c-clr-1-4 l-mb">${finalArr[0].shipment_cost}</p>
        <strong class="c-form__label--read c-clr-1-2">isVoided</strong>
        <p class="c-clr-1-4 l-mb">${finalArr[0].voided}</p>
        <strong class="c-form__label--read c-clr-1-2">Voided date</strong>
        <p class="c-clr-1-4 l-mb">${finalArr[0].voided_at}</p>
        `,
        });
      } catch (error) {
        res.status(400).json({
          title: "Order search failed",
          message: error.message,
        });
      }
    } else {
      res.status(400).send({ error: "Not implemented yet" });
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
