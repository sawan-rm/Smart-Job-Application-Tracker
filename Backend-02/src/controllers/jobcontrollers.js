const pool = require("../config/db.js");
const { validationResult } = require("express-validator");

const createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { company, role, status, notes } = req.body;
  const userId = req.userId;
  // console.log("user id is :", userId);

  const allowedStatus = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

  if (status && !allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  if (!company || !role) {
    return res.status(400).json({ message: "Company and role required" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO jobs 
     (user_id, company, role, status, notes, applied_date)
     VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, company, role, status || "APPLIED", notes || null],
    );

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      company,
      role,
      status,
      notes,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "server error" });
  }
};

// READ jobs
const getJobs = async (req, res) => {
  const userId = req.userId;
  const { status, sort, page = 1, limit = 5, search } = req.query;

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Number(limit) || 5, 50);

  const offset = (pageNum - 1) * limitNum;

  try {
    let baseQuery = "FROM jobs WHERE user_id = ?";
    let values = [userId];

    // FILTER
    if (status) {
      baseQuery += " AND status = ?";
      values.push(status);
    }

    // SEARCH
    if (search) {
      baseQuery += " AND (LOWER(company) LIKE ? OR LOWER(role) LIKE ?)";
      values.push(`%${search}%`, `%${search}%`);
    }

    // Total count
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total ${baseQuery}`,
      values,
    );

    // SORT
    let orderBy = " ORDER BY applied_date DESC";

    if (sort === "oldest") orderBy = " ORDER BY applied_date ASC";
    else if (sort === "company") orderBy = " ORDER BY company ASC";

    const [rows] = await pool.query(
      `SELECT * ${baseQuery}${orderBy} LIMIT ? OFFSET ?`,
      [...values, limitNum, offset],
    );

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      jobs: rows,
    });
  } catch (err) {
    console.error("Error from getJobs:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//  get job status
const getJobStats = async (req, res) => {
  const userId = req.userId;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        COUNT(*) AS total,
        SUM(status = 'APPLIED') AS applied,
        SUM(status = 'INTERVIEW') AS interview,
        SUM(status = 'REJECTED') AS rejected,
        SUM(status = 'OFFER') AS offer
      FROM jobs
      WHERE user_id = ?
      `,
      [userId],
    );

    res.json(rows[0]);
  } catch (err) {
    console.log("Error in getJobStats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//Get All Jobs
const getAllJobs = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM jobs");
  res.json(rows);
};

// UPDATE job
const updateJob = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { status, notes } = req.body;
  
  try {
    // Ownership check
    const [rows] = await pool.query("SELECT user_id FROM jobs WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const allowedStatus = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Build dynamic update
    const fields = [];
    const values = [];

    if (status) {
      fields.push("status = ?");
      values.push(status);

      if (status === "APPLIED") {
        fields.push("applied_date = CURRENT_TIMESTAMP");
      }
    }

    if (notes !== undefined) {
      fields.push("notes = ?");
      values.push(notes);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const [result] = await pool.query(
      `UPDATE jobs SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
      [...values, id, userId],
    );

    res.json({ message: "Job updated successfully" });
  } catch (err) {
    console.error("Error from updateJob:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE job
const deleteJob = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const [result] = await pool.query(
    "DELETE FROM jobs WHERE id = ? AND user_id=?",
    [id, req.userId],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Job not found" });
  }
  res.json({ message: "Job deleted" });
};

module.exports = {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getJobStats,
  getAllJobs,
};
