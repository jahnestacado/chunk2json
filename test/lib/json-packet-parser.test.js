"use strict";
const assert = require("assert");
const PacketParser = require("../../index.js");
const fs = require("fs");
const readline = require("readline");

describe("when testing json-packet module", function(){
    describe("when passing multiple json objectss in chunks", function() {
        const chunks = [
            new Buffer('    {"menu": {'),
            new Buffer('  "id": "file",'),
            new Buffer('  "value": "File",'),
            new Buffer('  "popup": {'),
            new Buffer('    "menuitem": ['),
            new Buffer('      {"value": "Ope{{{n", "oncl}}}}ick": "OpenDoc()"},'),
            new Buffer('      {"va[lue": "Cl]ose", "onclick": "CloseDoc()"}'),
            new Buffer('    ]'),
            new Buffer('  }'),
            new Buffer('}}'),
            new Buffer('{"name": "json-packet-parser","repository": {"type": "git","url": "https://github.com/jahnestacado/json-packet-parser"}}'),
            new Buffer('[{"name": "json-packet-parser","repository": {"type": "git","url": "https://github.com/jahnestacado/json-packet-parser"}}]'),
            new Buffer('[    {"menu": {'),
            new Buffer('  "id": "file",'),
            new Buffer('  "value": "File",'),
            new Buffer('  "popup": {'),
            new Buffer('    "menuitem": ['),
            new Buffer('      {"value": "Ope{{{n", "oncl}}}}ick": "OpenDoc()"},'),
            new Buffer('      {"va[lue": "Cl]ose", "onclick": "CloseDoc()"}'),
            new Buffer('    ]'),
            new Buffer('  }'),
            new Buffer('}}]')
        ];

        const parser = new PacketParser();
        var packets = [];
        before(function(done){
            parser.on("packet", (packet) => {
                packets.push(packet);
                if(packets.length === 4){
                    done();
                }
            });
            chunks.forEach((chunk) => {
                parser.consume(chunk);
            });
        });

        it("should return 4 JSON packets", () => {
            assert.equal(packets.length, 4);
        });

        it("should have in packets[0] the expected JSON object", function() {
            assert.equal(JSON.parse(packets[0]).menu.value, "File");
        });

        it("should have in packets[1] the expected JSON object", function() {
            assert.equal(JSON.parse(packets[1]).name, "json-packet-parser");
        });

        it("should have in packets[2] the expected JSON object", function() {
            assert.equal(JSON.parse(packets[2])[0].name, "json-packet-parser");
        });

        it("should have in packets[3] the expected JSON object", function() {
            assert.equal(JSON.parse(packets[3])[0].menu.value, "File");
        });
    });

    describe("when passing a big json array object in chunks", function() {
        const parser = new PacketParser();
        var result;
        before(function(done){
            parser.on("packet", (data) => {
                result = data;
                done();
            });

            const lineReader = readline.createInterface({
                input:fs.createReadStream(__dirname + "/../resources/large.json")
            });
            lineReader.on("line",(line) => {
                parser.consume(new Buffer(line));
            });
        });

        it("should the expected JSON array object of length 1000", function() {
            assert.equal(JSON.parse(result).length, 1000);
        });
    });
});
