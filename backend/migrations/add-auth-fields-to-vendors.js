'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if columns already exist to avoid errors
    const tableInfo = await queryInterface.describeTable('vendors');

    if (!tableInfo.password_hash) {
      await queryInterface.addColumn('vendors', 'password_hash', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!tableInfo.isactive) {
      await queryInterface.addColumn('vendors', 'is_active', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      });
    }

    if (!tableInfo.categories) {
      await queryInterface.addColumn('vendors', 'categories', {
        type: Sequelize.JSONB,
        defaultValue: []
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('vendors', 'password_hash');
    await queryInterface.removeColumn('vendors', 'is_active');
    await queryInterface.removeColumn('vendors', 'categories');
  }
};