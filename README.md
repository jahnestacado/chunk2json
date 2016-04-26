[![NPM version](http://img.shields.io/npm/v/chunk2json.svg)](https://www.npmjs.org/package/chunk2json)
[![Build Status](https://travis-ci.org/jahnestacado/chunk2json.svg?branch=master)](https://travis-ci.org/jahnestacado/chunk2json)
[![downloads per month](http://img.shields.io/npm/dm/chunk2json.svg)](https://www.npmjs.org/package/chunk2json)
[![Coverage Status](https://coveralls.io/repos/github/jahnestacado/chunk2json/badge.svg?branch=master)](https://coveralls.io/github/jahnestacado/chunk2json?branch=master)
# chunk2json
-----------
JSON parser that extracts JSON objects out of a byte stream without the use of delimeters.  
Ideal for extracting JSON objects out of an incoming TCP socket byte stream.

## Install
 Install with [npm](npmjs.org):
```bash
$ npm install chunk2json
```
## Use
```javascript
const ChunkParser = require("chunk2json");
const parser = new ChunkParser();

parser.on("json", (jsonBuff) => {
    const jsonObj = JSON.parse(jsonBuff);
    console.log(jsonObj.length); // Prints 2
});

parser.consume(new Buffer('[{"name": "Frank Castle"'));
parser.consume(new Buffer(',"kills": true,'));
parser.consume(new Buffer('"line": "One batch, two batch, penny and dime"}'));
parser.consume(new Buffer(',{"name": "Bruce Wayne"'));
parser.consume(new Buffer(',"kills": false,'));
parser.consume(new Buffer('"line": "I am the goddamn Batman"}]'));
```


The parser consumes buffers which can contain partial and/or complete JSON chunks. When a complete JSON object is identified the `on("json")` event callback is invoked with the corresponding JSON object(in buffer form).
    
## Test
Run the tests
```bash
$ npm test 
```

## License
Copyright (c) 2016 Ioannis Tzanellis<br>
[Released under the MIT license](https://github.com/jahnestacado/chunk2json/blob/master/LICENSE) 
