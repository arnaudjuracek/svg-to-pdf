module.exports = value => {
  if (!value) return

  const [svgAlign, svgMeetOrSlice] = value.split(' ')

  let align = 'center'
  let valign = 'center'
  let ignored = false

  switch (svgAlign) {
    case 'xMinYMin':
      align = 'left'
      valign = 'top'
      break
    case 'xMidYMin':
      align = 'center'
      valign = 'top'
      break
    case 'xMaxYMin':
      align = 'right'
      valign = 'top'
      break
    case 'xMinYMid':
      align = 'left'
      valign = 'center'
      break
    case 'xMidYMid':
      align = 'center'
      valign = 'center'
      break
    case 'xMaxYMid':
      align = 'right'
      valign = 'center'
      break
    case 'xMinYMax':
      align = 'left'
      valign = 'bottom'
      break
    case 'xMidYMax':
      align = 'center'
      valign = 'bottom'
      break
    case 'xMaxYMax':
      align = 'right'
      valign = 'bottom'
      break

    case 'none':
    default:
      ignored = true
      break
  }

  return {
    ignored,
    align,
    valign,
    fit: svgMeetOrSlice !== 'slice',
    cover: svgMeetOrSlice === 'slice'
  }
}
