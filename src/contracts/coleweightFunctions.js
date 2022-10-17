const config = require('../../config.json')
const axios = require('axios');
const fs = require('node:fs');

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}
async function getProfile(uuid, profileToSearch='none') 
{
    const userData = (await axios.get(`https://api.hypixel.net/skyblock/profiles?key=${config.api.hypixelAPIkey}&uuid=${uuid}`)).data
    for(let i=0; i < userData.profiles.length; i+=1) {
        if(profileToSearch = 'none') { if(userData.profiles[i].selected == true) { return userData.profiles[i] } }
        if(userData.profiles[i].cute_name == profileToSearch) { return userData.profiles[i] }
    }
}

async function getColeweight(name, profile) 
{
    let data = {}
    var coleweightPath = "./coleweight.csv"
    var coleweightRows = fs.readFileSync(coleweightPath, "utf8").split('\r\n') 
    var collectionColeWeight = 0, mithrilPowderColeWeight = 0, bestiaryColeWeight = 0,
        powderColeWeight = 0, experienceColeWeight = 0,
        gemstonePowderColeWeight = 0, nucleusRunsColeWeight = 0,
        coleweight = 0
    var coleweightlbPath = "./coleweightlb.csv"
    var writeData = ""
    var rank = "Unranked. do /coleweightlb to update"
    var lbRows = (fs.readFileSync(coleweightlbPath).toString()).split('\r\n') 
    var uuid = ""

    if(profile == undefined) { profile = 'none'}

    for(let i = 0; i < lbRows.length; i++) 
    {
        let row = lbRows[i].split(" ")

        if(row[2] == name)
        {
            uuid = name
            name = row[0]
        }
    }
    if(uuid == "") {
        mojangData = (await axios.get(`https://api.ashcon.app/mojang/v2/user/${name}`)).data
        name = mojangData.username
        for(let i = 0; i < mojangData.uuid.length; i++)
        {
            if(mojangData.uuid[i] != "-")
            {
                uuid = uuid + mojangData.uuid[i]
            }
        }
    }

    /*
    catch (e) {
        if(e == "AxiosError: Request failed with status code 429") { console.log(" (Mojang) Pausing for 60 seconds!"); await sleep(60000); getColeweight(name, profile)}
    }
    */
    
    try{
        var profileData = await getProfile(uuid, profile)
    }
    catch(e) 
    { 
        if(e == "AxiosError: Request failed with status code 429") { console.log(" (Hypixel) Pausing for 60 seconds!"); await sleep(60000); getColeweight(name, profile)}
    }
    try {
        for( let i=0; i < coleweightRows.length; i+=1 ) {
            let row = coleweightRows[i].split(",")
            let sourceToSearch = row[1]

            if(row[0] == 1) 
            { // mining exp
                source = profileData['members'][uuid][sourceToSearch]
                if(source != undefined) { experienceColeWeight = Math.ceil(source/row[2]*100) / 100 }
            } 
            if(row[0] == 2) 
            { // mithril powder
                source = profileData['members'][uuid]['mining_core'][sourceToSearch]
                powder2 = profileData['members'][uuid]['mining_core']['powder_spent_mithril']
                if(source != undefined)
                {
                    if (powder2 != undefined) { mithrilPowderColeWeight = Math.ceil((source+powder2)/row[2]*100) / 100 }
                    else { mithrilPowderColeWeight = Math.ceil((source)/row[2]*100) / 100 }
                }   
            }
            
            if(row[0] == 3) 
            { // gemstone powder
                source = profileData['members'][uuid]['mining_core'][sourceToSearch]
                powder2 = profileData['members'][uuid]['mining_core']['powder_spent_gemstone']
                if (source != undefined) {
                    if(powder2 != undefined) { gemstonePowderColeWeight = Math.ceil((source+powder2)/row[2]*100) / 100 } 
                    else { gemstonePowderColeWeight = Math.ceil((source)/row[2]*100) / 100 }
                }
                
            }
            powderColeWeight = gemstonePowderColeWeight + mithrilPowderColeWeight
            if(row[0] >= 4 && row[0] <= 25) 
            { // collection
                sourceToSearch = sourceToSearch.toUpperCase()

                source = profileData['members'][uuid]['collection'][sourceToSearch]
                if(source != undefined) { collectionColeWeight += Math.ceil(source/row[2]*100) / 100 }
            } 
            if(row[0] >=26 && row[0] <= 27) 
            { // worms/scathas
                source = profileData['members'][uuid]['bestiary'][sourceToSearch]
                if(source != undefined) { bestiaryColeWeight += Math.ceil(source/row[2]*100) / 100 }
            }
            coleweight += bestiaryColeWeight
            if(row[0] == 28) 
            { // nucleus runs
                source = profileData['members'][uuid]['mining_core']['crystals']['jade_crystal'][sourceToSearch]
                if(source != undefined) { nucleusRunsColeWeight = Math.ceil(source/row[2]*100) / 100 }
            }
        } 
    }
    catch(e) { name + " had api off!" }

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
            lbRows.splice(i, 1)
        }
    }

    writeData = ""
    for(let i = 0; i < lbRows.length; i++)
    {
        let row = lbRows[i].split(" "),
            previousRow = ["", Infinity]
        if(lbRows[i - 1] != undefined) { previousRow = lbRows[i - 1].split(" ") }

        if(coleweight >= row[1] && coleweight < previousRow[1]) 
        {
            lbRows.splice(i, 0, name + " " + coleweight + " " + uuid)
            rank = i + 1
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

    return data;
}

module.exports = { getColeweight, getProfile, }