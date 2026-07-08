const express = require('express')
const router = express.Router()

const projectController = require('../controllers/project.controller')
const taskController = require('../controllers/task.controller')
const dashboardController = require('../controllers/dashboard.controller')
const requireAuth = require('../middleware/auth.middleware')
const validate = require('../middleware/validate')
const { requireProjectMember, requireProjectRole } = require('../middleware/projectAuth')
const {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  paginationQuerySchema
} = require('../validations/project.validation')
const { createTaskSchema, listTasksQuerySchema } = require('../validations/task.validation')

router.use(requireAuth)

router.post('/', validate(createProjectSchema), projectController.create)
router.get('/', projectController.list)

router.get('/:id', requireProjectMember, projectController.getOne)
router.patch('/:id', requireProjectMember, requireProjectRole('admin'), validate(updateProjectSchema), projectController.update)
router.delete('/:id', requireProjectMember, requireProjectRole('admin'), projectController.remove)

router.get('/:id/members', requireProjectMember, projectController.listMembers)
router.post('/:id/members', requireProjectMember, requireProjectRole('admin'), validate(addMemberSchema), projectController.addMember)

router.patch('/:id/members/:memberId', requireProjectMember, requireProjectRole('admin'), validate(updateMemberRoleSchema), projectController.updateMemberRole)
router.delete('/:id/members/:memberId', requireProjectMember, requireProjectRole('admin'), projectController.removeMember)

router.get('/:id/tasks', requireProjectMember, validate(listTasksQuerySchema, 'query'), taskController.list)
router.post('/:id/tasks', requireProjectMember, requireProjectRole('admin', 'manager'), validate(createTaskSchema), taskController.create)

router.get('/:id/activity', requireProjectMember, validate(paginationQuerySchema, 'query'), projectController.listActivity)

router.get('/:id/stats', requireProjectMember, dashboardController.getStats)

module.exports = router