const jwt = require("passport-jwt");
const passport = require("passport");
const certs = require("./certs");
const User = require("../models/user");
const Role = require("../models/role");

// Authentication engine setup
passport.use(
  "jwt",
  new jwt.Strategy(
    {
      jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: certs.keycloak,
    },
    // verify function: put jwtPayload into request.user
    (jwtPayload, done) => done(null, jwtPayload)
  )
);

const initialize = () => passport.initialize();

// Get user UID from request
const UID = (request) => request?.user?.sub;

// Get user roles
const getRoles = async (uid) =>
  uid === "swadmin" // hardcoded admin user uid
    ? Role.getAll().then((_roles) => _roles.map((v) => v.slug)) // return all roles
    : User.getRolesAsSlugByUID(uid)
        .then((result) => result)
        .catch((err) =>
          User.getCount().then((count) => {
            // if no users at all then return full list of roles
            if (count === 0) {
              console.log("Users initialization mode: return all roles to any user!!!");
              return Role.getAll().then((_roles) => _roles.map((v) => v.slug));
            }
            // else pass error
            throw err;
          })
        );

/**
 * Route authentication function (check jwt)
 */
const check = passport.authenticate("jwt", { session: false });

/**
 * Route authorization function:
 * check that an authenticated user has at least one from available roles
 * @param {Array} roles list of available roles
 * @returns function for route processing
 */
const as = (roles) => async (req, res, next) => {
  // console.log(req.user);

  const uid = UID(req);
  if (!uid) {
    return res.sendStatus(401);
  }

  return getRoles(uid).then((_roles) => {
    console.debug(uid, _roles);

    const hasRole = _roles.some((r) => roles.includes(r));
    if (!hasRole) {
      return res.sendStatus(403);
    }

    return next();
  });
};

/**
 * Route authorization function:
 * check that an authenticated user has id = :user_id or has at least one from available roles
 * @param {String} paramName name of request param with user id
 * @param {Array} roles list of available roles
 * @returns function for route processing
 */
const meOrAs = (paramName, roles) => async (req, res, next) => {
  // console.log(req.user);
  // console.log("meOrAs", paramName, req.params[paramName]);

  const uid = UID(req);
  if (!uid) {
    return res.sendStatus(401);
  }

  return User.getByUID(uid)
    .first()
    .then((_u) => {
      if (!_u) {
        return res.sendStatus(403);
      }

      if (_u.id === parseInt(req.params[paramName], 10)) {
        // user has id = :user_id
        return next();
      }

      return as(roles)(req, res, next);
    });
};

module.exports = { initialize, check, as, meOrAs, getRoles, UID };
