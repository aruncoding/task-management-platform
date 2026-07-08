'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('activity_log', 'task_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })

    await queryInterface.addIndex('activity_log', ['task_id'])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('activity_log', 'task_id')
  }
};
