const express = require("express");

const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();

//// CREATE POST
router.post("/", async (req, res) => {
  const post = new Post(req.body);
  try {
    const toAdd = await post.save();

    res.status(200).json(toAdd);
  } catch (e) {
    res.status(500).json(e);
  }
});

//// GET POST
router.get("/:id", async (req, res) => {
  try {
    const getPost = await Post.findById(req.params.id);

    res.status(200).json(getPost);
  } catch (e) {
    res.status(404).json("Post does not exist.");
  }
});

//// UPDATE POST
router.put("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  try {
    if (post.userId === req.body.userId) {
      await Post.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      res.status(200).json("Updated Post !");
    } else {
      res.status(403).json("Invalid Request !");
    }
  } catch (e) {
    res.status(404).json("Post not found");
  }
});

//// DELETE POST
router.delete("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  try {
    if (post.userId === req.body.userId) {
      await Post.findOneAndDelete(req.params.id);

      res.status(200).json("Deleted Post !");
    } else {
      res.status(403).json("Invalid Request !");
    }
  } catch (e) {
    res.status(404).json("Post not found");
  }
});

//// LIKE/DISLIKE POST
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });

      res.status(200).json("Liked !!");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });

      res.status(200).json("Disliked !!");
    }
  } catch (e) {
    res.status(404).json("Post not found");
  }
});

//// GET ALL POSTS BY USER
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

//// GET TIMELINE
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });

    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );

    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
