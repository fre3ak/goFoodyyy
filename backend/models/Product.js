// models/Product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, 
    description: { type: DataTypes.TEXT },
    imageUrl: { type: DataTypes.STRING },
    vendorName: { type: DataTypes.STRING, allowNull: false },
    vendorSlug: { 
      type: DataTypes.STRING, 
      allowNull: false,
      defaultValue: 'vendor'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'bank',
      validate: {
        isIn: [['bank', 'link']] // only allow 'bank' or 'link'
      }
    }
  }, {
    tableName: 'Products', // Optional: force table name
    timestamps: true
  });

  return Product;
};