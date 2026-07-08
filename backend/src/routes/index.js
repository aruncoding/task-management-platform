const { Router } = require('express')

const authRoutes = require('./auth.routes')
const projectRoutes = require('./project.routes')
const taskRoutes = require('./task.routes')

const router = Router()

router.use('/auth', authRoutes)
router.use('/projects', projectRoutes)
router.use('/tasks', taskRoutes)

module.exports = router
