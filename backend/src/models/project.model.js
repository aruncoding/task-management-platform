module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define('Project', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'owner_id'
        }
    }, {
        tableName: 'projects',
        underscored: true
    })

    Project.associate = (models) => {
        Project.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' })
        Project.hasMany(models.ProjectMember, { foreignKey: 'projectId', as: 'members' })
        Project.hasMany(models.Task, { foreignKey: 'projectId', as: 'tasks' })
        Project.hasMany(models.ActivityLog, { foreignKey: 'projectId', as: 'activityLogs' })
    }

    return Project
}
