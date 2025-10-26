// models/index.js
import Sequelize, { DataTypes } from 'sequelize';
import sequelizeInstance from '../config/db.js';

// Import model definitions
import AdminModel from './Admin.js';
import ProductModel from './Product.js';
import OrderModel from './Order.js';
import VendorModel from './Vendor.js';

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelizeInstance;

// Initialize models
db.Admin = AdminModel(sequelizeInstance, DataTypes);
db.Product = ProductModel(sequelizeInstance, DataTypes);
db.Order = OrderModel(sequelizeInstance, DataTypes);
db.Vendor = VendorModel(sequelizeInstance, DataTypes);

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

export default db;