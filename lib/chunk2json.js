/**
* chunk2json <https://github.com/jahnestacado/chunk2json>
* Copyright (c) 2016 Ioannis Tzanellis
* Licensed under the MIT License (MIT).
*/
"use strict";
var leftCurlyCode = "{".charCodeAt(0);
var rightCurlyCode = "}".charCodeAt(0);
var quoteCode = '"'.charCodeAt(0);
var leftSquareBracketCode = "[".charCodeAt(0);
var rightSquareBracketCode = "]".charCodeAt(0);
var backslashCode = '\\'.charCodeAt(0);

var Parser = function(){
    var parser = this;
    parser.curlyCounter = 0;
    parser.jsonByteStream = new Array();
    parser.inQuoteMode = false;
    parser.isArray = false;
    parser.currentIndex = 0;
    parser.inEscapeMode = false;
    parser._eventHandlers = {json: []};
};

Parser.prototype.consume = function(buffer){
    var parser = this;
    var byte;

    var bufferLength = buffer.length;
    for(var i = 0; i < bufferLength; i++){
        byte = buffer[i];
        if(parser.curlyCounter !== 0){
            if(byte !== backslashCode){
                if(!this.inEscapeMode && byte === quoteCode){
                    parser.inQuoteMode = !parser.inQuoteMode;
                } else if(byte === leftCurlyCode){
                    !parser.inQuoteMode && parser.curlyCounter++;
                } else if(byte === rightCurlyCode){
                    !parser.inQuoteMode && parser.curlyCounter--;
                }
                parser.inEscapeMode = false;
            } else{
                parser.inEscapeMode = !parser.inEscapeMode;
            }
            parser.jsonByteStream[parser.currentIndex++] = byte;

            if(parser.curlyCounter === 0 && !parser.isArray){
                parser._extractJSON();
            }
        } else if(parser.curlyCounter === 0 && byte === rightSquareBracketCode && parser.isArray){
            parser.jsonByteStream[parser.currentIndex] = byte;
            parser.isArray = false;
            parser._extractJSON();
        } else if(parser.curlyCounter === 0){
            // Processing new packet
            if(byte === leftCurlyCode){
                parser.curlyCounter++;
            }else if(byte === leftSquareBracketCode){
                parser.isArray = true;
            }
            parser.jsonByteStream[parser.currentIndex++] = byte;
        }
    }
};

Parser.prototype._extractJSON = function(){
    var parser = this;
    parser._eventHandlers.json.forEach(function(cb){
        cb(new Buffer(parser.jsonByteStream));
    });
    parser.jsonByteStream = new Array();
    parser.currentIndex = 0;
};

Parser.prototype.on = function(event, callback){
    var parser = this;
    switch (event) {
        case "json":
            parser._eventHandlers.json.push(callback);
            break;
        default:
            console.warn("Not supported event:", event);
            break;
    }
};

module.exports = Parser;
