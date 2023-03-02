const express = require("express");

const settings = require("../utils/settings");
const auth = require("../utils/auth");

const userController = require("../controllers/userController");
const roleController = require("../controllers/roleController");
const groupController = require("../controllers/groupController");
const jobTitleController = require("../controllers/jobTitleController");
const photoController = require("../controllers/photoController");
const lockController = require("../controllers/lockController");

const router = express.Router();

// UM administrator roles list to authorization
const umAdmin = settings.UM_ADMIN_ROLES.split(",");

// My info routes
const setMeToParams = (req, res, next) => {
  req.params.uid = auth.UID(req);
  next();
};

router.get("/", auth.check, setMeToParams, userController.getAuthInfo);
router.get("/me", auth.check, setMeToParams, userController.getUserByUID);
router.get("/me/full", auth.check, setMeToParams, userController.getFullUserByUID);
router.get("/me/roles", auth.check, setMeToParams, userController.getAuthRoles);

// Users lock
const setObjectParam = (req, res, next) => {
  req.params.object = 'users';
  next();
};
router.put("/lock/users/:object_id", auth.check, auth.meOrAs('object_id', umAdmin), setMeToParams, setObjectParam, lockController.newLock); // prettier-ignore
router.post("/lock/users/:object_id", auth.check, auth.meOrAs('object_id', umAdmin), setMeToParams, setObjectParam, lockController.updateLock); // prettier-ignore
router.delete("/lock/users/:object_id", auth.check, auth.meOrAs('object_id', umAdmin), setMeToParams, setObjectParam, lockController.deleteLock); // prettier-ignore

// Lock
router.get("/lock/:object/:object_id", auth.check, lockController.get);
router.put("/lock/:object/:object_id", auth.check, auth.as(umAdmin), setMeToParams, lockController.newLock);
router.post("/lock/:object/:object_id", auth.check, auth.as(umAdmin), setMeToParams, lockController.updateLock);
router.delete("/lock/:object/:object_id", auth.check, auth.as(umAdmin), setMeToParams, lockController.deleteLock);
router.get("/locks/:uid", auth.check, lockController.getByUser);
router.post("/locks/byfilter", auth.check, lockController.getByFilter);

// User
router.get("/users", auth.check, userController.getUsers);
router.get("/users/:page", auth.check, userController.getUsers);
router.get("/users/:page/:per_page", auth.check, userController.getUsers);
router.get("/user/:id", auth.check, userController.getUser);
router.get("/user/:id/full", auth.check, userController.getFullUser);
router.put("/user", auth.check, auth.as(umAdmin), userController.newUser);
router.put("/user/:id", auth.check, auth.meOrAs("id", umAdmin), userController.updateUser);
router.delete("/user/:id", auth.check, auth.as(umAdmin), userController.deleteUser);
router.get("/user/:id/roles", auth.check, userController.getRolesAsSlugs);
router.get("/user/:id/roles/full", auth.check, userController.getRoles);
router.put("/user/:id/roles", auth.check, auth.as(umAdmin), userController.updateRoles);
router.put("/user/:id/role/:roleId", auth.check, auth.as(umAdmin), userController.setRole);
router.delete("/user/:id/role/:roleId", auth.check, auth.as(umAdmin), userController.deleteRole);
router.get("/user/uid/:uid", auth.check, userController.getUserByUID);
router.get("/user/uid/:uid/full", auth.check, userController.getFullUserByUID);
router.get("/user/uid/:uid/roles", auth.check, userController.getRolesAsSlugsByUID);
router.get("/user/uid/:uid/roles/full", auth.check, userController.getRolesByUID);

router.get("/sync/users", auth.check, auth.as(umAdmin), userController.syncUsers);

// Role
router.get("/roles", auth.check, roleController.getRoles);
router.get("/role/:id", auth.check, roleController.getRole);
router.get("/role/slug/:slug", auth.check, roleController.getRoleBySlug);
router.put("/role", auth.check, auth.as(umAdmin), roleController.newRole);
router.put("/role/:id", auth.check, auth.as(umAdmin), roleController.updateRole);
router.delete("/role/:id", auth.check, auth.as(umAdmin), roleController.deleteRole);

// Group
router.get("/groups", auth.check, groupController.getGroups);
router.get("/group/:id", auth.check, groupController.getGroup);
router.get("/group/slug/:slug", auth.check, groupController.getGroupBySlug);
router.put("/group", auth.check, auth.as(umAdmin), groupController.newGroup);
router.put("/group/:id", auth.check, auth.as(umAdmin), groupController.updateGroup);
router.delete("/group/:id", auth.check, auth.as(umAdmin), groupController.deleteGroup);

// Job Title
router.get("/job_titles", auth.check, jobTitleController.getJobTitles);
router.get("/job_title/:id", auth.check, jobTitleController.getJobTitle);
router.get("/job_title/slug/:slug", auth.check, jobTitleController.getJobTitleBySlug);
router.put("/job_title", auth.check, auth.as(umAdmin), jobTitleController.newJobTitle);
router.put("/job_title/:id", auth.check, auth.as(umAdmin), jobTitleController.updateJobTitle);
router.delete("/job_title/:id", auth.check, auth.as(umAdmin), jobTitleController.deleteJobTitle);

// Photo
router.get("/photo/:user_id/:slug", photoController.getByUser);
router.post("/photo/:user_id/upload", auth.check, auth.meOrAs("user_id", umAdmin), photoController.uploadByUser);
router.delete("/photo/:user_id", auth.check, auth.meOrAs("user_id", umAdmin), photoController.deleteByUser);

module.exports = router;
