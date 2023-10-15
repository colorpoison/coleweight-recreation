//Written by ryt

const config = require("../../config.json")
const coleweightFunctions = require("./coleweightFunctions")
const { getMojangData, toJson } = require("./api")
const inventories = ["backpack_contents", "ender_chest_contents", "inv_contents"]
const fs = require("node:fs")
const { logToFile } = require("./log")
var lastAlloy=-2
var bannedIps = undefined
var beingChecked = new Set()
var strikesByIp = new Map()

function alloyCheck(name,ip){
    if(getBannedIps().has(ip))
        return false
    if(beingChecked.has(name))
        return true
    if(!(ip in strikesByIp)){
        strikesByIp[ip]=0
    }
    let strikes=strikesByIp[ip]
    strikesByIp[ip]++
    setTimeout(function(){strikesByIp[ip]--},5*60*60*1000) //strikes are reset after 5 hours
    beingChecked.add(name)
    if(strikes>2)
        banIp(ip)
    else
        scheduleAlloyTests(name,18)
    return true
}
function getBannedIps(){
    if(bannedIps == undefined){
        ips=fs.readFileSync("./csvs/bannedIps.csv").toString().split("\n")
        ips.pop()
        bannedIps = new Set(ips)
    }
    return bannedIps
}
function banIp(ip){
    if(ip in getBannedIps())
        return
    getBannedIps().add(ip)
    fs.appendFile("./csvs/bannedIps.csv", ip+"\n", function (err) {
        if (err) {
            logToFile(err.message)
        } 
      })
}
async function scheduleAlloyTests(name, amount){
    if(amount<=0){
        beingChecked.delete(name)
        return
    }
    if(!(await attemptAlloyUpdate(name)))
        setTimeout(function(){scheduleAlloyTests(name,amount-1)},10*1000)
    else
        beingChecked.delete(name)
}   
async function attemptAlloyUpdate(name){
    let alloyTime = await newestAlloyTimestamp(name)
    if(alloyTime>getLastAlloy()){
        logToFile("Player "+name+" dropped a new alloy at timestamp "+alloyTime.toString())
        setLastAlloy(alloyTime)
        return true
    }
    return false
}
function getLastAlloy(){
    
    if(lastAlloy==-2){
        lastAlloyString=fs.readFileSync("./csvs/lastAlloy.csv").toString()
        if(!(lastAlloyString === ""))
            lastAlloy=parseInt(lastAlloyString)
    }
    return lastAlloy
}
function setLastAlloy(timestamp){
    lastAlloy=timestamp
    fs.writeFile("./csvs/lastAlloy.csv",timestamp.toString(),(err) => {
        if (err) {
            logToFile(err.toString())
        } 
      })
}
async function newestAlloyTimestamp(name){
    let mojangData = await getMojangData(name)
    if(mojangData.error) 
        return -1
    let userData = await coleweightFunctions.getUserData(mojangData.uuid)
    if(userData.code == 429 || userData.code == 502 || userData?.profiles == undefined)
        return -1
    let res = -1;
    for(let i = 0; i < userData.profiles.length; i++){
        if(userData.profiles[i]?.members[mojangData.uuid]==undefined)
            continue
        res = Math.max(res,await newestAlloyTimestampProfile(userData.profiles[i].members[mojangData.uuid]))
    }
    return Math.max(res,await newestAlloyTimestampAuction(mojangData.uuid))
}
async function newestAlloyTimestampAuction(uuid){
    auctions=await coleweightFunctions.getUserAuctions(uuid)
    if(auctions?.auctions == undefined)
        return -1
    let res = -1
    for(let i = 0; i<auctions.auctions.length;i++){
        res = Math.max(res,newestAlloyTimestampInventory((await toJson(auctions.auctions[i]?.item_bytes?.data))?.value?.i?.value?.value))
    }
    return res
}
async function newestAlloyTimestampProfile(profile){
    if(!("inv_contents" in profile)||!("ender_chest_contents" in profile)){
        return -1
    }
    let list = [profile["inv_contents"],profile["ender_chest_contents"]]
    if("backpack_contents" in profile){
        let i = 0
        while(i in profile["backpack_contents"])
            list.push(profile["backpack_contents"][i++])
    }
    let res = -1;
    for(let i = 0; i < list.length; i++){
            res = Math.max(res,newestAlloyTimestampInventory((await toJson(list[i]?.data))?.value?.i?.value?.value))
    }
    return res
}
function newestAlloyTimestampInventory(inventory){
    if(inventory==undefined)
        return -1
    let res = -1;
    for(let i = 0; i < inventory.length; i++){
        res = Math.max(res,alloyTimestamp(inventory[i]))
    }
    return res

}
function alloyTimestamp(item){
    extraAttributes=item?.tag?.value?.ExtraAttributes?.value
    if(!(extraAttributes?.id?.value === "DIVAN_ALLOY") || extraAttributes?.timestamp?.value==undefined || ("raffle_win" in extraAttributes))
        return -1
    return hypixelDateToUTC(extraAttributes.timestamp.value)
}
function hypixelDateToUTC(date){
    return new Date(new Date(date).getTime()+4*3600000).getTime()
}
module.exports = {alloyCheck, getLastAlloy}