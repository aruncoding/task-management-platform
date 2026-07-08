const projectService = require('../services/project.service')

exports.create = async (req, res, next) => {
  try {
    const project = await projectService.createProject({ ...req.body, ownerId: req.user.id })
    res.status(201).json({ project })
  } catch (err) {
    next(err)
  }
}

exports.list = async (req, res, next) => {
  try {
    const projects = await projectService.listForUser(req.user.id)
    res.json({ projects })
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const project = await projectService.getById(req.params.id)
    res.json({ project })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body)
    res.json({ project })
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

exports.listMembers = async (req, res, next) => {
  try {
    const members = await projectService.listMembers(req.params.id)
    res.json({ members })
  } catch (err) {
    next(err)
  }
}

exports.addMember = async (req, res, next) => {
  try {
    const member = await projectService.addMember(req.params.id, req.body)
    res.status(201).json({ member })
  } catch (err) {
    next(err)
  }
}

exports.updateMemberRole = async (req, res, next) => {
  try {
    const member = await projectService.updateMemberRole(req.params.id, req.params.memberId, req.body.role)
    res.json({ member })
  } catch (err) {
    next(err)
  }
}

exports.removeMember = async (req, res, next) => {
  try {
    await projectService.removeMember(req.params.id, req.params.memberId)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

exports.listActivity = async (req, res, next) => {
  try {
    const result = await projectService.listActivity(req.params.id, req.validatedQuery)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
