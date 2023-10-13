const fs = require("fs")
const express = require("express")
const coleweightFunctions = require("../contracts/coleweightFunctions")
const maliciousMiners = require("../contracts/MMinersFunctions")
const website = express()
const { checkMojangAuth } = require("../contracts/util")

website.options("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://ninjune.dev")
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    res.sendStatus(204)
})
website.use(express.static(__dirname + "/site"))

website.get("/api/coleweight-leaderboard", (req, res) => {
    let lb = []
    lb = coleweightFunctions.getLeaderboard("./csvs/coleweightlb.csv", req.query.length ?? 5000, req.query.start ?? 1)

    res.json(lb)
})

website.get("/api/coleweight", async function (req, res) {
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


website.get("/api/cwinfo", (req, res) => {
    let cwValues = JSON.parse(fs.readFileSync("./csvs/cwinfo.json", "utf8")),
     cwValuesObject = {"experience": [], "powder": [], "collection": [], "miscellaneous": []}

    cwValuesObject = cwValues

    res.json(cwValuesObject)
})


website.get("/api/lbpos", async function (req, res) {
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


website.get("/api/mminers", async function (req, res) {
    if((req.query.username) == undefined)
    {
        let data = await maliciousMiners.listMMiners(req.query.uuidOnly)

        res.json(data)
    }
    else
    {
        const username = req.query.username
        let data = maliciousMiners.findMM(username)

        res.json(data)
    }
})


website.get("/api", async function (req, res) {
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

    fs.writeFileSync("./csvs/cwusers.csv", users.join("\r\n"))
    res.json({success: true, users: users})
})

let routes = JSON.parse(fs.readFileSync("./csvs/routeDB.csv"))
website.get("/api/cw/routes", function (req, res) {
    if(req.query.route == undefined) // get route names
    {
        let routeNames = []
        routes.forEach(route => {
            routeNames.push({name: route.name, description: route.description})
        })

        res.json(routeNames)
    }
    else
        res.json(routes.find(route => route.name == req.query.route) ?? {found: false})
})

//httpServer.listen(80)
//httpsServer.listen(443)

function updateRoutes() // COULD CAUSE ERRORS
{
    routes = JSON.parse(fs.readFileSync("./csvs/routeDB.csv"))
}

module.exports = { updateRoutes, website }