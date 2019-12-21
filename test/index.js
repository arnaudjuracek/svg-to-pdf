const fs = require('fs-extra')
const path = require('path')
const SVG2PDF = require('..')

const argv = require('minimist')(process.argv.slice(2), {
  alias: { i: 'input', o: 'output' },
  default: {
    input: path.join(__dirname, 'sample.svg'),
    output: undefined
  }
})

const options = {
  docPath: argv.output
}

try {
  const svgString = fs.readFileSync(argv.input, 'utf8')
  const { warnings, docPath } = SVG2PDF(svgString, options)
  console.log('⚠  Warning:', warnings)
  console.log('✔  Success:', docPath)
} catch (err) {
  console.error(err instanceof Error ? err : Error(err))
  process.exit(1)
}
