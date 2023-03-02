const ldap = require("ldapjs");
const settings = require("../utils/settings");

const ldapFields = Object.keys(settings.LDAP_FIELDS_MAPPING);

// Map fields from LDAP entry to User structure
const mapLdap2User = (object) => {
  const user = {};
  ldapFields.forEach((field) => {
    user[settings.LDAP_FIELDS_MAPPING[field]] = object[field] ?? "";
  });
  return user;
};

// Make connection to LDAP
const makeClient = () =>
  new Promise((resolve, reject) => {
    const onLdapError = (error) => {
      console.error(`Error: ${error?.message}`);
      reject(error);
    };

    const client = ldap.createClient({
      url: settings.LDAP_URLS.split(";"),
    });

    client.on("error", onLdapError);

    client.bind(settings.LDAP_BIND, settings.LDAP_PASSWORD, onLdapError);

    resolve(client);
  });

// Fetch users from LDAP by filter
const fetchFromLDAP = (filter) =>
  new Promise((resolve, reject) => {
    const users = [];

    makeClient().then((client) => {
      client.search(
        settings.LDAP_SEARCH_BASE,
        {
          scope: "sub",
          filter,
          attributes: ldapFields,
        },
        (_f, res) => {
          res.on("error", (error) => {
            console.error(`Error: ${error?.message}`);
            reject(error);
          });

          res.on("searchEntry", (entry) => {
            const { object } = entry;

            const user = mapLdap2User(object);
            console.log("=== entry ===:", user);

            users.push(user);
          });

          res.on("end", () => {
            resolve(users);
          });
        }
      );

      client.unbind();
    });
  });

// Fetch all users from LDAP
const fetchAll = () => fetchFromLDAP(settings.LDAP_SEARCH_FILTER);

// Fetch users by ID
const fetchByID = (id) => {
  const filter = settings.LDAP_ID_FILTER.replace("{ID}", id);
  return fetchFromLDAP(filter);
};

module.exports = { fetchAll, fetchByID };
