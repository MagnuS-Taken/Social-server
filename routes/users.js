const express = require("express");
const util = require("util");
const crypto = require("crypto");

const User = require("../models/User");

const router = express.Router();
const scrypt = util.promisify(crypto.scrypt);

//// GET USER (QUERY METHOD)
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  const email = req.query.email;

  try {
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (username) {
      user = await User.findOne({ username: username });
    } else {
      user = await User.findOne({ email: email });
    }

    const { password, createdAt, updatedAt, isAdmin, ...ret } = user._doc;

    res.status(200).json(ret);
  } catch (e) {
    res.status(404).json("No such user");
  }
});

//// GET ALL FRIENDS/FOLLOWERS
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const friends = await Promise.all(
      user.following.map((fid) => {
        return User.findById(fid);
      })
    );

    let friendsList = [];
    friends.map((f) => {
      const { _id, username, profilePicture } = f;
      friendsList.push({ _id, username, profilePicture });
    });

    res.status(200).json(friendsList);
  } catch (e) {
    res.status(500).json(e);
  }
});

//// UPDATE USER
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        // salting
        const salt = crypto.randomBytes(8).toString("hex");
        const buf = await scrypt(req.body.password, salt, 64);
        req.body.password = `${buf.toString("hex")}.${salt}`;
      } catch (e) {
        return res.status(500).json(e);
      }
    }

    try {
      //updating
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      res.status(200).json("Updated Profile !");
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(403).json("Invalid request");
  }
});

//// DELETE USER
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      // deleting
      await User.findByIdAndDelete(req.params.id);

      res.status(200).json("Profile Deleted 0_0");
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(403).json("Invalid request");
  }
});

//// FOLLOW USER
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      // getting users
      const user = await User.findById(req.params.id);
      const toFollow = await User.findById(req.body.userId);

      if (!user.following.includes(req.body.userId)) {
        // updating following/followers
        await user.updateOne({ $push: { following: req.body.userId } });
        await toFollow.updateOne({ $push: { followers: req.params.id } });

        res.status(200).json("Now following !!");
      } else {
        res.status(403).json("Already following");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Invalid request");
  }
});

//// UNFOLLOW USER
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      // getting users
      const user = await User.findById(req.params.id);
      const toFollow = await User.findById(req.body.userId);

      if (user.following.includes(req.body.userId)) {
        // updating following/followers
        await user.updateOne({ $pull: { following: req.body.userId } });
        await toFollow.updateOne({ $pull: { followers: req.params.id } });

        res.status(200).json("Now unfollowed !!");
      } else {
        res.status(403).json("Not following");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Invalid request");
  }
});

module.exports = router;
