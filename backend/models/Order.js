// models/Orders.js
module.exports = (sequelize, DataTypes) => {
   const Order = sequelize.define('Order', {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true
      },
      customerId: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      customerName: {
         type: DataTypes.STRING,
         allowNull: false,
         field: 'customer_name'
      },
      customerEmail: {
         type: DataTypes.STRING,
         allowNull: false,
         field: 'customer_email',
         validate: {
            isEmail: true,
         }
      },
      customerPhone: {
         type: DataTypes.STRING,
         allowNull: false,
         field: 'customer_phone'
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
      vendorSlug: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      items: {
         type: DataTypes.JSONB, // to store array of items [{ productId, name, price, quantity }]
         allowNull: false,
         defaultValue: [],
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
         field: 'payment_method'
      },
      status: {
         type: DataTypes.ENUM('pending', 'paid', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
         allowNull: false,
         defaultValue: 'pending', // default status is 'pending'
      },
      paymentStatus: {
         type: DataTypes.ENUM('pending', 'paid', 'failed'),
         defaultValue: 'pending',
         field: 'payment_status'
      },
      notes: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
      vendorId: {
         type: DataTypes.INTEGER,
         allowNull: false,
         field: 'vendor_id'
      },
      userAgent: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
      createdAt: {
         type: DataTypes.DATE,
         field: 'created_at'
      },
      updatedAt: {
         type: DataTypes.DATE,
         field: 'updated_at'
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
         allowNull: true
      }
   }, {
      tableName: 'orders',
      timestamps: true, // automatically adds createdAt and updatedAt
   });

   Order.associate = (models) => {
      Order.belongsTo(models.Vendor, {
         foreignKey: 'vendorId',
         as: 'Vendor'
      });
   };

   return Order;
};