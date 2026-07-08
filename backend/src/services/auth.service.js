const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { User, RefreshToken, sequelize } = require('../models')
const ApiError = require('../utils/ApiError')
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    REFRESH_TOKEN_TTL_MS
} = require('../utils/jwt')

const SALT_ROUNDS = 10

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

async function buildTokens(user, transaction) {
    const payload = { id: user.id, email: user.email }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken({ id: user.id, jti: crypto.randomUUID() })

    await RefreshToken.create({
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
    }, { transaction })

    return { accessToken, refreshToken }
}

function toSafeUser(user) {
    return { id: user.id, name: user.name, email: user.email }
}

async function register({ name, email, password }) {
    const existing = await User.findOne({ where: { email } })
    if (existing) {
        throw new ApiError(409, 'Email is already registered')
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const { user, tokens } = await sequelize.transaction(async (t) => {
        const user = await User.create({ name, email, passwordHash }, { transaction: t })
        const tokens = await buildTokens(user, t)
        return { user, tokens }
    })

    return { user: toSafeUser(user), ...tokens }
}

async function login({ email, password }) {
    const user = await User.findOne({ where: { email } })
    if (!user) {
        throw new ApiError(401, 'Invalid email or password')
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
        throw new ApiError(401, 'Invalid email or password')
    }

    if (!user.isActive) {
        throw new ApiError(403, 'This account has been deactivated')
    }

    const tokens = await buildTokens(user)
    return { user: toSafeUser(user), ...tokens }
}

async function refresh(refreshToken) {
    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token missing')
    }

    let decoded
    try {
        decoded = verifyRefreshToken(refreshToken)
    } catch (err) {
        throw new ApiError(401, 'Invalid or expired refresh token')
    }

    const tokenHash = hashToken(refreshToken)
    const existing = await RefreshToken.findOne({ where: { tokenHash } })

    if (!existing) {
        throw new ApiError(401, 'Refresh token not recognized')
    }

    if (existing.revokedAt) {
        await RefreshToken.update(
            { revokedAt: new Date() },
            { where: { userId: existing.userId, revokedAt: null } }
        )
        throw new ApiError(401, 'Refresh token has been revoked')
    }

    if (existing.expiresAt < new Date()) {
        throw new ApiError(401, 'Refresh token expired')
    }

    const user = await User.findByPk(decoded.id)
    if (!user) {
        throw new ApiError(401, 'User no longer exists')
    }

    const tokens = await sequelize.transaction(async (t) => {
        existing.revokedAt = new Date()
        await existing.save({ transaction: t })
        return buildTokens(user, t)
    })

    return tokens
}

async function logout(refreshToken) {
    if (!refreshToken) return

    const tokenHash = hashToken(refreshToken)
    await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { tokenHash, revokedAt: null } }
    )
}

module.exports = { register, login, refresh, logout, toSafeUser }
