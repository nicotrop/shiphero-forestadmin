const sleep = require("./api/utils/sleep");

console.log("start");
sleep((200 / 60) * 1000).then(() =>
  console.log("end after " + ((200 / 60) * 1000) / 1000 + " seconds")
);
