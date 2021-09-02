const express = require("express");
const util = require("util");
const crypto = require("crypto");

const User = require("../models/User");

const router = express.Router();
const scrypt = util.promisify(crypto.scrypt);

//// ADD USER
router.post("/register", async (req, res) => {
  // making user object
  const user = new User({
    username: req.body.username,
    email: req.body.email,
  });

  try {
    // add to db
    const toAdd = await user.save();
    res.status(200).json(toAdd);
  } catch (e) {
    if (e.keyPattern.username == 1) {
      res.status(405).json("Username already in use");
    } else if (e.keyPattern.email == 1) {
      res.status(405).json("Email already in use");
    } else {
      res.status(405).json(e);
    }
  }
});

//// LOGIN
router.post("/login", async (req, res) => {
  try {
    // check for email
    const user = await User.findOne({
      email: req.body.email,
    });
    !user && res.status(404).send("User not found");

    res.status(200).json(user);
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
