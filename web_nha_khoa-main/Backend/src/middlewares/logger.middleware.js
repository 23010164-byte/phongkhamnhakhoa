const morgan = require('morgan');
const logger = require('../utils/logger');

// Format custom: METHOD URL STATUS TIME — IP
const morganFormat = ':method :url :status :res[content-length]B - :response-time ms — :remote-addr';

const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
  skip: (req) => {
    // Bỏ qua log health check
    return req.url === '/health' || req.url === '/favicon.ico';
  },
});

module.exports = requestLogger;
