"use strict";

var leftCurlyCode = "{".charCodeAt(0);
var rightCurlyCode = "}".charCodeAt(0);
var quoteCode = '"'.charCodeAt(0);
var leftSquareBracketCode = "[".charCodeAt(0);
var rightSquareBracketCode = "]".charCodeAt(0);

function Parser(){
    this.curlyCounter = 0;
    this.packet = [];
    this.inQuoteMode = false;
    this.isArray = false;
}

Parser.prototype.consume = function(buffer){
    var self = this;
    let byte;

    var i = 0;
    var bufferLength = buffer.length;
    for(i; i < bufferLength; i++){
        byte = buffer[i];
        if(self.curlyCounter === 0 && self.isArray && byte === rightSquareBracketCode){
            self.packet.push(byte);
            self.isArray = false;
            end(self.packet);
        }
        else if(self.curlyCounter === 0){
            // Processing new packet
            switch(byte){
            case leftSquareBracketCode:
                self.isArray = true;
                break;
            case leftCurlyCode:
                self.curlyCounter++;
                break;
            }
            self.packet.push(byte);
        } else{
            switch(byte){
            case leftCurlyCode:
                !self.inQuoteMode && self.curlyCounter++;
                break;
            case rightCurlyCode:
                !self.inQuoteMode && self.curlyCounter--;
                break;
            case quoteCode:
                self.inQuoteMode = !self.inQuoteMode;
                break;
            }
            self.packet.push(byte);

            if(self.curlyCounter === 0 && !self.isArray){
                end(self.packet);
            }
        }
    }

    function end(packet){
        self.onPacket(new Buffer(packet));
        packet = [];
    }
};

Parser.prototype.on = function(event, callback){
    var self = this;

    switch (event) {
    case "packet":
        self.onPacket = callback;
        break;
    default:
        console.warn("Not supported event:", event);
        break;
    }
}

module.exports = Parser;
