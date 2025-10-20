// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function authenticateStudentToken(req, res, next) {
    const token = req.cookies.arvys_siwes_student_token;

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Invalid token');

            return res.status(403).json({ success: false, message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
}

function authenticateAdminToken(req, res, next) {
    const token = req.cookies.arvys_siwes_admin_token;

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Invalid token');

            return res.status(403).json({ success: false, message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
}


module.exports = { authenticateStudentToken, authenticateAdminToken };