const coleweightFunctions = require("./coleweightFunctions")
const fs = require("node:fs")


async function listMMiners(uuidOnly = false)
{
    let MMRows = fs.readFileSync("./csvs/maliciousMiners.csv", "utf8").split("\r\n"),
     data = {"griefers" : [], "macroers" : [], "scammers": []}
     row = []
    
    for(let i = 0; i < MMRows.length; i++)
    {
        row = MMRows[i].split(" ")
        let mojangData = {}
        if(!uuidOnly) mojangData = await coleweightFunctions.getMojangData(row[0])

        if(row[1] == "griefer" && row[5] != "false")
            data.griefers.push({uuid: row[0], name: mojangData.username ?? "", timestamp: row[3] ?? Date.now()})
        else if(row[1] == "macroer" && row[5] != "false")
            data.macroers.push({uuid: row[0], name: mojangData.username ?? "", timestamp: row[3] ?? Date.now()})
        else if(row[1] == "scammer" && row[5] != "false")
           data.scammers.push({uuid: row[0], name: mojangData.username ?? "", timestamp: row[3] ?? Date.now()})
    }
    
    return data
}

function findMM(uuid, staff=false)
{
    const MMPATH = "./csvs/maliciousMiners.csv"
    let MMRows = fs.readFileSync(MMPATH, "utf8").split("\r\n"),
     data = { found: false }

    for(let i = 0; i < MMRows.length; i++)
    {
        let ROWDATA = MMRows[i].split(" ")

        if(ROWDATA[0].toLowerCase() == uuid.toLowerCase())
        {
            data = 
            {
                found: true,
                type: ROWDATA[1],
                discordUser: ROWDATA[2],
                timestamp: ROWDATA[3]
            }

            if(staff)
                data.griefcount = ROWDATA[4]
            
            return data
        }
    }

    return data
}

function removeMM(uuid)
{
    const MMPATH = "./csvs/maliciousMiners.csv"
    let MMRows = fs.readFileSync(MMPATH, "utf8").split("\r\n"),
     writeData = "",
     res = 1
    
    for(let i = 0; i < MMRows.length; i++)
    {
        row = MMRows[i].split(" ")

        if(row[0].toLowerCase() == uuid.toLowerCase())
            res = 0
        else
        {
            if(row[2] != undefined)
            {
                if (writeData != "")
                    writeData += "\r\n"
                writeData += row.join(' ')
            }
        }
    }
    fs.writeFileSync(MMPATH, writeData)
    return res
}

function addMM(uuid, type, discordID, griefcount = 1, visible, proof = "")
{
    if(!(type == "griefer" || type == "macroer" || type == "scammer")) return -1
    const MMPATH = "./csvs/maliciousMiners.csv"
    let MM = fs.readFileSync(MMPATH, "utf8") ?? "",
     MMRows = MM.split("\r\n"),
     writeData = ""

    for(let i = 0; i < MMRows.length; i++)
    {
        let ROWDATA = MMRows[i].split(" ")

        if(ROWDATA[0].toLowerCase() == uuid.toLowerCase())
        {
            griefcount += parseInt(ROWDATA[4])
            if(visible == undefined) visible = row[5] ?? true
        }
        else
            writeData += ROWDATA.join(" ") + "\r\n"
    }

    if(proof != undefined)
        writeData += uuid + " " + type + " " + discordID + " " + Date.now() + " " + griefcount + " " + visible + " " + proof
    else
        writeData += uuid + " " + type + " " + discordID + " " + Date.now() + " " + griefcount + " " + visible

    fs.writeFileSync(MMPATH, writeData)
    return griefcount
}

async function autoRemoveGriefers()
{
    const MMPATH = "./csvs/maliciousMiners.csv"
    let MM = fs.readFileSync(MMPATH, "utf8").split("\r\n")
    let writeData = ""

    MM.forEach(element => {
        row = element.split(" ")

        if(Date.now() - row[3] < 1209600000) // 2 weeks
        {
            if (writeData != "")
                writeData += "\r\n"
            writeData += row.join(' ')
        }
        else if(row[4] > 1)
        {
            row[4] -= 1
            row[3] = Date.now()
            if (writeData != "")
                writeData += "\r\n"
            writeData += row.join(' ')
        }
    })

    fs.writeFileSync(MMPATH, writeData)
    await coleweightFunctions.sleep(3600000) // 1 hour
    autoRemoveGriefers()
}


module.exports = { addMM, findMM, removeMM, listMMiners, autoRemoveGriefers }
