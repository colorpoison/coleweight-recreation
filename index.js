/*
Updated by Ninjune on 10/?/22
- Added more processes to run.
Written by DuckySoLucky or Senither on ?/?/??
*/
process.on('uncaughtException', function (error) {console.log(error)})
const fs = require("fs")

// creating files if don't exist
const files = ["claimed", "coleweightlb backup", "coleweightlb", "discord", "maliciousMiners", "mminerUsers", "nameDB"]
files.forEach(file => {
    if(!fs.existsSync("./csvs/" + file + ".csv")) fs.writeFileSync("./csvs/" + file + ".csv", "")
})

const app = require("./src/Application")
const server = require("./src/web/express")  
const scanner = require("./src/contracts/scanner")

process.title = 'ColeWeight Recreation | by Ninjune#0670 (wrappers by DuckySoLucky#5181)'
'use strict';


app.register().then(() => {
    app.connect()
}).catch(error => {
    console.error(error) 
})
