const { ProjectMember } = require('../models')

async function requireProjectMember (req, res, next) {
  try {
    const projectId = req.params.id || req.params.projectId
    const membership = await ProjectMember.findOne({ where: { projectId, userId: req.user.id } })

    if (!membership) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // attach so downstream middleware can check role without re-querying
    req.projectMember = membership
    next()
  } catch (err) {
    next(err)
  }
}

function requireProjectRole (...roles) {
  return (req, res, next) => {
    if (!req.projectMember || !roles.includes(req.projectMember.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this' })
    }
    next()
  }
}

module.exports = { requireProjectMember, requireProjectRole }
