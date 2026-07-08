'use strict';


module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
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
      token_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    const tableIndexes = await queryInterface.showIndex('refresh_tokens')
    const indexNames = tableIndexes.map(i => i.name)

    if (!indexNames.includes('refresh_tokens_token_hash')) {
      await queryInterface.addIndex('refresh_tokens', ['token_hash'], { unique: true })
    }
    if (!indexNames.includes('refresh_tokens_user_id')) {
      await queryInterface.addIndex('refresh_tokens', ['user_id'])
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens')
  }
};
