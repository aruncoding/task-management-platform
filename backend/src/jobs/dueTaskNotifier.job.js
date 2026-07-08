const cron = require('node-cron')
const { Op } = require('sequelize')
const { Task, ActivityLog } = require('../models')

// picks up tasks due within the next 24h and tasks already overdue, and drops one
// activity_log entry per task/condition for the assignee - checked first so re-runs don't duplicate it
async function checkDueAndOverdueTasks () {
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const dueSoonTasks = await Task.findAll({
    where: {
      status: { [Op.ne]: 'done' },
      assigneeId: { [Op.ne]: null },
      dueDate: { [Op.between]: [now, in24h] }
    }
  })

  let dueSoonNotified = 0
  for (const task of dueSoonTasks) {
    const alreadyNotified = await ActivityLog.findOne({
      where: { action: 'task_due_soon', metadata: { taskId: task.id } }
    })
    if (!alreadyNotified) {
      await ActivityLog.create({
        projectId: task.projectId,
        actorId: task.assigneeId,
        action: 'task_due_soon',
        metadata: { taskId: task.id, dueDate: task.dueDate }
      })
      dueSoonNotified++
    }
  }

  const overdueTasks = await Task.findAll({
    where: {
      status: { [Op.ne]: 'done' },
      assigneeId: { [Op.ne]: null },
      dueDate: { [Op.lt]: now }
    }
  })

  let overdueNotified = 0
  for (const task of overdueTasks) {
    const alreadyNotified = await ActivityLog.findOne({
      where: { action: 'task_overdue', metadata: { taskId: task.id } }
    })
    if (!alreadyNotified) {
      await ActivityLog.create({
        projectId: task.projectId,
        actorId: task.assigneeId,
        action: 'task_overdue',
        metadata: { taskId: task.id, dueDate: task.dueDate }
      })
      overdueNotified++
    }
  }

  return { dueSoonChecked: dueSoonTasks.length, dueSoonNotified, overdueChecked: overdueTasks.length, overdueNotified }
}

function startDueTaskCron () {
  // every 15 minutes - frequent enough to catch things without hammering the db
  cron.schedule('*/15 * * * *', () => {
    checkDueAndOverdueTasks().catch(err => console.error('due task cron failed:', err))
  })
}

module.exports = { checkDueAndOverdueTasks, startDueTaskCron }
