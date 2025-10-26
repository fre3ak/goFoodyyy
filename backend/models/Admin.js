import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin'),
      defaultValue: 'admin'
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    }
  }, {
    tableName: 'admins',
    timestamps: true
  });

  return Admin;
};