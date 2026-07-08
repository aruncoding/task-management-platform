const { verifyAccessToken } = require('../utils/jwt')
const ApiError = require('../utils/ApiError')

module.exports = function requireAuth (req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Not authenticated'))
  }

  const token = header.split(' ')[1]

  try {
    const decoded = verifyAccessToken(token)
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'))
  }
}
