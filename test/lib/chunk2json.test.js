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

        var data1 = [
            {
                name: "Frank Castle",
                kills: true,
                line: "One batch, two batch, penny and dime\\"
            },
            {
                name: "Bruce Wayne",
                kills: false,
                line: "I am the goddamn \"Batman\""
            }
        ];

        var data2 = {
            name: "Peter Parker",
            kills: false,
            line: "My \"spidersense\" is tingling\\\\"
        }

        var parser = new PacketParser();
        var packets = [];
        before(function(done){
            parser.on("json", function(packet){
                packets.push(packet);
                if(packets.length === 2){
                    done();
                }
            });
            var dataString1 = JSON.stringify(data1);
            var dataString2 = JSON.stringify(data2);
            var stringChunks = dataString1 + dataString2;
            for(var i=0; i < stringChunks.length; i++){
                parser.consume(new Buffer(stringChunks[i]));
            }
        });

        it("should return 2 JSON packets", function(){
            assert.equal(packets.length, 2);
        });

        it("should have in packets[0] the expected JSON object", function(){
            assert.equal(JSON.parse(packets[0]).length, 2);
            assert.equal(JSON.parse(packets[0])[0].name, data1[0].name);
            assert.equal(JSON.parse(packets[0])[1].name, data1[1].name);
        });

        it("should have in packets[1] the expected JSON object", function(){
            assert.equal(JSON.parse(packets[1]).name, data2.name);
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
