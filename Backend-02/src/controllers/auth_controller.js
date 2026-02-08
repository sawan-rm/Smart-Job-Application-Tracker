const pool = require("../config/db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
    );

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Serever error" });
  }
};

// Login
const login = async (req, res) => {
  // console.log("JWT_SECRET:", process.env.JWT_SECRET);
// console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET);

  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    if (user.is_deleted || user.is_blocked) {
      return res.status(403).json({ message: "Account disabled" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //  Create Access Token (short-lived)
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }, // 15 minutes
    );

    //  Create Refresh Token (long-lived)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }, // 7 days
    );


    // Store refresh token in separate table
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user.id, refreshToken]
    );

    //  Send both tokens to client
    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Log-out
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // Revoke refresh token
    const [result] = await pool.query(
      "UPDATE refresh_tokens SET is_revoked = true WHERE token = ?",
      [refreshToken]
    );

    // Optional safety check
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Token not found" });
    }

    res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Log-Out-All
const logoutAll = async (req, res) => {
  const userId = req.userId;

  await pool.query(
    "UPDATE refresh_tokens SET is_revoked = true WHERE user_id = ?",
    [userId]
  );

  res.json({ message: "Logged out from all devices" });
};


module.exports = { register, login, logout, logoutAll };
