/*
Written by Ninjune on 10/?/22.
*/
const fs = require("fs")
const express = require("express")
const coleweightFunctions = require("../contracts/coleweightFunctions")
const http = require("http")
const https = require("https")
const maliciousMiners = require("../contracts/MMinersFunctions")
const privateKey = fs.readFileSync(__dirname + "/site/key.pem", "utf8")
const certificate = fs.readFileSync(__dirname + "/site/cert.pem", "utf8")
const axios = require("axios")
const claimingFunctions = require ("../contracts/claimingFunctions")

var credentials = {key: privateKey, cert: certificate}
const app = express()

app.use(express.static(__dirname + "/site"))

app.get('/api/coleweight-leaderboard', (req, res) => {
    let lb = coleweightFunctions.getLeaderboard("./csvs/coleweightlb.csv")
    let payload = lb

    res.json(payload)
})

app.get('/api/coleweight', async function (req, res) {
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
        res.send("Missing required parameter (api/coleweight?username=)")
    }
})

app.get('/api/cwinfo', (req, res) => {
    let cwValues = fs.readFileSync("./csvs/coleweight.csv", "utf8").split("\r\n"),
     cwValuesObject = {"powder": [], "collection": [], "miscellaneous": []}

    for(let i = 0; i < cwValues.length; i++)
    {
        row = cwValues[i].split(",")

        if(i == 0)
            cwValuesObject.experience = 
            {
                name: row[0],
                req: row[1]
            }
        else if(i == 1 || i == 2)
            cwValuesObject.powder.push({
                name: row[0],
                req: row[1]
            })
        else if(i >= 3 && i <= 24)
            cwValuesObject.collection.push({
                name: row[0],
                req: row[1]
            })
        else if(i >= 25)
            cwValuesObject.miscellaneous.push({
                name: row[0],
                req: row[1]
            })
    }
        
    res.json(cwValuesObject)
})

app.get('/api/lbpos', async function (req, res) {
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

app.get('/api/mminers', async function (req, res) {
    if((req.query.username) == undefined)
    {
        data = maliciousMiners.listMMiners()

        res.json(data)
    }
    else
    {
        const username = req.query.username
        let data = maliciousMiners.findMM(username)

        res.json(data)
    }
})

app.get('/api/claim', async function (req, res) {
    if(req.query.claimedlobby == undefined)
        res.json(await claimingFunctions.claim(req))
    else
        res.json(await claimingFunctions.checkClaimed(req.query.claimedlobby))
})

app.get('/api', async function (req, res) {
    res.send(`
    <p>Avalable endpoints:</p>
    <p>/api/coleweight(?username='...') - username is Minecraft ign or uuid. returns coleweight & related data.</p>
    <p>/api/coleweight-leaderboard - returns coleweight leaderboard</p>
    <p>/api/cwinfo - returns cwinfo</p>
    <p>/api/lbpos(?username='...') - username is Minecraft ign or uuid. returns user positions.</p>
    <p>/api/mminers[?username='...'] - username is Minecraft ign or uuid. returns if the user is a mminer or all mminers.</p>
    <p>/api/claim(?claimedlobby='...') || /api/claim(?key='...'&id='...'&type='...') - key is hypixel api key, id is lobby id, type is 'throne' or 'spiral'. returns if the lobby is claimed or whether it is sucessful or not.</p>
    `)
})

let httpServer = http.createServer(app)
let httpsServer = https.createServer(credentials, app)

httpServer.listen(80)
httpsServer.listen(443)