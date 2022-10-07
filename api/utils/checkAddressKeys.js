//Check if address object is valid
const checkAddressKeys = (toObj) => {
  //Required keys
  const addressKeys = ["name", "address_1", "city", "state", "zip", "country"];
  let addressCheck = true;
  let addressError = [];
  addressKeys.forEach((key) => {
    if (
      (key === "zip" && toObj[key].length !== 5) ||
      (key === "zip" && isNaN(item[key]) === true)
    ) {
      addressError.push(`Invalid zip code`);
      addressCheck = false;
    } else if (toObj[key] === undefined) {
      addressCheck = false;
      addressError.push(`Input field '${key}' is required`);
    } else if (
      toObj[key].length < 1 ||
      toObj[key] === "" ||
      toObj[key] === null
    ) {
      addressCheck = false;
      addressError.push(`Enter a valid '${key}' value`);
    }
  });
  if (addressCheck === false) {
    return { status: addressCheck, message: addressError };
  } else {
    return { status: addressCheck };
  }
};

module.exports = checkAddressKeys;
