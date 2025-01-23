const express = require("express");
const { register, login } = require("../controllers/usersController");
const router = express.Router();

// Routes
router.post("/register", register); // Register endpoint
router.post("/login", login); // Login endpoint

module.exports = router;
