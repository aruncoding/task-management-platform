const taskService = require('../services/task.service')

exports.create = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.params.id, req.body, req.user.id)
    res.status(201).json({ task })
  } catch (err) {
    next(err)
  }
}

exports.list = async (req, res, next) => {
  try {
    const result = await taskService.listTasks(req.params.id, req.query)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const task = await taskService.getById(req.params.taskId)
    res.json({ task })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.taskId, req.body)
    res.json({ task })
  } catch (err) {
    next(err)
  }
}

exports.changeStatus = async (req, res, next) => {
  try {
    const task = await taskService.changeStatus(req.params.taskId, req.body.status, req.user.id)
    res.json({ task })
  } catch (err) {
    next(err)
  }
}

exports.reorder = async (req, res, next) => {
  try {
    const task = await taskService.reorderTask(req.params.taskId, req.body, req.user.id)
    res.json({ task })
  } catch (err) {
    next(err)
  }
}

exports.reassign = async (req, res, next) => {
  try {
    const task = await taskService.reassignTask(req.params.taskId, req.body.assigneeId, req.user.id)
    res.json({ task })
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.taskId)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

exports.addComment = async (req, res, next) => {
  try {
    const comment = await taskService.addComment(req.params.taskId, req.user.id, req.body.body)
    res.status(201).json({ comment })
  } catch (err) {
    next(err)
  }
}

exports.listComments = async (req, res, next) => {
  try {
    const comments = await taskService.listComments(req.params.taskId)
    res.json({ comments })
  } catch (err) {
    next(err)
  }
}
