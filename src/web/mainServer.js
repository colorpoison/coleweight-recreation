const { default: axios } = require("axios")
const fs = require("fs")
const { WebSocketServer } = require("ws")
const { sleep } = require("../contracts/coleweightFunctions")
const { logToFile } = require("../contracts/log")
const { website } = require("./express")
const privateKey = fs.readFileSync("/etc/letsencrypt/live/ninjune.dev/privkey.pem", "utf8")
const certificate = fs.readFileSync("/etc/letsencrypt/live/ninjune.dev/fullchain.pem", "utf8")
const credentials = {key: privateKey, cert: certificate}
const httpServer = require("http").createServer()
const httpsServer = require("https").createServer(credentials)
let cwUsers = []
httpServer.on("request", website)
httpsServer.on("request", website)

httpServer.listen(80)
httpsServer.listen(443)

/*const wss = new WebSocketServer({
    server: httpServer
})

wss.on("connection", (ws, req) => {
    ws.isAlive = true
    ws.ip = req.socket.remoteAddress
    console.log("connected with client")

    ws.on("message", async (data) => {
        let mojangRes, usersNames = []
        const json = JSON.parse(data)
        console.log("WSS " + json)
        if(json.method == undefined)
            return ws.send(JSON.stringify({code: 400, message: "Method was not defined. (bad request)"}))
        switch(json.method)
        {
            case "login":
                await sleep(500)
                if(json.serverId == undefined || json.username == undefined)
                    return ws.send(JSON.stringify({code: 400, message: "(login) Invalid parameters. (bad request)"}))
                mojangRes = await axios.get(`https://sessionserver.mojang.com/session/minecraft/hasJoined?username=${json.username}&serverId=${json.serverId}`)
                if(mojangRes.name == undefined)
                    return ws.send(JSON.stringify({code: 400, message: "(login) Player has not joined server."}))
                if(cwUsers.some(user => user.uuid === mojangRes.id))
                    return ws.send(JSON.stringify({code: 400, message: "(login) Player has already joined server."}))
                cwUsers.push({ name: mojangRes.name, uuid: mojangRes.id, ip: ws.ip })
                cwUsers.forEach(user => {
                    usersNames.push(user.name)
                })
                ws.send({code: 100, message: "(login) Successfully logged in.", users: usersNames})
                logToFile(mojangRes.name + " has logged in.")
                break
            case "alloydrop":
                break
            case "heartbeat":
                ws.isAlive = true
                break
            default:
                return ws.send(JSON.stringify({code: 400, message: "Method is not available. (bad request)"}))
        }
    })

    ws.on("open", () => {
        ws.send(JSON.stringify({code: 100, message: "Established connection."}))
    })

    ws.on("error", err => {
        console.log("WS Error: " + err)
    })
})


const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false)
        {
            cwUsers.splice(cwUsers.findIndex(user => user.ip === ws.ip), 1)
            console.log("client terminated")
            return ws.terminate()
        }
        ws.isAlive = false
        ws.send(JSON.stringify({method: "heartbeat"}))
      })
}, 30000)


wss.on("close", () => {
    clearInterval(interval)
})
*/

module.exports = { httpServer, httpsServer }