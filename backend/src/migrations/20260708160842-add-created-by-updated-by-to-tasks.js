'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })

    await queryInterface.addColumn('tasks', 'updated_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })

    await queryInterface.addIndex('tasks', ['created_by'])
    await queryInterface.addIndex('tasks', ['updated_by'])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tasks', 'created_by')
    await queryInterface.removeColumn('tasks', 'updated_by')
  }
};
