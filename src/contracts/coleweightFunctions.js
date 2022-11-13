/*
Updated by Ninjune on 11/4/22
- Made it so it replaces name if mining exp of profile is the highest of the player
Written by Ninjune on 10/?/22
*/
const config = require('../../config.json')
const axios = require('axios')
const fs = require('node:fs')

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

function sleep(ms) 
{
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    })
}

async function getLinkName(name, data)
{
    if( name == undefined ) { 
        let discordUserData = await data.guild.members.fetch(data.user),
         discUser = discordUserData.user.username + "#" + discordUserData.user.discriminator,
         discRows = (fs.readFileSync("./csvs/discord.csv").toString()).split('\r\n')
        
        
        for(let i = 0; i < discRows.length; i++)
        {
            let row = discRows[i].split(" ")
            if(discUser == row[0]) { name = row[1]; return name }
        }
        return 0;
    }
}

async function getColeweight(name = undefined, profile = undefined, discordData = undefined) 
{
    let data = {"experience" : {}, "powder": {}, "collection": {}, "miscellaneous": {}},
     coleweightPath = "./csvs/coleweight.csv",
     coleweightRows = fs.readFileSync(coleweightPath, "utf8").split('\r\n'),
     userData
    let collectionColeWeight = 0, mithrilPowderColeWeight = 0, bestiaryColeWeight = 0,
        powderColeWeight = 0, experienceColeWeight = 0,
        gemstonePowderColeWeight = 0, nucleusRunsColeWeight = 0,
        coleweight = 0
    let coleweightlbPath = "./csvs/coleweightlb.csv",
     profileData,
     profiles = [],
     writeData = "",
     rank = "Unranked.",
     uuid = "",
     replaceName = false,
     nameFound = false,
     mojangData = "",
     lbRows = fs.readFileSync(coleweightlbPath, "utf8").split("\r\n"),
     miningExp = 0

    if(name == undefined)
    {
        name = await getLinkName(name, discordData)
        if(name == 0)
        {
            if(discordData.member.nickname != undefined) { name = discordData.member.nickname }
            else { name = discordData.user.username}
        }
    }

    for(let i = 0; i < lbRows.length; i++)
    {
        let row = lbRows[i].split(" ")

        if(row[2] == name)
        {
            uuid = name
            name = row[0]
        }
    }

    if(uuid == "") 
    {
        try 
        {
            mojangData = (await axios.get(`https://api.ashcon.app/mojang/v2/user/${name}`)).data
            name = mojangData.username
            for(let i = 0; i < mojangData.uuid.length; i++)
            {
                if(mojangData.uuid[i] != "-")
                {
                    uuid = uuid + mojangData.uuid[i]
                }
            }
            /*
            else
            {
                try 
                {
                    mojangData = (await axios.get(`https://playerdb.co/api/player/minecraft/${name}`)).data.data.players
                    name = mojangData.username
                    uuid = mojangData.raw_id
                }
                catch(error) {}
            }*/
        }
        catch(error) 
        {
            //console.log("ASHCON: ")
            //catchError(error)
            return
        }
    }
    if(uuid == undefined) return
    /*
    catch (e) {
        if(e == "AxiosError: Request failed with status code 429") { console.log(" (Mojang) Pausing for 60 seconds!"); await sleep(60000); getColeweight(name, profile)}
    }
    */
    
    try{
        userData = (await axios.get(`https://api.hypixel.net/skyblock/profiles?key=${config.api.hypixelAPIkey}&uuid=${uuid}`)).data
    }
    catch(e) 
    { 
        if(e == "AxiosError: Request failed with status code 429") { console.log(" (Hypixel) Pausing for 60 seconds!"); await sleep(60000); getColeweight(name, profile)}
    }

    if(userData == undefined) return 101 // user data is empty (wrong uuid or api rate limit)

    for(let i = 0; i < userData.profiles.length; i++)
    {
        if (userData.profiles[i].members[uuid].experience_skill_mining == undefined) continue
        if (userData.profiles[i].members[uuid].experience_skill_mining >= miningExp) 
            miningExp = userData.profiles[i].members[uuid].experience_skill_mining
    }

    for(let i = 0; i < userData.profiles.length; i++) 
    {
        if (userData.profiles[i].members[uuid].experience_skill_mining == undefined) continue
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
        
        profiles.push(userData.profiles[i].cute_name)
    }
    
    /*
    if(profile == undefined) 
    {
        if(userData.profiles[i]['members'][uuid].experience_skill_mining > tempMiningExp)
        {
            tempMiningExp = userData.profiles[i]['members'][uuid].experience_skill_mining
            profileData = userData.profiles[i]
        }
    }*/
    try {
        for( let i=0; i < coleweightRows.length; i+=1 ) {
            let row = coleweightRows[i].split(","),
             sourceToSearch = row[0]
            
            if(row[2] == undefined)
            {
                let source = profileData.members[uuid][sourceToSearch]

                if(source != undefined) 
                {
                    let eq = Math.ceil(source/row[1]*100) / 100

                    experienceColeWeight += eq
                    data.experience[sourceToSearch] = eq
                }
                else
                    data.experience[sourceToSearch] = 0
            }
            else if(row[3] == undefined)
            {
                let source = profileData.members[uuid][row[2]][sourceToSearch],
                    eq = 0
                
                if (sourceToSearch == "powder_mithril_total")
                {
                    if(source != undefined)
                    {
                        eq = Math.ceil(source/row[1]*100) / 100
                        let powder2 = profileData.members[uuid]['mining_core']['powder_spent_mithril']

                        if(powder2 != undefined)
                            eq = Math.ceil((source+powder2)/row[1]*100) / 100
                        powderColeWeight += eq
                        data.powder[sourceToSearch] = eq
                    }
                    else
                        data.powder[sourceToSearch] = 0
                }
                else if (sourceToSearch == "powder_gemstone_total")
                {
                    if(source != undefined) 
                    {
                        eq = Math.ceil(source/row[1]*100) / 100
                        let powder2 = profileData.members[uuid]['mining_core']['powder_spent_gemstone']

                        if(powder2 != undefined)
                            eq = Math.ceil((source+powder2)/row[1]*100) / 100
                        
                        powderColeWeight += eq
                        data.powder[sourceToSearch] = eq
                    }
                    else
                        data.powder[sourceToSearch] = 0
                }
                else if (row[2] == "collection")
                {
                    if(source != undefined) 
                    {
                        eq = Math.ceil(source/row[1]*100) / 100

                        collectionColeWeight += eq
                        data.collection[sourceToSearch] = eq
                    }
                    else
                        data.collection[sourceToSearch] = 0
                }
                else if (row[2] == "bestiary")
                {
                    if(source != undefined) 
                    {
                        eq = Math.ceil(source/row[1]*100) / 100

                        bestiaryColeWeight += eq
                        data.miscellaneous[sourceToSearch] = eq
                    }
                    else
                        data.miscellaneous[sourceToSearch] = 0
                }
            }
            else
            {
                let source = profileData.members[uuid][row[2]][row[3]][row[4]][sourceToSearch]
                if(source != undefined) 
                {
                    eq = Math.ceil(source/row[1]*100) / 100

                    nucleusRunsColeWeight += eq
                    data.miscellaneous[sourceToSearch] = eq
                }
                else
                    data.miscellaneous[sourceToSearch] = 0
            }
        }
    }
    catch(e) {}

    coleweight = experienceColeWeight + powderColeWeight + collectionColeWeight + bestiaryColeWeight + nucleusRunsColeWeight
    // rounding below
    experienceColeWeight = Math.ceil(experienceColeWeight*100) / 100
    powderColeWeight = Math.ceil(powderColeWeight*100) / 100
    collectionColeWeight = Math.ceil(collectionColeWeight*100) / 100
    bestiaryColeWeight = Math.ceil(bestiaryColeWeight*100) / 100
    nucleusRunsColeWeight = Math.ceil(nucleusRunsColeWeight*100) / 100
    coleweight = Math.ceil(coleweight*100) / 100
	
    // cache data
    for(let i = 0; i < lbRows.length; i++)
    {
        let row = lbRows[i].split(" ")
        if(lbRows[i] == undefined || lbRows[i] == "") { lbRows.splice(i, 1) }
        if(row[0] == name) {
            if (replaceName)
                lbRows.splice(i, 1)
            nameFound = true
            rank = i + 1
        }
    }

    for(let i = 0; i < lbRows.length; i++)
    {
        let row = lbRows[i].split(" "),
            previousRow = ["", Infinity]
        if(lbRows[i - 1] != undefined) { previousRow = lbRows[i - 1].split(" ") }

        if(coleweight >= row[1] && coleweight < previousRow[1] && ((replaceName && nameFound) || !nameFound)) 
        {
            lbRows.splice(i, 0, name + " " + coleweight + " " + uuid)
            rank = i + 1
        }
        if(row[2] == uuid && row[0] != name)
        {
            console.log(`Found duplicate names ${row[0]} (orig) and ${name}!`)
            lbRows.splice(i, 1)
        }
        if(i < lbRows.length - 1) { writeData = writeData + lbRows[i] + "\r\n" }
        else if( row[2] != undefined) { writeData = writeData + row[0] + " " + parseFloat(row[1]) + " " + row[2]}
        else { writeData = writeData + row[0] + " " + parseFloat(row[1])}
    }

    fs.writeFileSync(coleweightlbPath, writeData)
    var percentile = "N/A"
    
    if(rank != undefined)
    {
        var percentile = Math.ceil(rank/(lbRows.length)*10000) / 100
    }
    
    data.name = name
    data.coleweight = coleweight
    data.rank = rank
    data.exp = experienceColeWeight
    data.pow = powderColeWeight
    data.col = collectionColeWeight
    data.bes = bestiaryColeWeight
    data.nuc = nucleusRunsColeWeight
    data.percentile = percentile
    data.profileData = profileData
    data.profiles = profiles
    try 
	{
		data.profile = profileData['cute_name']
	} catch {}
    

    if(fs.readFileSync("./csvs/coleweightlb.csv", "utf8").length >= fs.readFileSync("./csvs/coleweightlb backup.csv", "utf8").length)
    {
        fs.writeFile("./csvs/coleweightlb backup.csv", fs.readFileSync("./csvs/coleweightlb.csv", "utf8"), err => {
            if (err)
            {
                console.log("Write error 2: " + err)
            }
        })
    }


    return data;
}

function getLeaderboard(path) 
{
    let coleweightlbPath = path,
     rows = fs.readFileSync(coleweightlbPath, "utf8").split('\r\n'),
     lb = []

    for( let i=0; i < rows.length; i+=1 ) 
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
    
    return lb;
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

module.exports = { getColeweight, getLeaderboard, auctionScan, sleep, lbreq }