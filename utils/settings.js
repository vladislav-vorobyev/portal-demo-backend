const {
  SCOPE = "openid",
  GRANT_TYPE = "password",
  CLIENT_ID = "local_oidc_secret",
  OPEN_ID_URL = "https://keycloak.office.local/realms/Office",
  CLIENT_SECRET = "SET ME HERE",
  UM_ADMIN_ROLES = "admin",
  LDAP_SEARCH_BASE,
  LDAP_SEARCH_FILTER,
  LDAP_PASSWORD,
  LDAP_BIND,
  LDAP_URLS,
} = process.env;

const LDAP_FIELDS_MAPPING = JSON.parse(process.env.LDAP_FIELDS_MAPPING);

module.exports = {
  SCOPE,
  GRANT_TYPE,
  CLIENT_ID,
  OPEN_ID_URL,
  CLIENT_SECRET,
  UM_ADMIN_ROLES,
  LDAP_SEARCH_BASE,
  LDAP_SEARCH_FILTER,
  LDAP_PASSWORD,
  LDAP_BIND,
  LDAP_URLS,
  LDAP_FIELDS_MAPPING,
};
