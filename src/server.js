require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

sequelize.authenticate().then(() => {
  console.log('Database connected');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Keep DB alive (Neon free tier pauses after 5 min inactivity)
  setInterval(async () => {
    try {
      await sequelize.authenticate();
      console.log('DB keep-alive ping');
    } catch (err) {
      console.error('DB keep-alive failed:', err);
    }
  }, 4 * 60 * 1000); // Every 4 minutes
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});