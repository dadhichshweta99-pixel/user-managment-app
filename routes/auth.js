const express = require("express");
const router = express.Router();

// signup route
router.get("/signup", (req, res) => {
  res.render("signup");
});

// login route
router.get("/login", (req, res) => {
  res.render("login");
});

module.exports = router;