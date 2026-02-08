const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log("Ath is :", authHeader);
  
  // if (!authHeader || authHeader === "Bearer null") {
  //   return res.status(401).json({ message: "Token missing" });
  // }
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  // console.log("token is :", token);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decoded.id; // 🔥 THIS IS THE KEY
    req.userRole = decoded.role;
    next();
  } catch (err) {
    console.log("Error is :", err);
    
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
