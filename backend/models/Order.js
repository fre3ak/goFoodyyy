// models/Orders.js
module.exports = (sequelize, DataTypes) => {
   const Order = sequelize.define('Order', {
      customerId: {
         type: DataTypes.STRING,
         allowNull: true, // could be from sessi
      },
      customerName: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      customerEmail: {
         type: DataTypes.STRING,
         allowNull: true,
         validate: {
            isEmail: true, // ensures the email format is valid
         },
      },
      customerPhone: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      deliveryAddress: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      deliveryLandmark: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      deliveryLocation: {
         type: DataTypes.JSON, // to store { latitude, longitude }
         allowNull: true,
      },
      items: {
         type: DataTypes.JSON, // to store array of items [{ productId, name, price, quantity }]
         allowNull: false,
         validate: {
            notEmpty: true, // ensures items array is not empty
         },
      },
      subtotal: {
         type: DataTypes.DECIMAL(10, 2), // 10 digits total, 2 after decimal
         allowNull: false,
      },
      deliveryFee: {
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false,
         defaultValue: 1000.00,
      },
      total: {
         type: DataTypes.DECIMAL(10, 2),
         allowNull: false,
      },
      paymentMethod: {
         type: DataTypes.STRING,
         allowNull: false,
         defaultValue: 'bank_transfer', // default payment method is 'bank'
      },
      status: {
         type: DataTypes.STRING,
         allowNull: false,
         defaultValue: 'pending', // default status is 'pending'
         validate: { isIn: [['pending', 'paid', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']]}
      },
      userAgent: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
      userIp: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      referer: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      cookies: {
         type: DataTypes.TEXT, // storing as JSON string
         allowNull: true,
      },
      notes: {
         type: DataTypes.TEXT,
         allowNull: true,
      }
    }, {
      timestamps: true, // automatically adds createdAt and updatedAt
    });
    return Order;
};