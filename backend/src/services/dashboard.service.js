const { Op } = require('sequelize')
const { Task, User, sequelize } = require('../models')
const cache = require('../utils/cache')

const STATUSES = ['todo', 'in_progress', 'review', 'done']

function cacheKey (projectId) {
  return `project_stats_${projectId}`
}

async function getProjectStats (projectId) {
  const cached = cache.get(cacheKey(projectId))
  if (cached) {
    return cached
  }

  const byStatusRaw = await Task.findAll({
    where: { projectId },
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['status'],
    raw: true
  })

  const statusCounts = Object.fromEntries(STATUSES.map(s => [s, 0]))
  byStatusRaw.forEach(row => { statusCounts[row.status] = Number(row.count) })
  const byStatus = STATUSES.map(status => ({ status, count: statusCounts[status] }))

  const byAssigneeRaw = await Task.findAll({
    where: { projectId, assigneeId: { [Op.ne]: null } },
    attributes: ['assigneeId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['assigneeId'],
    raw: true
  })

  const assigneeIds = byAssigneeRaw.map(row => row.assigneeId)
  const users = assigneeIds.length
    ? await User.findAll({ where: { id: assigneeIds }, attributes: ['id', 'name', 'email'], raw: true })
    : []
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))

  const byAssignee = byAssigneeRaw.map(row => ({
    assigneeId: row.assigneeId,
    name: userMap[row.assigneeId] ? userMap[row.assigneeId].name : null,
    email: userMap[row.assigneeId] ? userMap[row.assigneeId].email : null,
    count: Number(row.count)
  }))

  const overdueCount = await Task.count({
    where: {
      projectId,
      status: { [Op.ne]: 'done' },
      dueDate: { [Op.lt]: new Date() }
    }
  })

  const stats = { byStatus, byAssignee, overdueCount, generatedAt: new Date().toISOString() }

  cache.set(cacheKey(projectId), stats)
  return stats
}

function invalidateProjectStats (projectId) {
  cache.del(cacheKey(projectId))
}

module.exports = { getProjectStats, invalidateProjectStats }
