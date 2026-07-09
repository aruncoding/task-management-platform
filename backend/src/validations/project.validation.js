const Joi = require('joi')

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().max(2000).allow('', null)
})

const addMemberSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  role: Joi.string().valid('admin', 'manager', 'member').default('member')
})

const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'manager', 'member').required()
})

const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
})

module.exports = {
  createProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  paginationQuerySchema
}
