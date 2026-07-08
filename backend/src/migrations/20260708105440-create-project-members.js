'use strict';


module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('project_members', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('admin', 'manager', 'member'),
        allowNull: false,
        defaultValue: 'member'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })

    await queryInterface.addIndex('project_members', ['project_id', 'user_id'], {
      unique: true,
      name: 'project_members_project_id_user_id_unique'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('project_members')
  }
};
