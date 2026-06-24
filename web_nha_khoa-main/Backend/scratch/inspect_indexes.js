require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const [indexes] = await sequelize.query('SHOW INDEXES FROM `users`');
    console.log('--- INDEXES ON USERS ---');
    console.log(indexes.map(idx => ({ Key_name: idx.Key_name, Column_name: idx.Column_name, Non_unique: idx.Non_unique })));
  } catch (error) {
    console.error('Error listing indexes:', error);
  } finally {
    await sequelize.close();
  }
}

main();
