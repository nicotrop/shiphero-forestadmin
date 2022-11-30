// const getHours = require("date-fns/getHours");

// const result = getHours(new Date());

// console.log(result);

var date = new Date();

function roundMinutes(date) {
  date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
  date.setMinutes(0, 0, 0); // Resets also seconds and milliseconds

  return date;
}
// console.log(date);
console.log(roundMinutes(date));
