const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express')

const swaggerSpec = require('./config/swagger')
const router = require('./routes/index')
const logger = require('./utils/logger')
const requestId = require('./middleware/requestId')

const app = express()

app.use(requestId)
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/api/health', async (req, res) => {
  try {
    const sequelize = require('./config/database')
    await sequelize.authenticate()
    res.json({ status: 'ok', db: 'connected' })
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected' })
  }
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/v1', router)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})


app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500
  if (status >= 500) {
    logger.error({ requestId: req.id, err: err.message, stack: err.stack })
  }
  res.status(status).json({ message: err.message || 'Something went wrong' })
})

module.exports = app
