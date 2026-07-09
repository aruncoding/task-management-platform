const authService = require('../services/auth.service')
const { REFRESH_TOKEN_TTL_MS } = require('../utils/jwt')

function setRefreshCookie (res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_TTL_MS
  })
}

exports.register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken);
    res.json({ user, accessToken });
  } catch (err) {
    next(err)
  }
}

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken
    const { accessToken, refreshToken } = await authService.refresh(token)
    setRefreshCookie(res, refreshToken)
    res.json({ accessToken })
  } catch (err) {
    next(err)
  }
}

exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.cookies.refreshToken)
    res.clearCookie('refreshToken')
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

exports.me = (req, res) => {
  res.json({ user: req.user })
}
