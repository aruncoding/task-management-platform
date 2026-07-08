'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [[admin]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'admin@example.com'")
    const [[manager]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'manager@example.com'")
    const [[member]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'member@example.com'")
    if (!admin || !manager || !member) return // demo-users seeder hasn't run yet

    const [[existingProject]] = await queryInterface.sequelize.query(
      'SELECT id FROM projects WHERE name = ? AND owner_id = ?',
      { replacements: ['Demo Project', admin.id] }
    )
    if (existingProject) return

    await queryInterface.bulkInsert('projects', [{
      name: 'Demo Project',
      description: 'Seeded demo project for local development',
      owner_id: admin.id,
      created_at: new Date(),
      updated_at: new Date()
    }])

    const [[project]] = await queryInterface.sequelize.query(
      'SELECT id FROM projects WHERE name = ? AND owner_id = ?',
      { replacements: ['Demo Project', admin.id] }
    )

    await queryInterface.bulkInsert('project_members', [
      { project_id: project.id, user_id: admin.id, role: 'admin', created_at: new Date(), updated_at: new Date() },
      { project_id: project.id, user_id: manager.id, role: 'manager', created_at: new Date(), updated_at: new Date() },
      { project_id: project.id, user_id: member.id, role: 'member', created_at: new Date(), updated_at: new Date() }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('projects', { name: 'Demo Project' })
  }
};
