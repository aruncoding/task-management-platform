const winston = require('winston');

const isProd = process.env.NODE_ENV === 'production';

const format = isProd
  ? winston.format.json()
  : winston.format.combine(winston.format.colorize(), winston.format.simple());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format,
  transports: [new winston.transports.Console()],
});

module.exports = logger;