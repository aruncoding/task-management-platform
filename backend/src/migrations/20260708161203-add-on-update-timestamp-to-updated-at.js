'use strict';

const TABLES = [
  'users',
  'projects',
  'project_members',
  'tasks',
  'task_comments',
  'activity_log',
  'refresh_tokens'
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of TABLES) {
      await queryInterface.sequelize.query(
        `ALTER TABLE \`${table}\` MODIFY \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
      )
    }
  },

  async down(queryInterface, Sequelize) {
    for (const table of TABLES) {
      await queryInterface.sequelize.query(
        `ALTER TABLE \`${table}\` MODIFY \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`
      )
    }
  }
};
