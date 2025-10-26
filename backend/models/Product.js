// models/Product.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, 
    imageUrl: { type: DataTypes.STRING, allowNull: true, field: 'image_url' },
    category: { type: DataTypes.STRING, allowNull: true },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'preparation_time' },
    ingredients: { type: DataTypes.JSONB, defaultValue: [] },
    vendorId: { type: DataTypes.INTEGER, allowNull: false, field: 'vendor_id'},
    vendorName: { type: DataTypes.STRING, allowNull: false },
    vendorSlug: { type: DataTypes.STRING, allowNull: false, defaultValue: 'vendor' },
    paymentMethod: { type: DataTypes.STRING, allowNull: false, defaultValue: 'bank',
      validate: {
        isIn: [['bank', 'link']] // only allow 'bank' or 'link'
      }
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' }
  }, {
    tableName: 'products', // Optional: force table name
    timestamps: true
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Vendor, {
      foreignKey: 'vendorId',
      as: 'vendor'
    });
  };

  return Product;
};