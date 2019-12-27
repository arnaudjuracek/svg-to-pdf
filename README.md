# svg-to-pdf [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)
_pre-press oriented node.js module to transform a SVG string into printable PDF file_

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
- **Group inheritance** (ie: `<g color=green>` will pass its `color=green` attribute to its children)
- All [`PDFKit`](http://pdfkit.org/) vector graphics supported operations
- PDF **file permissions** and limitations w/ password support
- PDF file **metadatas edition** (author, subject, keywords, etc…)
- Length units support and implicit conversion to PDF points
- Support for **uncalibrated CMYK colors** using [`device-cmyk()`](https://www.w3.org/TR/2014/WD-SVG2-20140211/color.html#devicecmyk), as described in the [SVG 2 Working draft 11](https://www.w3.org/TR/2014/WD-SVG2-20140211/Overview.html)
- [Pre-press inspired **pre-flight process**](https://en.wikipedia.org/wiki/Pre-flight_(printing)), which gives insight and warnings after generating a PDF file
- **Pre-press** related features such as bleed area and printers marks:
  + crop marks
  + colors marks
  + registration marks

### Limited support
- `<image>` can be used only with base64 encoded dataURI for now
- `viewBox` attribute is parsed only on the `<svg>` root element, so all system coordinates must be absolute

### Not supported (yet)
- `<text>` and font embeding
- `<use>` with `<defs>`
- CSS styling
- `skewX` and `skewY` transformation functions

## Installation

```console
$ npm install --save chevalvert/svg-to-pdf
```

## Usage

```js
const SVG2PDF = require('svg-to-pdf')

const options = {
  docPath: '/tmp/file.pdf',

  // color space can be either 'rgb' or 'cmyk'
  colorSpace: 'cmyk',

  // SVG specification specifies that all unitless lengths are expressed in a
  // so-called "user unit", usually defaulting to pixel
  userUnit: 'mm', // 'px', 'cm', 'pt', etc…

  // Pre-press related features
  bleed: 10,
  marks: {
    colors: true,
    crop: true,
    registration: true
  },

  // PDF file options, see PDFKit
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

const { warnings } = SVG2PDF(svgString, options)
```
<sup>**Note:** for PDF file related options, see [`PDFKit` options](http://pdfkit.org/docs/getting_started.html#setting_document_metadata).</sup>

## Development

```console
$ npm test # run svg-to-pdf against test/sample.svg
$ npm test -- --input=path/to/file.svg --output=path/to/output.svg --color-space=rgb|cmyk
```


## Credits
- SVG initial parsing is done thanks to [`svg-parser`](https://github.com/Rich-Harris/svg-parser/).
- PDF file is generated with [`PDFKit`](http://pdfkit.org/).

## Related
- [`SVG-to-PDFKit`](https://github.com/alafr/SVG-to-PDFKit/)

## License
[MIT.](https://tldrlegal.com/license/mit-license)
