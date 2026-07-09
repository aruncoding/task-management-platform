const { Project, ProjectMember, ActivityLog, User, sequelize } = require('../models')
const ApiError = require('../utils/ApiError')

async function createProject({ name, description, ownerId }) {
  const project = await sequelize.transaction(async (transaction) => {
    const newProject = await Project.create(
      {
        name,
        description,
        ownerId
      },
      {
        transaction
      }
    );

    await ProjectMember.create(
      {
        projectId: newProject.id,
        userId: ownerId,
        role: "admin"
      },
      {
        transaction
      }
    );

    return newProject;
  });

  return project;
}

async function listForUser(userId) {
  const memberships = await ProjectMember.findAll({
    where: { userId },
    include: [
      {
        model: Project,
        as: "project"
      }
    ]
  });

  const projects = [];

  for (const membership of memberships) {
    const project = membership.project.get({ plain: true });

    project.myRole = membership.role;

    projects.push(project);
  }

  return projects;
}

async function getById(projectId) {
  const project = await Project.findByPk(projectId, {
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "name", "email"]
      }
    ]
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
}

async function listMembers(projectId) {
  const members = await ProjectMember.findAll({
    where: {
      projectId
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"]
      }
    ]
  });

  return members;
}

async function addMember (projectId, { email, role }) {
  const user = await User.findOne({ where: { email } })
  if (!user) {
    throw new ApiError(404, 'No user found with that email')
  }

  const existing = await ProjectMember.findOne({ where: { projectId, userId: user.id } })
  if (existing) {
    throw new ApiError(409, 'User is already a member of this project')
  }

  const member = await ProjectMember.create({ projectId, userId: user.id, role })
  return member
}

async function updateMemberRole (projectId, memberId, role) {
  const project = await Project.findByPk(projectId)
  const member = await ProjectMember.findOne({ where: { id: memberId, projectId } })
  if (!member) {
    throw new ApiError(404, 'Member not found on this project')
  }

  if (member.userId === project.ownerId && role !== 'admin') {
    throw new ApiError(400, 'Cannot change the project owner\'s role')
  }

  member.role = role
  await member.save()
  return member
}

async function removeMember (projectId, memberId) {
  const project = await Project.findByPk(projectId)
  const member = await ProjectMember.findOne({ where: { id: memberId, projectId } })
  if (!member) {
    throw new ApiError(404, 'Member not found on this project')
  }

  if (member.userId === project.ownerId) {
    throw new ApiError(400, 'Cannot remove the project owner from the project')
  }

  await member.destroy()
}

async function listActivity (projectId, { page, limit }) {
  const offset = (page - 1) * limit

  const { rows, count } = await ActivityLog.findAndCountAll({
    where: { projectId },
    include: [{ model: User, as: 'actor', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit,
    offset
  })

  return {
    activity: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  }
}

module.exports = {
  createProject,
  listForUser,
  getById,
  listMembers,
  addMember,
  updateMemberRole,
  removeMember,
  listActivity
}
