// backend/config/db.js
import { Sequelize } from 'sequelize';
// require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

export default sequelize;