require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Describe the users table
    const [columns] = await sequelize.query('DESCRIBE `users`');
    console.log('--- USERS COLUMNS ---');
    console.log(columns);

    // Get any duplicate email entries in the users table
    const [duplicates] = await sequelize.query('SELECT email, COUNT(*) as count FROM users GROUP BY email HAVING count > 1');
    console.log('--- DUPLICATE EMAILS ---');
    console.log(duplicates);

    // Query some users
    const [users] = await sequelize.query('SELECT id, full_name, email, role FROM users LIMIT 10');
    console.log('--- USERS SAMPLE ---');
    console.log(users);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

main();
