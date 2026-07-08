'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [[project]] = await queryInterface.sequelize.query("SELECT id FROM projects WHERE name = 'Demo Project'")
    if (!project) return // demo-project seeder hasn't run yet

    const [[existingTask]] = await queryInterface.sequelize.query(
      'SELECT id FROM tasks WHERE project_id = ? AND title = ?',
      { replacements: [project.id, 'Set up CI pipeline'] }
    )
    if (existingTask) return

    const [[admin]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'admin@example.com'")
    const [[manager]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'manager@example.com'")
    const [[member]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'member@example.com'")

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    await queryInterface.bulkInsert('tasks', [
      {
        project_id: project.id,
        title: 'Set up CI pipeline',
        description: 'Add GitHub Actions for lint + test',
        status: 'todo',
        priority: 'medium',
        assignee_id: manager.id,
        due_date: nextWeek,
        position: 1,
        created_at: now,
        updated_at: now
      },
      {
        project_id: project.id,
        title: 'Design task board UI',
        description: 'Mockups for the kanban board',
        status: 'in_progress',
        priority: 'high',
        assignee_id: member.id,
        due_date: nextWeek,
        position: 1,
        created_at: now,
        updated_at: now
      },
      {
        project_id: project.id,
        title: 'Fix overdue invoice bug',
        description: 'Customer billing edge case - demonstrates the overdue/dashboard behavior',
        status: 'in_progress',
        priority: 'urgent',
        assignee_id: member.id,
        due_date: yesterday,
        position: 2,
        created_at: now,
        updated_at: now
      },
      {
        project_id: project.id,
        title: 'Write onboarding docs',
        description: 'Docs for new team members',
        status: 'done',
        priority: 'low',
        assignee_id: admin.id,
        due_date: null,
        position: 1,
        created_at: now,
        updated_at: now
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    const [[project]] = await queryInterface.sequelize.query("SELECT id FROM projects WHERE name = 'Demo Project'")
    if (project) {
      await queryInterface.bulkDelete('tasks', { project_id: project.id })
    }
  }
};
