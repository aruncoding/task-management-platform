const { verifyAccessToken } = require('../utils/jwt')
const ApiError = require('../utils/ApiError')

module.exports = function requireAuth (req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'No token provided'))
  }

  const token = header.split(' ')[1]

  try {
    const decoded = verifyAccessToken(token)
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch {
    next(new ApiError(401, 'Token is invalid or has expired'))
  }
}
