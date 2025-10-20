// middleware/dbCheck.js
const { isDbConnected } = require("../config/db");

function checkDbStatus(req, res, next) {
    if (!isDbConnected()) {
        return res.status(503).json({ message: "Database unavailable, please try again later." });
    }
    next();
}

module.exports = checkDbStatus;