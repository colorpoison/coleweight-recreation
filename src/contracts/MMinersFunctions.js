const coleweightFunctions = require("./coleweightFunctions")
const fs = require("node:fs")


function listMMiners()
{
    let MMRows = fs.readFileSync("./csvs/maliciousMiners.csv", "utf8").split("\r\n"),
     data = {"griefers" : [], "macroers" : []}
     row = []
    
    for(let i = 0; i < MMRows.length; i++)
    {
        row = MMRows[i].split(" ")

        if(row[1] == "griefer")
            data.griefers.push(row[0])
        else if(row[1] == "macroer")
            data.macroers.push(row[0])
    }

    return data
}

function findMM(username)
{
    const MMPATH = "./csvs/maliciousMiners.csv"
    let MMRows = fs.readFileSync(MMPATH, "utf8").split("\r\n"),
     data = 
    {
        found: false
    }

    for(let i = 0; i < MMRows.length; i++)
    {
        let ROWDATA = MMRows[i].split(" ")

        if(ROWDATA[0].toLowerCase() == username.toLowerCase())
        {
            data = 
            {
                found: true,
                name: ROWDATA[0],
                type: ROWDATA[1],
                discordUser: ROWDATA[2]
            }
            return data
        }
    }
    return data
}

function removeMM(username)
{
    const MMPATH = "./csvs/maliciousMiners.csv"
    let MMRows = fs.readFileSync(MMPATH, "utf8").split("\r\n"),
     writeData = "",
     res = 1
    
    for(let i = 0; i < MMRows.length; i++)
    {
        row = MMRows[i].split(" ")

        if(row[0].toLowerCase() == username.toLowerCase())
            res = 0
        else
        {
            if(row[2] != undefined)
            {
                if (writeData == "")
                    writeData = row[0] + " " + row[1] + " " + row[2]
                else 
                    writeData = writeData + "\r\n" + row[0] + " " + row[1] + " " + row[2]
            }
        }
    }
    fs.writeFileSync(MMPATH, writeData)
    return res
}

function addMM(username, type, discordUser)
{
    if(!(type == "griefer" || type == "macroer")) return 1
    const MMPATH = "./csvs/maliciousMiners.csv"
    let MM = fs.readFileSync(MMPATH, "utf8"),
     MMRows = MM.split("\r\n")

    for(let i = 0; i < MMRows.length; i++)
    {
        let ROWDATA = MMRows[i].split(" ")
        if(ROWDATA[0].toLowerCase() == username.toLowerCase())
        {
            return 1
        }
    }

    if(MM == "")
        writeData =  username + " " + type + " " + discordUser
    else
        writeData = MM + "\r\n" + username + " " + type + " " + discordUser
    fs.writeFileSync(MMPATH, writeData)
    return 0
}

module.exports = { addMM, findMM, removeMM, listMMiners }