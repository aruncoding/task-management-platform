const winston = require('winston');

const {
  LOG_LEVEL = 'info',
  NODE_ENV = 'development',
} = process.env;

const isProductionEnvironment = NODE_ENV === 'production';

const loggerFormat = isProductionEnvironment
  ? winston.format.json()
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    );

const loggerTransports = [
  new winston.transports.Console(),
];

const applicationLogger = winston.createLogger({
  level: LOG_LEVEL,
  format: loggerFormat,
  transports: loggerTransports,
});

module.exports = applicationLogger;