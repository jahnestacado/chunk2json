"use strict";
const assert = require("assert");
const PacketParser = require("../../index.js");
const fs = require("fs");
const readline = require("readline");

describe("when testing json-packet module", function(){
    describe("when passing a json object literal in chunks", function() {
        const packets = [
            new Buffer('    {"menu": {'),
            new Buffer('  "id": "file",'),
            new Buffer('  "value": "File",'),
            new Buffer('  "popup": {'),
            new Buffer('    "menuitem": ['),
            new Buffer('      {"value": "Ope{{{n", "oncl}}}}ick": "OpenDoc()"},'),
            new Buffer('      {"va[lue": "Cl]ose", "onclick": "CloseDoc()"}'),
            new Buffer('    ]'),
            new Buffer('  }'),
            new Buffer('}}')
        ];

        const parser = new PacketParser();
        var result;
        before(function(done){
            packets.forEach((packet) => {
                parser.on("packet", (data) => {
                    result = data;
                    done();
                });
                parser.consume(packet);
            });
        });

        it("should return the expected JSON object", function() {
            assert.equal(JSON.parse(result).menu.value, "File");
        });
    });

    describe("when passing an array of objects in chunks", function() {
        const packets = [
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
        var result;
        before(function(done){
            packets.forEach((packet) => {
                parser.on("packet", (data) => {
                    result = data;
                    done();
                });
                parser.consume(packet);
            });
        });

        it("should return the expected JSON array object", function() {
            assert.equal(JSON.parse(result)[0].menu.value, "File");
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
