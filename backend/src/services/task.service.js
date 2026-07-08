const { Op } = require('sequelize')
const { Task, TaskComment, ActivityLog, User, sequelize } = require('../models')
const ApiError = require('../utils/ApiError')
const { invalidateProjectStats } = require('./dashboard.service')

async function createTask (projectId, data, actorId) {
  const task = await sequelize.transaction(async (t) => {
    const maxPosition = await Task.max('position', { where: { projectId, status: data.status || 'todo' }, transaction: t })
    const task = await Task.create({
      projectId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status || 'todo',
      assigneeId: data.assigneeId,
      dueDate: data.dueDate,
      position: (maxPosition || 0) + 1,
      createdBy: actorId,
      updatedBy: actorId
    }, { transaction: t })

    await ActivityLog.create({
      projectId,
      actorId,
      taskId: task.id,
      action: 'task_created',
      metadata: { taskId: task.id, title: task.title }
    }, { transaction: t })

    return task
  })

  invalidateProjectStats(projectId)
  return task
}

async function listTasks (projectId, query) {
  const { page, limit, status, assigneeId, priority, search, sortBy, order } = query

  const where = { projectId }
  if (status) where.status = status
  if (assigneeId) where.assigneeId = assigneeId
  if (priority) where.priority = priority
  if (search) where.title = { [Op.like]: `%${search}%` }

  const offset = (page - 1) * limit

  const { rows, count } = await Task.findAndCountAll({
    where,
    include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
    order: [[sortBy, order], ['id', 'ASC']],
    limit,
    offset
  })

  return {
    tasks: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  }
}

async function getById (taskId) {
  const task = await Task.findByPk(taskId, {
    include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }]
  })
  if (!task) {
    throw new ApiError(404, 'Task not found')
  }
  return task
}

async function updateTask (taskId, data, actorId) {
  const task = await Task.findByPk(taskId)
  if (!task) {
    throw new ApiError(404, 'Task not found')
  }
  await task.update({ ...data, updatedBy: actorId })
  invalidateProjectStats(task.projectId)
  return task
}

async function changeStatus (taskId, newStatus, actorId) {
  const task = await Task.findByPk(taskId)
  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  if (task.status === newStatus) {
    return task
  }

  const oldStatus = task.status

  await sequelize.transaction(async (t) => {
    const maxPosition = await Task.max('position', { where: { projectId: task.projectId, status: newStatus }, transaction: t })
    await task.update({ status: newStatus, position: (maxPosition || 0) + 1, updatedBy: actorId }, { transaction: t })

    await ActivityLog.create({
      projectId: task.projectId,
      actorId,
      taskId: task.id,
      action: 'task_status_changed',
      metadata: { taskId: task.id, from: oldStatus, to: newStatus }
    }, { transaction: t })
  })

  invalidateProjectStats(task.projectId)
  return task
}

// full reorder - moves a task to an arbitrary position within a status column (same or different column)
async function reorderTask (taskId, { status, position }, actorId) {
  const task = await Task.findByPk(taskId)
  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  const oldStatus = task.status
  const projectId = task.projectId

  await sequelize.transaction(async (t) => {
    if (oldStatus === status) {
      const siblings = await Task.findAll({
        where: { projectId, status, id: { [Op.ne]: task.id } },
        order: [['position', 'ASC']],
        transaction: t
      })
      siblings.splice(position, 0, task)
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].position !== i) {
          const extra = siblings[i].id === task.id ? { updatedBy: actorId } : {}
          await siblings[i].update({ position: i, ...extra }, { transaction: t })
        }
      }
    } else {
      const oldSiblings = await Task.findAll({
        where: { projectId, status: oldStatus, id: { [Op.ne]: task.id } },
        order: [['position', 'ASC']],
        transaction: t
      })
      for (let i = 0; i < oldSiblings.length; i++) {
        if (oldSiblings[i].position !== i) {
          await oldSiblings[i].update({ position: i }, { transaction: t })
        }
      }

      const newSiblings = await Task.findAll({
        where: { projectId, status, id: { [Op.ne]: task.id } },
        order: [['position', 'ASC']],
        transaction: t
      })
      newSiblings.splice(position, 0, task)
      for (let i = 0; i < newSiblings.length; i++) {
        if (newSiblings[i].id === task.id) {
          await task.update({ status, position: i, updatedBy: actorId }, { transaction: t })
        } else if (newSiblings[i].position !== i) {
          await newSiblings[i].update({ position: i }, { transaction: t })
        }
      }
    }

    if (oldStatus !== status) {
      await ActivityLog.create({
        projectId,
        actorId,
        taskId: task.id,
        action: 'task_status_changed',
        metadata: { taskId: task.id, from: oldStatus, to: status }
      }, { transaction: t })
    }
  })

  invalidateProjectStats(projectId)
  return task
}

async function reassignTask (taskId, assigneeId, actorId) {
  const task = await Task.findByPk(taskId)
  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  const oldAssigneeId = task.assigneeId

  await sequelize.transaction(async (t) => {
    await task.update({ assigneeId, updatedBy: actorId }, { transaction: t })

    await ActivityLog.create({
      projectId: task.projectId,
      actorId,
      taskId: task.id,
      action: 'task_reassigned',
      metadata: { taskId: task.id, from: oldAssigneeId, to: assigneeId }
    }, { transaction: t })
  })

  invalidateProjectStats(task.projectId)
  return task
}

async function deleteTask (taskId) {
  const task = await Task.findByPk(taskId)
  if (!task) {
    throw new ApiError(404, 'Task not found')
  }
  await task.destroy()
  invalidateProjectStats(task.projectId)
}

async function addComment (taskId, userId, body) {
  const task = await Task.findByPk(taskId)
  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  const comment = await sequelize.transaction(async (t) => {
    const comment = await TaskComment.create({ taskId, userId, body }, { transaction: t })

    await ActivityLog.create({
      projectId: task.projectId,
      actorId: userId,
      taskId,
      action: 'comment_added',
      metadata: { taskId, commentId: comment.id }
    }, { transaction: t })

    return comment
  })

  return comment
}

async function listComments (taskId) {
  return TaskComment.findAll({
    where: { taskId },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'ASC'], ['id', 'ASC']]
  })
}

module.exports = {
  createTask,
  listTasks,
  getById,
  updateTask,
  changeStatus,
  reorderTask,
  reassignTask,
  deleteTask,
  addComment,
  listComments
}
