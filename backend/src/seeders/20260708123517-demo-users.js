'use strict';
const bcrypt = require('bcrypt')

const USERS = [
  { name: 'Admin User', email: 'admin@example.com', password: 'password123' },
  { name: 'Manager User', email: 'manager@example.com', password: 'password123' },
  { name: 'Member User', email: 'member@example.com', password: 'password123' }
]

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const u of USERS) {
      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM users WHERE email = ?',
        { replacements: [u.email] }
      )
      if (existing.length) continue

      const passwordHash = await bcrypt.hash(u.password, 10)
      await queryInterface.bulkInsert('users', [{
        name: u.name,
        email: u.email,
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date()
      }])
    }
  },

  async down(queryInterface, Sequelize) {
     await queryInterface.bulkDelete('users', { email: USERS.map(u => u.email) })
  }
};
