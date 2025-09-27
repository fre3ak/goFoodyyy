const fs = require('fs');
const csv = require('csv-parser');
const { Product } = require('../models')

async function importVendors() {
  const results = [];
  fs.createReadStream('vendors.csv')
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      for (const row of results) {
        const products = [
          {
            name: row.menuName1,
            price: parseFloat(row.menuPrice1),
            description: row.menuDescription1,
            imageUrl: row.menuImage1,
            vendorName: row.vendorName,
            vendorSlug: row.vendorSlug,
            paymentMethod: 'bank'
          },
          {
            name: row.menuName2,
            price: parseFloat(row.menuPrice2),
            description: row.menuDescription2,
            imageUrl: row.menuImage2,
            vendorName: row.vendorName,
            vendorSlug: row.vendorSlug,
            paymentMethod: 'bank'
          },
          {
            name: row.menuName3,
            price: parseFloat(row.menuPrice3),
            description: row.menuDescription3,
            imageUrl: row.menuImage3,
            vendorName: row.vendorName,
            vendorSlug: row.vendorSlug,
            paymentMethod: 'bank'
          }
        ];

        // Remove empty products
        const validProducts = products.filter(p => p.name && p.price);

        // Save to database
        for (const product of validProducts) {
          await Product.create(product);
        }

        console.log(`✅ Added ${validProducts.length} products for ${row.vendorName}`);
      }
      console.log('🎉 All vendors imported!');
    });
}

importVendors();