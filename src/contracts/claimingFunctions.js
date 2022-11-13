/*
Written by Ninjune on 11/12/22
*/
const axios = require('axios')
const fs = require('fs')
const coleweightFunctions = require('./coleweightFunctions')

async function claim(req)
{
    let queries = ["id", "type", "key"],
     wrongQueries = [],
     queryData = [],
     mojangData = "",
     keyData = ""

    for(let i = 0; i < queries.length; i++)
    {
        if(req.query[queries[i]] == undefined)
        {
            wrongQueries.push(queries[i])
        }
        else
        {
            queryData[queries[i]] = req.query[queries[i]]
        }
    }

    if(wrongQueries.length > 0) 
        return {success: "false", cause:  `Missing required parameters "${wrongQueries}"`}

    if(queryData.type == undefined || !(queryData.type.toLowerCase() == "throne" || queryData.type.toLowerCase() == "spiral"))
        return {success: "false", cause: `Type is invalid. Must be 'throne' or 'spiral'.`}
    
    try
        {keyData = await axios.get(`https://api.hypixel.net/key?key=${queryData.key}`)}
    catch
        {return {sucess: "false", code: "401", reason: "Invalid API key."}}
    
    try
        {mojangData = await axios.get(`https://api.ashcon.app/mojang/v2/user/${keyData.data.record.owner}`)}
    catch
        {return {sucess: "false", code: "500", reason: "Unknown reason."}}
    
    claimedRows = fs.readFileSync("./csvs/claimed.csv", "utf-8").split("\r\n")
    writeData = ""

    for(let i = 0; i < claimedRows.length; i++)
    {
        row = claimedRows[i].split(" ")
        if (row[0] != mojangData.data.username)
            writeData += claimedRows[i]
    }

    if(claimedRows != "")
        writeData += "\r\n" + mojangData.data.username + " " + queryData.id + " " + queryData.type.toLowerCase() + " 0"
    else
        writeData = mojangData.data.username + " " + queryData.id + " " + queryData.type.toLowerCase() + " 0"

    fs.writeFileSync("./csvs/claimed.csv", writeData)
    return {success: "true"}
}


async function checkClaimed(serverID)
{
    claimedRows = fs.readFileSync("./csvs/claimed.csv", "utf-8").split("\r\n")
    for (let i = 0; i < claimedRows.length; i++)
    {
        row = claimedRows[i].split(" ")

        if(row[1].toLowerCase() == serverID.toLowerCase())
            return {claimed: "true", player: row[0], structure: row[2]}
    }
    
    return {claimed: "false"}
}


async function updateClaimed()
{
    await coleweightFunctions.sleep(3600000) // 1 hour
    console.log("been an hour")

    claimedRows = fs.readFileSync("./csvs/claimed.csv", "utf-8").split("\r\n")
    writeData = ""

    for(let i = 0; i < claimedRows.length; i++)
    {
        row = claimedRows[i].split(" ")
        if(row[3] + 1 < 5)
            writeData += row[0] + " " + row[1] + " " + row[2] + (row[3] + 1) + "\r\n"
    }

    if(writeData != "")
        writeData += "\r\n" + mojangData.data.username + " " + queryData.id + " " + queryData.type.toLowerCase() + " 0"
    else
        writeData = mojangData.data.username + " " + queryData.id + " " + queryData.type.toLowerCase() + " 0"

    fs.writeFileSync("./csvs/claimed.csv", writeData)
    updateClaimed()
}
module.exports = { claim, checkClaimed, updateClaimed }