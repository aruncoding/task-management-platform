const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const requireAuth = require('../middleware/auth.middleware')
const validate = require('../middleware/validate')
const { authLimiter } = require('../middleware/rateLimit')
const { registerSchema, loginSchema } = require('../validations/auth.validation')

router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.post('/login', authLimiter, validate(loginSchema), authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', requireAuth, authController.me)

module.exports = router