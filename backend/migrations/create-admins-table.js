'use strict';

export async function up(queryInterface, Sequelize) {
  // Check if admins table already exists
  const tableExists = await queryInterface.sequelize.query(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='admins';"
  );

  if (tableExists[0].length === 0) {
    await queryInterface.createTable('admins', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: 'admin'
      },
      permissions: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('admins', ['email']);
  }
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('admins');
}