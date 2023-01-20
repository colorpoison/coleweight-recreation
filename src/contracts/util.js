const config = require('../../config.json')


async function checkMojangAuth(name, serverId)
{
    try
    {
        let mojangRes = await axios.get(`https://sessionserver.mojang.com/session/minecraft/hasJoined?username=${name}&serverId=${serverId}`)

        if(mojangRes.status != 200)
            return {success: false, code: 501, reason: `Unknown error. (mojangRes)`}
        else
            return {success: true, data: mojangRes}
    }
    catch(e) 
        {return {success: false, code: 501, reason: `${e}`}}
}


function getObjectValue(obj, path, def = undefined) 
{
	let current = obj
    if(path == undefined) return undefined
    for (let i = 0; i < path.length; i++)
    {
        if(current == undefined) return undefined
	    current = current[path[i]]
    }

	return current
}


function discordMarkdownFix(string) {
    if(string == undefined) return string
    for(let j = 0; j < string.length; j++)
    {
        if(string[j] == "_")
        {
            string = string.slice(0, j) + "\\" + string.slice(j)
            j++
        }
    }
    return string
}


function isStaff(user)
{
    let out = false

    config.discord.staffRoles.forEach(roleID => {
        if(user.roles.cache.has(roleID))
            out = true
    })

    return out
}


module.exports = { checkMojangAuth, getObjectValue, discordMarkdownFix, isStaff }