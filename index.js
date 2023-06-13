/*
Updated by Ninjune on 10/?/22
- Added more processes to run.
Written by DuckySoLucky or Senither on ?/?/??
*/
process.on("uncaughtException", function (error) {console.log(error)})
const fs = require("fs")
const app = require("./src/Application")
const server = require("./src/web/mainServer")
const scanner = require("./src/contracts/scanner")
// creating files if don't exist
const files = ["coleweightlb backup", "coleweightlb", "discord", "maliciousMiners", "mminerUsers", "nameDB"]
files.forEach(file => {
    if(!fs.existsSync("./csvs/" + file + ".csv")) fs.writeFileSync("./csvs/" + file + ".csv", "")
})


process.title = "Coleweight | by Ninjune#0670 (wrappers by DuckySoLucky#5181)"
"use strict"

app.startDiscord()