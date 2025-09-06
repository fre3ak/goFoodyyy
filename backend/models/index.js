// models/index.js
const Sequelize = require('sequelize');
const sequelizeInstance = require('../config/db');

const db = {};

db.Product = require('./Product')(sequelizeInstance, Sequelize.DataTypes); // ✅ Product.js
db.Order = require('./Order')(sequelizeInstance, Sequelize.DataTypes);   // ✅ Order.js

db.Order.belongsTo(db.Product);

db.sequelize = sequelizeInstance;

module.exports = db;