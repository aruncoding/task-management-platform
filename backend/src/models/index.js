const fs = require('fs');
const path = require('path');
const { DataTypes, Sequelize } = require('sequelize');

const sequelize = require('../config/database');

const currentFileName = path.basename(__filename);

const database = {};

const modelFiles = fs
  .readdirSync(__dirname)
  .filter((fileName) => {
    return fileName !== currentFileName && fileName.endsWith('.js');
  });

modelFiles.forEach((fileName) => {
  const modelFactory = require(path.join(__dirname, fileName));

  const model = modelFactory(sequelize, DataTypes);

  database[model.name] = model;
});

Object.values(database).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(database);
  }
});

database.sequelize = sequelize;
database.Sequelize = Sequelize;

module.exports = database;