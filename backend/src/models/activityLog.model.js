module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define('ActivityLog', {
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
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'actor_id'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'activity_log',
    underscored: true
  })

  ActivityLog.associate = (models) => {
    ActivityLog.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' })
    ActivityLog.belongsTo(models.User, { foreignKey: 'actorId', as: 'actor' })
  }

  return ActivityLog
}
