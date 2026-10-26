const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = `Resource not found with identifier ${err.value}`;
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for '${field}'. Please provide an alternate value.`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => val.message);
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authorization token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Authorization token has expired';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
