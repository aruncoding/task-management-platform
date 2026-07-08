require('dotenv').config();

const commonConfig = {
  username: process.env.DATABASE_USERNAME || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: Number(process.env.DATABASE_PORT) || 3306,
  dialect: 'mysql',
  logging: false,
};

module.exports = {
  development: {
    ...commonConfig,
    database: process.env.DATABASE_NAME || 'task_management_dev',
  },

  production: {
    ...commonConfig,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: false,
  },
};