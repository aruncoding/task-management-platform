module.exports = (sequelize, DataTypes) => {
  const ProjectMember = sequelize.define('ProjectMember', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'member'),
      allowNull: false,
      defaultValue: 'member'
    }
  }, {
    tableName: 'project_members',
    underscored: true,
    indexes: [
      { unique: true, fields: ['project_id', 'user_id'] }
    ]
  })

  ProjectMember.associate = (models) => {
    ProjectMember.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' })
    ProjectMember.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
  }

  return ProjectMember
}
