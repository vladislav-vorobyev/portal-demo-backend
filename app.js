const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const auth = require("./utils/auth");

const usersRouter = require("./routes/dashboard");
const umRouter = require("./routes/UM");

const Lock = require("./models/lock");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const app = express();
app.use(cors({ preflightContinue: true }));

// Authentication engine setup
app.use(auth.initialize());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);
app.use("/um", umRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

/**
 * Delete expired locks
 */
const lockEntityDelay = process.env.UM_LOCK_ENTITY_DELAY ?? 10 * 60; // seconds

setInterval(() => {
  Lock.deleteExpired(lockEntityDelay)
    .then((result) => {
      console.log("Deleted locks:", result);
    })
    .catch((err) => {
      if (err) console.error(err);
    });
}, lockEntityDelay * 1000);

module.exports = app;
