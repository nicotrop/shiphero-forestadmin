const { collection } = require("forest-express-mongoose");
const { secondshipments } = require("../models/secondshipments");

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection("secondshipments", {
  actions: [
    {
      name: "Void Shipment",
    },
    {
      name: "Check Label Status",
    },
    {
      name: "File a Claim",
    },
  ],
  fields: [
    {
      field: "Shipment details",
      type: "String",
      get: (elem) => {
        let packageCard = "";
        if (elem.packages) {
          packageCard = elem.packages.map((item) => {
            return `
            <div style="font-size: 14px; border-radius: 10px; width: 250px; background-color: #444857; color: white; padding: 10px;">
              <h4 style="font-size: 15px; font-weight: bolder;">Package number 📦</h4>
              <p  style="padding-top: 5px;">${item.name}</p>
              <h4 style="padding-top: 8px; font-size: 15px; font-weight: bolder;">Tracking number 🔢</h4>
              <p style="padding-top: 5px;">${item.trackingNumber}</p>
              <h4 style="padding-top: 8px; font-size: 15px; font-weight: bolder;">Shipping label 🧾</h4>
              <a style="padding-top: 5px;" href="${item.labelPDF}" target="blank">Label PDF</a>
              <h4 style="padding-top: 8px; font-size: 15px; font-weight: bolder;">Tracking URL 🧷</h4>
              <a style="padding-top: 5px;" href="${item.trackingURL}" target="blank">Tracking URL</a>
            </div>
            `;
          });
        }
        const display = `
        <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 10px;">
        ${packageCard}
        </div>
        `;
        return display;
      },
    },
  ],
  segments: [],
  fieldsToFlatten: [],
});
