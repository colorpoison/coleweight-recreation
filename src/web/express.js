// if you want to set this up yourself you'll have to do it yourself
/*
const fs = require("fs")
const express = require("express")
const coleweightFunctions = require("../contracts/coleweightFunctions")
const http = require("http")
const https = require("https")
const maliciousMiners = require("../contracts/MMinersFunctions")
const privateKey = fs.readFileSync(__dirname + "/key.pem", "utf8")
const certificate = fs.readFileSync(__dirname + "/site/files/cert.pem", "utf8")
const website = express()
const { checkMojangAuth } = require("../contracts/util")

let credentials = {key: privateKey, cert: certificate}

let httpServer = http.createServer(website)
let httpsServer = https.createServer(credentials, website)

website.use(express.static(__dirname + "/site"))

website.get('/api/coleweight-leaderboard', (req, res) => {
    let lb = []
    if (req.query.length != undefined)
        lb = coleweightFunctions.getLeaderboard("./csvs/coleweightlb.csv", req.query.length)
    else
        lb = coleweightFunctions.getLeaderboard("./csvs/coleweightlb.csv")

    res.json(lb)
})

website.get('/api/coleweight', async function (req, res) {
    try 
    {
        const username = req.query.username
        let data = await coleweightFunctions.getColeweight(username)

        data.userData = undefined
        data.profileData = undefined
        res.json(data)
    }
    catch(e)
    {
        res.send(`Missing required parameter (api/coleweight?username=) ${e}`)
    }
})


website.get('/api/cwinfo', (req, res) => {
    let cwValues = JSON.parse(fs.readFileSync("./csvs/cwinfo.json", "utf8")),
     cwValuesObject = {"experience": [], "powder": [], "collection": [], "miscellaneous": []}

    cwValuesObject = cwValues
        
    res.json(cwValuesObject)
})


website.get('/api/lbpos', async function (req, res) {
    try 
    {
        const username = req.query.username
        let data = await coleweightFunctions.lbreq(username)

        res.json(data)
    }
    catch(e)
    {
        res.send("Missing required parameter (api/lbpos?username=)")
    }
})


website.get('/api/mminers', async function (req, res) {
    if((req.query.username) == undefined)
    {
        data = await maliciousMiners.listMMiners(req.query.uuidOnly)

        res.json(data)
    }
    else
    {
        const username = req.query.username
        let data = maliciousMiners.findMM(username)

        res.json(data)
    }
})


website.get('/api', async function (req, res) {
    res.send(`
    <p>MojangAuth: checks https://sessionserver.mojang.com/session/minecraft/hasJoined for user. Requires "serverID" and "username".</p>
    <p>Avalable endpoints:</p>
    <p>/api/coleweight(?username='...') - username is Minecraft ign or uuid. returns coleweight & related data.</p>
    <p>/api/coleweight-leaderboard - returns coleweight leaderboard</p>
    <p>/api/cwinfo - returns cwinfo</p>
    <p>/api/lbpos(?username='...') - username is Minecraft ign or uuid. returns user positions.</p>
    <p>/api/mminers[?username='...'?uuidOnly='(bool)'] - username is Minecraft ign or uuid. uuidOnly increases speed because it won't convert every uuid to username when reqing the db. returns if the user is a mminer or all mminers.</p>
    <p>/api/cwusers(type=...) (requires mojangAuth) - gives current coleweight users and adds user onto users or removes user.</p>
    `)
})

website.get("/api/cwusers", async function (req, res) {
    let users = fs.readFileSync("./csvs/cwusers.csv", "utf8").split("\r\n")

    let mojangRes = await checkMojangAuth(req.query.username, req.query.serverID)
    if(!mojangRes.success) return mojangRes

    let included = false
    users.forEach((user, index) => {
        let row = user.split(" ")

        if(row[0] == req.query.username)
        {
            if(req.query.type == "remove")
                users.splice(index, 1)
            else
                included = true
        }
    })
    if(!included && req.query.type != "remove") users.push(req.query.username)

    fs.writeFileSync("./csvs/cwusers,csv", users.join("\r\n"))
    res.json({success: true, users: users})
})


httpServer.listen(80)
httpsServer.listen(443)
*/