// models/index.js
const Sequelize = require('sequelize');
const sequelizeInstance = require('../config/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelizeInstance;

// Importing models
db.Admin = require('./Admin')(sequelizeInstance, Sequelize.DataTypes); // ✅ Admin.js
db.Product = require('./Product')(sequelizeInstance, Sequelize.DataTypes); // ✅ Product.js
db.Order = require('./Order')(sequelizeInstance, Sequelize.DataTypes);   // ✅ Order.js
db.Vendor = require('./Vendor')(sequelizeInstance, Sequelize.DataTypes); // ✅ Vendor.js

// Associate models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// db.Order.belongsTo(db.Product);
// db.Vendor.hasMany(db.Product);
// db.Vendor.hasMany(db.Order);
// db.Order.belongsTo(db.Vendor);
// db.Order.belongsTo(db.Product);

module.exports = db;