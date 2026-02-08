const express = require("express");
const app = express();

const jobRoutes = require("./Routes/jobRoutes.js");
const authRoutes = require("./Routes/auth_route.js");
const adminRoutes = require("./Routes/adminRoute.js");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(errorHandler)
// app.use((req, res, next) => {
//   console.log(req.method, req.originalUrl, req.headers.authorization);
//   next();
// });


app.use("/jobs", jobRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

module.exports = app;