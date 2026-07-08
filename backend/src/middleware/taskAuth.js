const { Task, ProjectMember } = require('../models')
const ApiError = require('../utils/ApiError')

async function loadTaskAndMembership (req, res, next) {
  try {
    const task = await Task.findByPk(req.params.taskId)
    if (!task) {
      throw new ApiError(404, 'Task not found')
    }

    const membership = await ProjectMember.findOne({ where: { projectId: task.projectId, userId: req.user.id } })
    if (!membership) {
      throw new ApiError(403, 'You are not a member of this project')
    }

    req.task = task
    req.projectMember = membership
    next()
  } catch (err) {
    next(err)
  }
}

function allowStatusChange (req, res, next) {
  const role = req.projectMember.role
  if (role === 'admin' || role === 'manager') {
    return next()
  }
  if (role === 'member' && req.task.assigneeId === req.user.id) {
    return next()
  }
  return res.status(403).json({ message: 'Insufficient permissions for this action' })
}

module.exports = { loadTaskAndMembership, allowStatusChange }
