const config = require('../../config.json')
const axios = require('axios')
const fs = require('node:fs')
const { getObjectValue } = require('./util')

function catchError(error)
{
    if(error.response)
    {
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
    }
    else if (error.request)
    {
        console.log(error.request)
    }
    else
    {
        console.log("Error", error.message)
    }
    console.log(error.config)
} 
exports.catchError = catchError

function sleep(ms) 
{
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
}

async function getLinkName(name, data)
{
    if( name == undefined ) { 
        let discordUserData = await data.guild.members.fetch(data.user),
         discID = discordUserData.user.id,
         discRows = (fs.readFileSync("./csvs/discord.csv").toString()).split('\r\n')
        
        
        for(let i = 0; i < discRows.length; i++)
        {
            let row = discRows[i].split(" ")
            if(discID == row[0]) { name = row[1]; return name }
        }
        return 0
    }
}

async function reqMojangApis(name) {
    try {
        try {
            let ashconData = (await axios.get(`https://api.ashcon.app/mojang/v2/user/${name}`)).data

            if (ashconData != undefined && ashconData.username != undefined) {
                let uuid = ""

                for (let i = 0; i < ashconData.uuid.length; i++) {
                    if (ashconData.uuid[i] != "-") {
                        uuid = uuid + ashconData.uuid[i]
                    }
                }
                return { username: ashconData.username, uuid: uuid }
            }
        }
        catch (error) {
            if (error != undefined && (error.response.status == 404 || error.response.status == 429)) {
                if (name.length >= 32) {
                    try {
                        let mojangData = (await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${name}`)).data
                        return { username: mojangData.name, uuid: mojangData.id }
                    }
                    catch (mojangDataError) {
                        console.log("Mojang Data (UUID): " + mojangDataError)
                        return 101
                    }
                }

                else {
                    try {
                        let mojangData = (await axios.get(`https://api.mojang.com/users/profiles/minecraft/${name}`)).data
                        return { username: mojangData.name, uuid: mojangData.id }
                    }
                    catch (mojangDataError) {
                        console.log("Mojang Data (name): " + mojangDataError)
                        return 101
                    }
                }
            }
        }
        return 101
    }
    catch (error) {
        console.log("MOJANG APIS: ")
        catchError(error)
        return 101
    }
}

async function getMojangData(name)
{
    let nameDBRows = fs.readFileSync("./csvs/nameDB.csv", "utf8").split("\r\n"),
     mojangData = {}

    for(let i = 0; i < nameDBRows.length; i++)
    {
        if(nameDBRows[i] == undefined || nameDBRows[i] == "") continue
        let row = nameDBRows[i].split(" ")

        if (row[0].toLowerCase() == name.toLowerCase() || row[1].toLowerCase() == name.toLowerCase())
        {
            if(row[2] == undefined || row[2] < Date.now() - 86400000) // 1 day
                nameDBRows.splice(i, 1)
            else if (mojangData.username == undefined)
            {
                mojangData.username = row[0]
                mojangData.uuid = row[1]
            }
            else
                nameDBRows.splice(i, 1)
        }
    }

    if(mojangData.username == undefined)
    {
        mojangData = await reqMojangApis(name)
        if(mojangData.username == undefined || mojangData.uuid == undefined) return 101
        let writeData = mojangData.username + " " + mojangData.uuid + " " + Date.now()
        nameDBRows.push(writeData)
    }
    fs.writeFileSync("./csvs/nameDB.csv", nameDBRows.join("\r\n"))
    return mojangData
}

async function getColeweight(name = undefined, profile = undefined, discordData = undefined, guildCheck = false) 
{
    let data = {"experience" : {}, "powder": {}, "collection": {}, "miscellaneous": {}, profiles: [] },
     userData
    let coleweight = 0
    let coleweightlbPath = "./csvs/coleweightlb.csv",
     profileData,
     writeData = "",
     rank = "Unranked.",
     uuid = "",
     replaceName = false,
     nameFound = false,
     lbRows = fs.readFileSync(coleweightlbPath, "utf8").split("\r\n"),
     miningExp = 0,
     totalTime = Date.now()

    if(name == undefined)
    {
        name = await getLinkName(name, discordData)
        if(name == 0)
        {
            if(discordData.member.nickname != undefined) { name = discordData.member.nickname }
            else { name = discordData.user.username}
        }
    }

    let mojangData = await getMojangData(name)
    if(mojangData == 101) { return 101 }
    name = mojangData.username
    uuid = mojangData.uuid
    if(!guildCheck) console.log("name: " + name + "\nuuid: " + uuid)

    try
    {
        userData = (await axios.get(`https://api.hypixel.net/skyblock/profiles?key=${config.api.hypixelAPIkey}&uuid=${uuid}`)).data
    }
    catch(e)
    { 
        if(e == "AxiosError: Request failed with status code 429") { console.log(" (Hypixel) Pausing for 60 seconds!"); await sleep(60000); getColeweight(name, profile)}
        else { console.log(`HYPIXEL: `); catchError(e); return }
    }

    if(userData?.profiles == undefined) return 101 // user data is empty (wrong uuid or api rate limit)

    for(let i = 0; i < userData.profiles.length; i++)
    {
        if(userData?.profiles[i]?.members[uuid]?.experience_skill_mining == undefined) continue
        if (userData.profiles[i].members[uuid].experience_skill_mining >= miningExp)
            miningExp = userData.profiles[i].members[uuid].experience_skill_mining
    }

    for(let i = 0; i < userData.profiles.length; i++) 
    {
        if (userData?.profiles[i]?.members[uuid]?.experience_skill_mining != undefined)
        {
            if (profile == undefined && userData.profiles[i].selected == true)
            {
                if(userData.profiles[i].members[uuid].experience_skill_mining >= miningExp)
                    replaceName = true
                profileData = userData.profiles[i]
            }
            else if(profile != undefined && userData.profiles[i].cute_name.toLowerCase() == profile.toLowerCase())
            {
                if(userData.profiles[i].members[uuid].experience_skill_mining >= miningExp)
                    replaceName = true
                profileData = userData.profiles[i]
            }
            else
                replaceName = false
        }

        data.profiles.push(userData.profiles[i].cute_name)
    }

    if(profileData?.cute_name == undefined) // final check for profile if profile has skill api off.
    {
        replaceName = false
        for(let i = 0; i < userData.profiles.length; i++) 
        {
            if (profile == undefined && userData.profiles[i].selected == true)
                profileData = userData.profiles[i]
            else if(profile != undefined && userData.profiles[i].cute_name.toLowerCase() == profile.toLowerCase())
                profileData = userData.profiles[i]
        }
    }

    if(profileData?.cute_name == undefined) return 102 // no profiles

    try {
        let cwinfo = JSON.parse(fs.readFileSync("./csvs/cwinfo.json", "utf8"))
        for(let i = 0; i < cwinfo.length; i++)
        {
            let source = getObjectValue(profileData.members[uuid], cwinfo[i].path),
             source2 = getObjectValue(profileData.members[uuid], cwinfo[i].path2),
             eq
            
            if(data[cwinfo[i].category]?.total == undefined)
                data[cwinfo[i].category].total = 0
            
            if(source === undefined) continue

            eq = Math.ceil(source/cwinfo[i].cost*100) / 100

            if(source2 !== undefined)
                eq = Math.ceil((source+source2)/cwinfo[i].cost*100) / 100
            
            if(eq !== undefined)
            {
                data[cwinfo[i].category].total += eq
                data[cwinfo[i].category][cwinfo[i].nameStringed] = Math.round(eq*100) / 100
            }
        }
    }
    catch(e) { console.log(e) }
    coleweight = data.experience.total + data.powder.total + data.collection.total + data.miscellaneous.total
    
    // rounding below
    coleweight = Math.ceil(coleweight*100) / 100
	
    // cache data
    for(let i = 0; i < lbRows.length; i++)
    {
        let row = lbRows[i].split(" ")
        if(lbRows[i] == undefined || lbRows[i] == "") { lbRows.splice(i, 1) }
        if(row[2] == uuid) 
        {
            if (row[0] != name) 
            {
                console.log(`Found duplicate names ${row[0]} (orig) and ${name}!`)
                lbRows.splice(i, 1)
            }
            if (replaceName)
                lbRows.splice(i, 1)
            nameFound = true
            rank = i + 1
            break
        }
    }

    if(lbRows.length > 0)
    {
        let added = false

        for(let i = 0; i < lbRows.length; i++)
        {
            let row = lbRows[i].split(" "),
                previousRow = ["", Infinity]
            
            if(lbRows[i - 1] != undefined) { previousRow = lbRows[i - 1].split(" ") }

            if(coleweight >= row[1] && coleweight < previousRow[1] && ((replaceName && nameFound) || !nameFound)) 
            {
                added = true
                lbRows.splice(i, 0, name + " " + coleweight + " " + uuid)
                rank = i + 1
            }
        }

        if(!added && ((replaceName && nameFound) || !nameFound)) 
        {
            lbRows.push(name + " " + coleweight + " " + uuid)
            rank = lbRows.length
        }
    }
    else if ((replaceName && nameFound) || !nameFound)
    {
        lbRows.push(name + " " + coleweight + " " + uuid)
        rank = 1
    }


    writeData = lbRows.join("\r\n")
    fs.writeFileSync(coleweightlbPath, writeData)
    var percentile = "N/A"
    
    if(rank != undefined)
    {
        var percentile = Math.ceil(rank/(lbRows.length)*10000) / 100
    }
    data.name = name
    data.coleweight = coleweight
    data.rank = rank
    data.percentile = percentile
    data.profileData = profileData
    data.ping = Date.now() - totalTime 
	data.profile = profileData?.cute_name ?? "Unknown"

    if(fs.readFileSync("./csvs/coleweightlb.csv", "utf8").length >= fs.readFileSync("./csvs/coleweightlb backup.csv", "utf8").length)
    {
        fs.writeFile("./csvs/coleweightlb backup.csv", fs.readFileSync("./csvs/coleweightlb.csv", "utf8"), err => {
            if (err)
            {
                console.log("Write error 2: " + err)
            }
        })
    }


    return data
}

function getLeaderboard(path, length = Infinity) 
{
    let coleweightlbPath = path,
     rows = fs.readFileSync(coleweightlbPath, "utf8").split('\r\n'),
     lb = []

    for( let i = 0; i < rows.length && i < length; i++ ) 
    {
      let row = rows[i].split(" ")
      let name = row[0]
      let coleweight = row[1]

      lb[i] = 
      {
        rank: i + 1,
        name: name,
        coleweight: coleweight
      }
    }
    
    return lb
}

async function auctionScan(uuids)
{
    let recentlyEndedAuctions = (await axios.get(`https://api.hypixel.net/skyblock/auctions_ended`)).data.auctions,
        players = 0,
        date_ob = new Date(),
        dropUUIDs = 30
    
    for(let i = 0; i < recentlyEndedAuctions.length && i < 30; i++)
    {
        let seller = recentlyEndedAuctions[i].seller,
            buyer = recentlyEndedAuctions[i].buyer
        if(seller != undefined && uuids.indexOf(seller) == -1) { uuids.push(seller); await getColeweight(seller) }
        if (buyer != undefined && uuids.indexOf(buyer) == -1) { uuids.push(buyer); await getColeweight(buyer) }
        players += 1
    }
    minutes = date_ob.getMinutes()
    if(dropUUIDs != minutes)
    {
        console.log("Scanned " + players + " players!")
        await sleep(60000)
        auctionScan(uuids)
    }
    else
    {
        uuids = []
        console.log("Scanned " + players + " players!")
        await sleep(60000)
        auctionScan(uuids)
    }
}

async function lbreq(username)
{
    let lbRows = fs.readFileSync("./csvs/coleweightlb.csv", "utf8").split("\r\n"),
     row = [],
     data = {}
    
    for(let i = 0; i < lbRows.length; i++)
    {
        row = lbRows[i].split(" ")

        if(row[0] == username)
        {
            data.rank = i + 1
            return data
        }
    }
    data.rank = -1
    return data
}

module.exports = { getColeweight, getLeaderboard, auctionScan, sleep, lbreq, getMojangData }