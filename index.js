/*
Updated by Ninjune on 10/?/22
- Added more processes to run.
Written by DuckySoLucky or Senither on ?/?/??
*/
process.on('uncaughtException', function (error) {console.log(error)})
const app = require('./src/Application')
const server = require("./src/web/express")  
const scanner = require("./src/contracts/scanner")
const updateClaimed = require("./src/contracts/updateClaimed")

process.title = 'ColeWeight Recreation | by Ninjune#0670 (wrappers by DuckySoLucky#5181)'
'use strict'; 

app.register().then(() => {
  app.connect()
}).catch(error => {
  console.error(error) 
})