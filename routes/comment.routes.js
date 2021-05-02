import express from "express";
const router = express.Router({ mergeParams: true });
import Shoe from "../models/shoe.model.js";
import Comment from "../models/comment.model.js";
import {
  isLoggedIn,
  checkCommentOwnership,
} from "../middleware/authMiddleware.js";

router.get("/new", isLoggedIn, (req, res) => {
  // Find shoe by ID
  Shoe.findById(req.params.id, (err, shoe) => {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { shoe: shoe });
    }
  });
});

router.post("/", isLoggedIn, (req, res) => {
  // lookup shoe by ID
  Shoe.findById(req.params.id, (err, shoe) => {
    if (err) {
      console.log(err);
      res.redirect("/shoes");
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          console.log(err);
        } else {
          // Add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          // Save comment
          comment.save();

          shoe.comments.push(comment);
          shoe.save();
          req.flash("success", "Successfully added comment!");
          res.redirect("/shoes/" + shoe._id);
        }
      });
    }
  });
});

// Comments edit route
router.get("/:comment_id/edit", checkCommentOwnership, (req, res) => {
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) {
      res.redirect("back");
    } else {
      res.render("comments/edit", {
        shoe_id: req.params.id,
        comment: foundComment,
      });
    }
  });
});

// Comment update
router.put("/:comment_id", checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(
    req.params.comment_id,
    req.body.comment,
    (err, updatedComment) => {
      if (err) {
        res.redirect("back");
      } else {
        res.redirect("/shoes/" + req.params.id);
      }
    }
  );
});

router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "Comment deleted!");
      res.redirect("back");
    }
  });
});

export default router;