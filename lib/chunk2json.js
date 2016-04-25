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
    this.curlyCounter = 0;
    this.packet = [];
    this.inQuoteMode = false;
    this.isArray = false;
    this.previousByte;
};

Parser.prototype.consume = function(buffer){
    var parser = this;
    var byte;

    var bufferLength = buffer.length;
    for(var i = 0; i < bufferLength; i++){
        byte = buffer[i];
        if(parser.curlyCounter !== 0){
            switch(byte){
            case leftCurlyCode:
                !parser.inQuoteMode && parser.curlyCounter++;
                break;
            case rightCurlyCode:
                !parser.inQuoteMode && parser.curlyCounter--;
                break;
            case quoteCode:
                if(parser.previousByte !== backslashCode){
                    parser.inQuoteMode = !parser.inQuoteMode;
                }
                break;
            }
            parser.packet.push(byte);

            if(parser.curlyCounter === 0 && !parser.isArray){
                extract(parser.packet);
            }
        } else if(parser.curlyCounter === 0 && parser.isArray && byte === rightSquareBracketCode){
            parser.packet.push(byte);
            parser.isArray = false;
            extract(parser.packet);
        } else if(parser.curlyCounter === 0){
            // Processing new packet
            switch(byte){
            case leftSquareBracketCode:
                parser.isArray = true;
                break;
            case leftCurlyCode:
                parser.curlyCounter++;
                break;
            }
            parser.packet.push(byte);
        }
        parser.previousByte = byte;
    }

    function extract(packet){
        parser.onPacket(new Buffer(packet));
        parser.packet = [];
    }
};

Parser.prototype.on = function(event, callback){
    var parser = this;

    switch (event) {
    case "json":
        parser.onPacket = callback;
        break;
    default:
        console.warn("Not supported event:", event);
        break;
    }
};

module.exports = Parser;
