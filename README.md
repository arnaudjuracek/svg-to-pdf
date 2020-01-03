# svg-to-pdf [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)
_pre-press oriented node.js module to transform a SVG string into printable PDF file_

<br>

* [Features](#features)
  + [Limited support](#limited-support)
  + [Not supported (yet)](#not-supported-yet)
  + [Not supported, won't be supported](#not-supported-wont-be-supported)
* [Installation](#installation)
* [Usage](#usage)
* [Development](#development)
* [Credits](#credits)
* [Related](#related)
* [License](#license)

<br>
<br>

## Features

- Support for this SVG elements:
  + `<defs>`
  + `<symbol>`
  + `<clipPath>`
  + `<use>`
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
  + `<text>`
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
- `viewBox` attribute is parsed only on the `<svg>` root element, so all system coordinates must be absolute
- `<text>` elements are rendered only if they do not have complex structure (such as nested element)
- Supported `<text>` specific presentation attributes are:
  + `dominant-baseline`
  + `font-family`
  + `font-size`
  + `letter-spacing`
  + `text-anchor`
  + `word-spacing`
- `%` unit _should_ work as intended, but some bugs can occur when working in complex coordinates systems (like viewports deep nest).

### Not supported, won't be supported
#### CSS styling
Use [`svgo`](https://github.com/svg/svgo) beforehand to apply CSS styling as element attributes:

```yaml
full: false
plugins:
  - inlineStyles:
      useMqs:
        - ''
        - screen
        - print
  - removeStyleElement
  - converStyleToAttrs
```

<sup>**NOTE:** see [`svgo` guide](https://github.com/svg/svgo/blob/master/docs/how-it-works/en.md#1-config) to read more about `svgo` config.</sup>
## Installation

```console
$ npm install --save chevalvert/svg-to-pdf
```

## Usage

```js
const SVG2PDF = require('svg-to-pdf')

const options = {
  docPath: '/tmp/file.pdf',

  // All attributes refering to an external file path will be resolved from this
  // root path
  rootPath: process.cwd(),

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

// using Promises
SVG2PDF(svgString, options)
  .then(({ warnings }) => console.log(warnings))
  .catch(error => console.error(error))

// using async/await
;(async () => {
  const { warnings } = await SVG2PDF(svgString, options)
  console.log(warnings)
})()
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
