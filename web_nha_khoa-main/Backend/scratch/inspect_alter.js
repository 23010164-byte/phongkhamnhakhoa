require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.query('ALTER TABLE `users` CHANGE `email` `email` VARCHAR(150) NOT NULL UNIQUE;');
    console.log('Success!');
  } catch (error) {
    console.error('Error executing alter query:', error);
  } finally {
    await sequelize.close();
  }
}

main();
