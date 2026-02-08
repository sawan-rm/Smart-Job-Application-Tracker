const refresh_token = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ message: "Refresh token missing" });

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check DB (optional, but recommended)
    const [rows] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND refresh_token = ?",
      [decoded.id, refreshToken]
    );

    if (rows.length === 0) return res.status(403).json({ message: "Invalid refresh token" });

    // Issue a new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

module.exports = refresh_token;