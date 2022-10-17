process.on('uncaughtException', function (error) {console.log(error)})
const app = require('./src/Application')

process.title = 'ColeWeight Recreation | by Ninjune#0670 (wrappers by DuckySoLucky#5181)'
'use strict'; 

app.register().then(() => {
  app.connect()
}).catch(error => {
  console.error(error) 
})