const express = require("express");

const commentRouter = express.Router();

const mongoose = require("mongoose");
const Comments = require("../models/comments");

const cors = require("./cors");

const authenticate = require("../authenticate");

commentRouter.use(express.json());

commentRouter
  .route("/")
  .get((req, res, next) => {
    Comments.find(req.quary)
      .populate("user")
      .then(
        (comments) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(comments);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
      req.body.user = req.user._id;
      Comments.create(req.body)
        .then(
          (comment) => {
            Comments.findById(comment._id)
              .populate("user")
              .then((comment) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(comment);
              });
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    } else {
      err = new Error("Comment not found in request body");
      ree.status = 404;
      return next(err);
    }
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /comments");
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Comments.remove({})
        .then(
          (resp) => {},
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

commentRouter
  .route("/:commentId")
  .get((req, res, next) => {
    Comments.findById(req.params.commentId)
      .then(
        (comment) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(comment);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /comments" + req.params.commentId);
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .then(
        (comment) => {
          console.log(req.user._id.toString());
          if (comment != null) {
            if (comment.user.id(req.user._id)) {
              var err = new Error(
                "You are not authorized to update this comment"
              );
              err.status = 403;
              return next(err);
            }
            req.body.user = req.user._id;
            Comments.findByIdAndUpdate(
              req.params.commentId,
              {
                $set: req.body,
              },
              { new: true }
            ).then(
              (comment) => {
                Comments.findById(comment._id)
                  .populate("user")
                  .then((comment) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(comment);
                  });
              },
              (err) => next(err)
            );
          } else {
            err = new Error("Comment " + req.params.commentId + "not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .then(
        (dish) => {
          if (dish != null) {
            if (!comment.auther.equal(req.user._id)) {
              var err = new Error(
                "You are not authorized to update this comment"
              );
              err.status = 403;
              return next(err);
            }
            Comments.findByIdAndRemove(req.params.commentId)
              .then(
                (resp) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(dish);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            err = new Error("Comment " + req.params.commentId);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = commentRouter;
