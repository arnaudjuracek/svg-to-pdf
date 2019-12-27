module.exports = value => {
  if (!value) return

  return typeof value === 'string' && ~value.indexOf('%')
    ? parseFloat(value) / 100
    : parseFloat(value)
}
