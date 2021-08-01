const express = require("express");
var User = require("../models/user");
var passport = require("passport");

const cors = require("./cors");

const Users = require("../models/user");
const authenticate = require("../authenticate");

var userRouter = express.Router();
userRouter.use(express.json());

userRouter
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get("/", cors.corsOptions, authenticate.verifyUser, (req, res, next) => {
    Users.find({})
      .then(
        (user) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post("/signup", cors.corsOptions, (req, res, next) => {
    User.register(
      new User({ username: req.body.username }),
      req.body.password,
      (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.json({ err: err });
        } else {
          if (req.body.firstname) user.firstname = req.body.firstname;
          if (req.body.lastname) user.firstname = req.body.lastname;
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.json({ err: err });
              return;
            }
            passport.authenticate("local")(req, res, () => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ success: true, status: "Registation successful" });
            });
          });
        }
      }
    );
  })
  .post("/login", cors.corsOptions, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: false,
          status: "unsuccessful log in!",
          err: info,
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          res.statusCode = 401;
          res.setHeader("Content-Type", "application/json");
          res.json({
            success: false,
            status: "unsuccessful log in!",
            err: "Could not login user!",
          });
        }
        var token = authenticate.getToken({ _id: req.user._id });
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: false,
          status: "Login Successful",
          token: token,
        });
      });
    })(req, res, next);
  })
  .get("/checkJWTToken", cors.cors, (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        return res.json({ status: "JWT invalid!", success: false, err: info });
      } else {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        return res.json({ status: "JWT valid!", success: true, user: user });
      }
    })(req, res);
  });

module.exports = userRouter;
