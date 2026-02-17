module.exports = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(value => value.message).join(', ');
        err = new Error(message); // Convert to simple Error object to use its message
        err.statusCode = 400;
    }

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error"
    res.status(err.statusCode).json({ success: false, message: err.message });
}
