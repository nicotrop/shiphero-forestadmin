const checkPackageInput = (req, res, next) => {
  //Required keys
  const packageKeys = ["weight_in_oz", "width", "length", "height"];
  let packageCheck = true;
  let packageError = [];

  const { packages } = req.body;

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
    console.log(packageError);
    res.status(401).json({
      message: packageError,
    });
  } else {
    console.log("Package info validated by middleware");

    return next();
  }
};

module.exports = checkPackageInput;
