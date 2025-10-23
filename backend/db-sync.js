// db-sync.js - Run this once to set up database
const db = require('./models');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database...');
    
    // Test connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync all models (creates tables if they don't exist)
    await db.sequelize.sync({ force: false }); 
    console.log('✅ Database synchronized successfully.');
    
    console.log('🎉 Database is ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();