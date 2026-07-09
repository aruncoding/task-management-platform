const express = require('express')
const router = express.Router()

const taskController = require('../controllers/task.controller')
const requireAuth = require('../middleware/auth.middleware')
const validate = require('../middleware/validate')
const { requireProjectRole } = require('../middleware/projectAuth')
const { loadTaskAndMembership, allowStatusChange } = require('../middleware/taskAuth')
const {
    updateTaskSchema,
    changeStatusSchema,
    assignSchema
} = require('../validations/task.validation')
const { createCommentSchema } = require('../validations/comment.validation')

router.use(requireAuth)
router.use('/:taskId', loadTaskAndMembership)

router.get('/:taskId', taskController.getOne)
router.patch('/:taskId', requireProjectRole('admin', 'manager'), validate(updateTaskSchema), taskController.update)
router.delete('/:taskId', requireProjectRole('admin', 'manager'), taskController.remove)

router.patch('/:taskId/status', allowStatusChange, validate(changeStatusSchema), taskController.changeStatus)


router.patch('/:taskId/assign', requireProjectRole('admin', 'manager'), validate(assignSchema), taskController.reassign)

router.get('/:taskId/comments', taskController.listComments)
router.post('/:taskId/comments', validate(createCommentSchema), taskController.addComment)

module.exports = router