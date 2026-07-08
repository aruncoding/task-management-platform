module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash'
    }
  }, {
    tableName: 'users',
    underscored: true
  })

   User.associate = (models) => {
    User.hasMany(models.RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' })
    User.hasMany(models.Project, { foreignKey: 'ownerId', as: 'ownedProjects' })
    User.hasMany(models.ProjectMember, { foreignKey: 'userId', as: 'memberships' })
    User.hasMany(models.Task, { foreignKey: 'assigneeId', as: 'assignedTasks' })
    User.hasMany(models.TaskComment, { foreignKey: 'userId', as: 'comments' })
    User.hasMany(models.ActivityLog, { foreignKey: 'actorId', as: 'activities' })
  }

  return User
}
