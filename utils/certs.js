const fs = require("fs");
const path = require("path");

const readCert = (name) => {
  const filename = path.join(__dirname, "../certs/", name);

  return fs.readFileSync(filename);
};

const certs = {
  keycloak: readCert("keycloak.pem"),
};

module.exports = certs;
