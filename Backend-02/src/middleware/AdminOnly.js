const adminOnly = (req, res, next) => {
    if(req.userRole !== "admin") {
        return res.status(403).json({message: "Admin Only"});
    }
    next();
}
module.exports = adminOnly;