//Check if package object is valid
const checkPackageKeys = (packages) => {
  //Required keys
  const packageKeys = ["weight_in_oz", "width", "length", "height"];
  let packageCheck = true;
  let packageError = [];
  packages.forEach((item, index) => {
    packageKeys.forEach((key) => {
      if (
        item[key] === undefined ||
        item[key] === null ||
        isNaN(item[key]) === true
      ) {
        packageCheck = false;
        packageError.push(
          `Enter a valid '${key}' for ${`package ${index + 1}`}`
        );
      }
    });
  });
  if (packageCheck === false) {
    return { status: packageCheck, message: packageError };
  } else {
    return { status: packageCheck };
  }
};

module.exports = checkPackageKeys;
