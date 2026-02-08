const express = require("express");
const router = express.Router();
const refresh_token = require("../controllers/refresh_token.js");
const { register, login, logout, logoutAll } = require("../controllers/auth_controller.js");
const { route } = require("./jobRoutes.js");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts",
}); 

// PUBLIC routes
router.post("/login",loginLimiter, login);

router.post("/register", register);
router.post("/logout", logout);
router.post("/logout/all", logoutAll);

router.post("/refresh/token", refresh_token);


module.exports = router;
