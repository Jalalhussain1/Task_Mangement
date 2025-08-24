const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Default error
  let error = {
    message: 'Something went wrong!',
    status: 500
  };
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = err.message;
    error.status = 400;
  } else if (err.name === 'UnauthorizedError') {
    error.message = 'Unauthorized access';
    error.status = 401;
  } else if (err.name === 'NotFoundError') {
    error.message = 'Resource not found';
    error.status = 404;
  } else if (err.code === '23505') { // PostgreSQL unique constraint violation
    error.message = 'Resource already exists';
    error.status = 409;
  } else if (err.code === '23503') { // PostgreSQL foreign key constraint violation
    error.message = 'Referenced resource does not exist';
    error.status = 400;
  }
  
  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

