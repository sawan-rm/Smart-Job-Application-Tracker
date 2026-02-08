const express = require("express");
const router = express.Router();

const auth = require("../middleware/Auth_middleware.js");
const adminOnly = require("../middleware/AdminOnly.js");

const { getAllJobs } = require("../controllers/jobcontrollers.js");

// 🔐 ORDER MATTERS
router.use(auth);       // verifies token
router.use(adminOnly);  // checks role === ADMIN

router.get("/jobs", getAllJobs);

module.exports = router;
