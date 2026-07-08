require("dotenv").config();

const app = require('./src/app')
const logger = require('./src/utils/logger')
const db = require('./src/models')
const { runMigrations } = require('./src/db/migrator')

const PORT = process.env.PORT || 5000

db.sequelize.authenticate()
    .then(async () => {
        logger.info('DB connection established')
        try {
            await runMigrations()
        } catch (err) {
            logger.error('Migration failed', { err: err.message })
            process.exit(1)
        }
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`)
        })
    })
    .catch(err => {
        logger.error('Unable to connect to DB', { err: err.message })
        process.exit(1)
    })