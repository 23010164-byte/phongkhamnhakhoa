require('dotenv').config();
const setupAssociations = require('../src/config/associations');
const { MedicalRecord } = require('../src/modules/medical/medical.model');
const { sequelize } = require('../src/config/database');

async function main() {
  try {
    setupAssociations();
    await sequelize.authenticate();
    console.log('Database connected.');

    const recordNoInclude = await MedicalRecord.findByPk('99c9fb5b-7f5c-47ef-92d6-c75cc7b0b31e');
    console.log('Without includes, found record:', !!recordNoInclude);

    try {
      const recordWithInclude = await MedicalRecord.findByPk('99c9fb5b-7f5c-47ef-92d6-c75cc7b0b31e', {
        include: require('../src/modules/medical/medical.repository').defaultIncludes || []
      });
      console.log('With includes, found record:', !!recordWithInclude);
    } catch (e) {
      console.error('Error with includes:', e);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

main();
