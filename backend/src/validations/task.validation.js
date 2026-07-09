const Joi = require('joi')

const STATUSES = ['todo', 'in_progress', 'review', 'done']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().max(5000).allow('', null),
  priority: Joi.string().valid(...PRIORITIES).default('medium'),
  status: Joi.string().valid(...STATUSES).default('todo'),
  assigneeId: Joi.number().integer().allow(null),
  dueDate: Joi.date().iso().allow(null)
})

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().max(5000).allow('', null),
  priority: Joi.string().valid(...PRIORITIES),
  dueDate: Joi.date().iso().allow(null)
}).min(1)

const changeStatusSchema = Joi.object({
  status: Joi.string().valid(...STATUSES).required()
})

const assignSchema = Joi.object({
  assigneeId: Joi.number().integer().allow(null).required()
})

const listTasksQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid(...STATUSES),
  assigneeId: Joi.number().integer(),
  priority: Joi.string().valid(...PRIORITIES),
  search: Joi.string().trim().max(200),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'priority', 'position').default('position'),
  order: Joi.string().valid('asc', 'desc').default('asc')
})

module.exports = {
  STATUSES,
  PRIORITIES,
  createTaskSchema,
  updateTaskSchema,
  changeStatusSchema,
  assignSchema,
  listTasksQuerySchema
}
