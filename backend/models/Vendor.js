// models/Vendor.js
export default (sequelize, DataTypes) => {
  const Vendor = sequelize.define('Vendor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    vendorName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'vendor_name'
    },
    vendorSlug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'vendor_slug'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
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
      allowNull: true, // Match migration and allow for different auth methods later
      field: 'password_hash'
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'logo_url' // This will be the single source for the logo path
    },
    bankName: {  
      type: DataTypes.STRING,
      allowNull: false,
      field: 'bank_name'
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'account_number'
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
      type: DataTypes.ENUM('pending', 'approved', 'suspended'),
      defaultValue: 'pending'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    categories: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    openingHours: {
      type: DataTypes.STRING,
      allowNull: true
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
    tableName: 'vendors', // Use lowercase to match migrations
    timestamps: true,
    hooks: {
      beforeCreate: (Vendor) => {
        // Generate vendor slug if not provided
        if (!Vendor.vendorSlug) {
          Vendor.vendorSlug = Vendor.vendorName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        }
      }
    }
  });

  Vendor.associate =(models) => {
    Vendor.hasMany(models.Product, {
      foreignKey: 'vendorId',
      as: 'products'
    });
    Vendor.hasMany(models.Order, {
      foreignKey: 'vendorId',
      as: 'orders'
    });
  };
  
  return Vendor;
};