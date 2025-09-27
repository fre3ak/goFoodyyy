// models/Vendor.js
module.exports = (sequelize, DataTypes) => {
  const Vendor = sequelize.define('Vendor', {
    vendorName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vendorSlug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bankName: {  // ← Use consistent naming
      type: DataTypes.STRING,
      allowNull: false
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    delivery: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    pickup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    openingHours: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Vendors',
    timestamps: true
  });

  return Vendor;
};