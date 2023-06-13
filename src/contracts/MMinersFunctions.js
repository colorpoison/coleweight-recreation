const { getMojangData } = require("./api")
const coleweightFunctions = require("./coleweightFunctions")
const fs = require("node:fs")
const { logToFile } = require("./log")


async function listMMiners(uuidOnly = false)
{
    let MMRows = fs.readFileSync("./csvs/maliciousMiners.csv", "utf8").split("\r\n"),
     data = {"griefers" : [], "macroers" : [], "scammers": []}
     row = []

    for(let i = 0; i < MMRows.length; i++)
    {
        row = MMRows[i].split(" ")
        let mojangData = {}
        if(!uuidOnly) mojangData = await getMojangData(row[0])

        if(mojangData.error) continue

        if(row[1] == "griefer" && row[5] != "false")
            data.griefers.push({uuid: row[0], name: mojangData.username ?? "", timestamp: row[3] ?? Date.now()})
        else if(row[1] == "macroer" && row[5] != "false")
            data.macroers.push({uuid: row[0], name: mojangData.username ?? "", timestamp: row[3] ?? Date.now()})
        else if(row[1] == "scammer" && row[5] != "false")
        data.scammers.push({uuid: row[0], name: mojangData.username ?? "", timestamp: row[3] ?? Date.now()})
    }

    return data
}
/**
 * Finds if user on mminer list.
 * @param {string} uuid uuid of player.
 * @param {boolean} staff if player is staff.
 */
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
     res = 1

    for(let i = 0; i < MMRows.length; i++)
    {
        row = MMRows[i].split(" ")

        if(row[0].toLowerCase() == uuid.toLowerCase())
        {
            MMRows.splice(i, 1)
            res = 0
        }
    }

    fs.writeFileSync(MMPATH, MMRows.join("\r\n"))
    return res
}

function addMM(uuid, type, discordID, griefcount = 1, visible, proof = "")
{
    if(!(type == "griefer" || type == "macroer" || type == "scammer")) return -1
    const MMPATH = "./csvs/maliciousMiners.csv"
    let MMRows = fs.readFileSync(MMPATH, "utf8").split("\r\n"),
     found = false,
     writeData = ""

    for(let i = 0; i < MMRows.length; i++)
    {
        let ROWDATA = MMRows[i].split(" ")

        if(ROWDATA[0].toLowerCase() == uuid.toLowerCase())
        {
            ROWDATA[4] = parseInt(ROWDATA[4]) + griefcount
            griefcount = ROWDATA[4]
            if(visible != undefined) ROWDATA[5] = visible
            found = true
        }

        MMRows[i] = ROWDATA.join(" ")
    }

    if(!found)
    {
        if(proof != undefined)
            MMRows.push(writeData += uuid + " " + type + " " + discordID + " " + Date.now() + " " + griefcount + " " + visible + " " + proof)
        else
            MMRows.push(writeData += uuid + " " + type + " " + discordID + " " + Date.now() + " " + griefcount + " " + visible)
    }

    fs.writeFileSync("./csvs/maliciousMiners.csv", MMRows.join("\r\n"))
    return griefcount
}

async function autoRemoveGriefers()
{
    let MMRows = fs.readFileSync("./csvs/maliciousMiners.csv", "utf8").split("\r\n")
    if(MMRows.length < 5)
        logToFile("Wewoo! < 5! 1")

    MMRows.forEach((element, index) => {
        row = element.split(" ")

        if(parseInt(row[4]) === 1 && Date.now() - parseInt(row[3]) > 1209600000) // 2 weeks
            MMRows.splice(index, 1)
        else if(Date.now() - parseInt(row[3]) > 1209600000)
        {
            row[4] = parseInt(row[4]) - 1
            row[3] = Date.now()
            MMRows[index] = row.join(" ")
        }
    })
    if(MMRows.length < 5)
        logToFile("Wewoo! < 5! 2")

    fs.writeFileSync("./csvs/maliciousMiners.csv", MMRows.join("\r\n"))
    await coleweightFunctions.sleep(3600000) // 1 hour
    autoRemoveGriefers()
}


module.exports = { addMM, findMM, removeMM, listMMiners, autoRemoveGriefers }