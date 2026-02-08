const express = require("express");
const router = express.Router();
const auth = require("../middleware/Auth_middleware.js");
const { body } = require("express-validator");

const {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getJobStats,
} = require("../controllers/jobcontrollers.js");
const { request } = require("../app.js");

router.use(auth);

router.post(
  "/",
  [body("company").notEmpty(), body("role").notEmpty()],
  createJob,
);

router.get("/stats", getJobStats);
router.get("/", getJobs);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

module.exports = router;
