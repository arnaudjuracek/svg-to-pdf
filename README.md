# svg-to-pdf [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)
_transform SVG string to printable PDF in node_

<br>

## Installation

```console
$ git clone https://github.com/chevalvert/svg-to-pdf
$ cd svg-to-pdf
$ npm install
```

## Usage

```js
const SVG2PDF = require('svg-to-pdf')
const { file, warnings } = SVG2PDF(svgString, options)
```

## Development

```console
$ npm test # run svg-to-pdf against test/sample.svg
$ npm test path/to/file.svg
```

## License
[MIT.](https://tldrlegal.com/license/mit-license)
