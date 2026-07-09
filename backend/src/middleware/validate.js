module.exports = function validate (schema, prop = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[prop], { abortEarly: false, stripUnknown: true })
    if (error) {
      const details = error.details.map(d => d.message.replace(/"/g, ''))
      return res.status(400).json({ message: 'Invalid input', errors: details })
    }
    if (prop === 'query') {
      req.validatedQuery = value
    } else {
      req[prop] = value
    }
    next()
  }
}