module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'project_id'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'review', 'done'),
      allowNull: false,
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assignee_id'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'due_date'
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'tasks',
    underscored: true
  })

  Task.associate = (models) => {
    Task.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' })
    Task.belongsTo(models.User, { foreignKey: 'assigneeId', as: 'assignee' })
    Task.hasMany(models.TaskComment, { foreignKey: 'taskId', as: 'comments' })
  }

  return Task
}
