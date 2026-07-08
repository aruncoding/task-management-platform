const dashboardService = require('../services/dashboard.service')

exports.getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getProjectStats(req.params.id)
    res.json({ stats })
  } catch (err) {
    next(err)
  }
}
