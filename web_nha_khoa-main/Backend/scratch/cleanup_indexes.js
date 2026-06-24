require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const [indexes] = await sequelize.query('SHOW INDEXES FROM `users`');
    const keyNames = [...new Set(indexes.map(idx => idx.Key_name))];
    console.log('Existing keys:', keyNames);

    // Keep PRIMARY, email, phone, users_role, users_is_active
    const keepKeys = ['PRIMARY', 'email', 'phone', 'users_role', 'users_is_active'];

    for (const keyName of keyNames) {
      if (!keepKeys.includes(keyName)) {
        console.log(`Dropping index ${keyName}...`);
        try {
          await sequelize.query(`ALTER TABLE \`users\` DROP INDEX \`${keyName}\``);
          console.log(`Dropped index ${keyName} successfully.`);
        } catch (err) {
          console.error(`Failed to drop index ${keyName}:`, err.message);
        }
      }
    }

    console.log('Cleanup completed successfully.');
  } catch (error) {
    console.error('Error during index cleanup:', error);
  } finally {
    await sequelize.close();
  }
}

main();
