const express = require("express");
const authenticate = require("../authenticate");

const categoryRouter = express.Router();

const Categories = require("../models/categories");

categoryRouter
  .route("/")
  .get((req, res, next) => {
    Categories.find(req.query)
      .then(
        (category) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(category);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    authenticate.verifyUser,
    authenticate.verifyAuthor,
    (req, res, next) => {
      Categories.create(req.body)
        .then(
          (category) => {
            console.log("Category created");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(category);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Categories.remove({})
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

module.exports = categoryRouter;
