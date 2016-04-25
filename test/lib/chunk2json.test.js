/**
* chunk2json <https://github.com/jahnestacado/chunk2json>
* Copyright (c) 2016 Ioannis Tzanellis
* Licensed under the MIT License (MIT).
*/
"use strict";
var assert = require("assert");
var PacketParser = require("../../index.js");
var fs = require("fs");
var split = require("split");

describe("when testing chunk2json module", function(){
    describe("when passing multiple json objects in chunks", function(){
        var chunks = [
            new Buffer('    {"menu": {'),
            new Buffer('  "id": "file",'),
            new Buffer('  "value": "File",'),
            new Buffer('  "popup": {'),
            new Buffer('    "menuitem": ['),
            new Buffer('      {"value": "Ope{{{n", "oncl}}}}ick": "OpenDoc()"},'),
            new Buffer('      {"va[lue": "Cl]ose", "onclick": "CloseD \\" inner quotes \\"oc()"}'),
            new Buffer('    ]'),
            new Buffer('  }'),
            new Buffer('}}'),
            new Buffer('{"name": "chunk2json","repository": {"type": "git","url": "https://github.com/jahnestacado/chunk2json"}}'),
            new Buffer('[{"name": "chunk2json","repository \\" inner quotes \\"": {"type": "git","url": "https://github.com/jahnestacado/chunk2json"}}]'),
            new Buffer('[    {"menu": {'),
            new Buffer('  "id": "file",'),
            new Buffer('  "value": "File",'),
            new Buffer('  "popup": {'),
            new Buffer('    "menuitem": ['),
            new Buffer('      {"value": "Ope{{{n", "oncl}}}}ick": "OpenDoc()"},'),
            new Buffer('      {"va[lue": "Cl]ose", "onclic\\" inner quotes \\"k": "CloseDoc()"}'),
            new Buffer('    ]'),
            new Buffer('  }'),
            new Buffer('}}]')
        ];

        var parser = new PacketParser();
        var packets = [];
        before(function(done){
            parser.on("json", function(packet){
                packets.push(packet);
                if(packets.length === 4){
                    done();
                }
            });
            chunks.forEach(function(chunk){
                parser.consume(chunk);
            });
        });

        it("should return 4 JSON packets", function(){
            assert.equal(packets.length, 4);
        });

        it("should have in packets[0] the expected JSON object", function(){
            assert.equal(JSON.parse(packets[0]).menu.value, "File");
        });

        it("should have in packets[1] the expected JSON object", function(){
            assert.equal(JSON.parse(packets[1]).name, "chunk2json");
        });

        it("should have in packets[2] the expected JSON object", function(){
            assert.equal(JSON.parse(packets[2])[0].name, "chunk2json");
        });

        it("should have in packets[3] the expected JSON object", function(){
            assert.equal(JSON.parse(packets[3])[0].menu.value, "File");
        });
    });

    describe("when passing a big json array object in chunks", function(){
        var parser = new PacketParser();
        var result;
        before(function(done){
            parser.on("json", function(data){
                result = data;
                done();
            });

            fs.createReadStream(__dirname + "/../resources/large.json")
            .pipe(split())
            .on("data", function (line) {
                parser.consume(new Buffer(line));
            })
        });

        it("should return the expected JSON array object of length 1000", function(){
            assert.equal(JSON.parse(result).length, 1000);
        });
    });
});
