const express = require("express");
const authenticate = require("../authenticate");

const bookRouter = express.Router();
const cors = require("./cors");

const Books = require("../models/books");

bookRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Books.find(req.query)
      .populate("author")
      .then(
        (book) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(book);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAuthor,
    (req, res, next) => {
      req.body.author = req.user._id;
      Books.create(req.body)
        .then(
          (book) => {
            console.log("Book created");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(book);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Books.remove({})
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

bookRouter
  .route("/:bookId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Books.findById(req.params.bookId)
      .then(
        (book) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(book);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Books.findByIdAndUpdate(
      req.params.bookId,
      { $set: req.body },
      { new: true }
    ).then(
      (book) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(book);
      },
      (err) => next(err)
    );
  })
  .delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Books.findByIdAndRemove(req.params.bookId)
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = bookRouter;
