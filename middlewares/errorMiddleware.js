// middleware/errorMiddleware.js

function errorHandler(err, req, res, next) {
    console.error(err.stack); // for logging

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        message: err.message || "An unexpected error occurred",
        // Optional: show error details in development
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
}

module.exports = errorHandler;