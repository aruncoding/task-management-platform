const { Op } = require('sequelize')
const { Task, TaskComment, ActivityLog, User, sequelize } = require('../models')
const ApiError = require('../utils/ApiError')

async function createTask(projectId, data, actorId) {
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

  return task
}

async function listTasks(projectId, query) {
  const page = query.page;
  const limit = query.limit;

  const where = {
    projectId
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.assigneeId) {
    where.assigneeId = query.assigneeId;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.search) {
    where.title = {
      [Op.like]: `%${query.search}%`
    };
  }

  const offset = (page - 1) * limit;

  const result = await Task.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "assignee",
        attributes: ["id", "name", "email"]
      }
    ],
    order: [
      [query.sortBy, query.order],
      ["id", "ASC"]
    ],
    limit,
    offset
  });

  return {
    tasks: result.rows,
    pagination: {
      page,
      limit,
      total: result.count,
      totalPages: Math.ceil(result.count / limit)
    }
  };
}

async function getById(taskId) {
  const task = await Task.findByPk(taskId, {
    include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }]
  })
  if (!task) {
    throw new ApiError(404, 'Task not found')
  }
  return task
}

async function updateTask(taskId, data, actorId) {
  const task = await Task.findByPk(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  data.updatedBy = actorId;

  await task.update(data);

  return task;
}

async function changeStatus(taskId, newStatus, actorId) {
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

  return task
}

async function reassignTask(taskId, assigneeId, actorId) {
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

  return task
}

async function deleteTask(taskId) {
  const task = await Task.findByPk(taskId)
  if (!task) {
    throw new ApiError(404, 'Task not found')
  }
  await task.destroy()
}

async function addComment(taskId, userId, body) {
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

async function listComments(taskId) {
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
  reassignTask,
  deleteTask,
  addComment,
  listComments
}
