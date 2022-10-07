const checkAddressInput = (req, res, next) => {
  const addressKeys = ["name", "address_1", "city", "zip", "country"];
  let addressCheck = true;
  let addressError = [];

  const { to_address } = req.body;

  addressKeys.forEach((key) => {
    if (to_address[key] === undefined || to_address[key] === null) {
      addressCheck = false;
      addressError.push(`Input field '${key}' is required`);
    } else if (to_address[key].length < 1 || to_address[key] === "") {
      addressCheck = false;
      addressError.push(`Enter a valid '${key}' value`);
    }
  });
  if (addressCheck === false) {
    console.log(addressError);
    res.status(401).json({
      message: addressError,
    });
  } else {
    console.log("Address input validated by middleware");
    return next();
  }
};

module.exports = checkAddressInput;
