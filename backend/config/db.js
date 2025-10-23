// backend/config/db.js
const { Sequelize } = require('sequelize');
// require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

module.exports = sequelize;