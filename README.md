# svg-to-pdf [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)
_transform a SVG string into printable PDF in node.js_

<br>

## Features
- Support for this SVG elements:
  + `<defs>`
  + `<clipPath>`
  + `<g>`
  + `<path>`
  + `<rect>`
  + `<circle>`
  + `<ellipse>`
  + `<line>`
  + `<image>`
  + `<polyline>`
  + `<polygon>`
  + `<image>`
- Group inheritance (ie: `<g color=green>` will pass its `color=green` attribute to its children).
- Support for uncalibrated CMYK colors using [`device-cmyk()`](https://www.w3.org/TR/2014/WD-SVG2-20140211/color.html#devicecmyk), as described in the [SVG 2 Working draft 11](https://www.w3.org/TR/2014/WD-SVG2-20140211/Overview.html).
- All [`PDFKit`](http://pdfkit.org/) vector graphics supported operations.

### Limited support
- `<image>` can be used only with base64 encoded dataURI for now.
- `viewBox` attribute is parsed only on the `<svg>` root element, so all system coordinates must be absolute.

## Installation

```console
$ npm install --save chevalvert/svg-to-pdf
```

## Usage

```js
const SVG2PDF = require('svg-to-pdf')

const options = {
  colorSpace: 'cmyk', // either 'rgb' or 'cmyk'
  userUnit: 'mm',     // 'px', 'cm', 'pt', etc…
  bleed: 10,

  marks: {
    colors: true,
    crop: true,
    registration: true
  },

  docPath: '/tmp/file.pdf',
  pdfVersion: 1.3,
  userPassword: undefined,
  ownerPassword: undefined,
  permissions: undefined,
  title: '',
  subject: '',
  author: '',
  producer: 'chevalvert/svg-to-pdf@semver',
  keywords: ''
}

const { file, warnings } = SVG2PDF(svgString, options)
```

## Important notes
### `options.userUnit`
### `options.colorSpace`


## Development

```console
$ npm test # run svg-to-pdf against test/sample.svg
$ npm test -- --input=path/to/file.svg --output=path/to/output.svg --color-space=rgb|cmyk
```


## Credits

## License
[MIT.](https://tldrlegal.com/license/mit-license)
