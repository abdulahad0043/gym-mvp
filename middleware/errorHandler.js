const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} ->`, err.message);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server error' });
};
module.exports = { errorHandler };
