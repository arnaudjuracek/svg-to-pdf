const fs = require('fs-extra')
const path = require('path')
const SVG2PDF = require('..')

const argv = require('minimist')(process.argv.slice(2), {
  alias: { i: 'input', o: 'output' },
  default: {
    'color-space': 'cmyk',
    input: path.join(__dirname, 'sample.svg'),
    output: undefined
  }
})

const options = {
  colorSpace: argv['color-space'],
  docPath: argv.output
}

try {
  const svgString = fs.readFileSync(argv.input, 'utf8')
  const { warnings, docPath } = SVG2PDF(svgString, options)
  Object.entries(warnings).forEach(([flag, messages]) => {
    console.log('⚠  Warning:', flag)
    console.log(messages)
  })
  console.log('✔  Success:', docPath)
} catch (err) {
  console.error(err instanceof Error ? err : Error(err))
  process.exit(1)
}
