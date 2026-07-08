module.exports = (sequelize, DataTypes) => {
  const TaskComment = sequelize.define('TaskComment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'task_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'task_comments',
    underscored: true
  })

  TaskComment.associate = (models) => {
    TaskComment.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' })
    TaskComment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
  }

  return TaskComment
}
