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
const ChunkParser = require("./index.js");
const parser = new ChunkParser();

parser.on("json", function(jsonBuff) {
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
The parser consumes buffers which contain partial and/or complete JSON chunks. When it finds a complete JSON object it invokes the `on("json")` event callback with the corresponding JSON object(in buffer form).
    
## Test
Run the tests
```bash
$ npm test 
```

## License
Copyright (c) 2016 Ioannis Tzanellis<br>
[Released under the MIT license](https://github.com/jahnestacado/chunk2json/blob/master/LICENSE) 
