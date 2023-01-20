const config = require('../../../config.json')
const { EmbedBuilder } = require("discord.js")
const axios = require('axios')
const coleweightFunctions = require("../../contracts/coleweightFunctions")
const { discordMarkdownFix, isStaff } = require('../../contracts/util')
const { badResponse } = require('../../contracts/commandResponses')


function sort(lb) 
{
    for( let i=0; i < lb.length; i += 1 ) 
    {
        if(lb[i] == undefined || lb[i] == "") { lb.splice(i, 1); continue }
        let row = lb[i].split(" "), previousRow = ["", Infinity], nextRow = ["", 0], lbTemp = lb[i]
        if(row[1] == undefined) { lb.splice(i, 1); continue }
        if(lb[i - 1] != undefined) { previousRow = lb[i - 1].split(" ") }
        if(lb[i + 1] != undefined) { nextRow = lb[i + 1].split(" ") }
        let cw = parseFloat(row[1]), previousCw = parseFloat(previousRow[1]), nextCw = parseFloat(nextRow[1])

        if(cw <= previousCw && cw >= nextCw) { }
        else if (cw > previousCw) 
        {
            lb.splice(i, 1)
            lb.splice(i - 1, 0, lbTemp)
        }
    }
}


module.exports = {
    name: 'cwguild',
    description: 'Shows Coleweight details for a guild.',
    options: [
        {
            name: 'guild',
            description: 'Hypixel Guild',
            type: 3,
            required: true
        }
    ],

    execute: async (interaction, client) => {
        let user = await interaction.guild.members.fetch(interaction.user)
        if (isStaff(user)) {
            try 
            {
                const guild = interaction.options.getString("guild")
                const guildData = (await axios.get(`https://api.hypixel.net/guild?key=${config.api.hypixelAPIkey}&name=${guild}`)).data
                let lengthOfGuild = guildData.guild.members.length,
                  max = 0,
                  lb = [],
                  coleweightSum = 0
                  desc = ""
                
                for( let i=0; i < lengthOfGuild; i+=1 ) 
                {
                    let member = guildData.guild.members[i].uuid
                    let data = await coleweightFunctions.getColeweight(member, undefined, undefined, true)
                    
                    if (data?.name == undefined) continue
                    lb.push(data.name + " " + data?.coleweight ?? 0)
                    coleweightSum += data?.coleweight ?? 0

                    if(data.coleweight > max) { max = data.coleweight}
                    if(i == 0)
                    {
                        const embed = new EmbedBuilder()
                        .setColor(0x009900)
                        .setTitle(`(${i+1}/${lengthOfGuild}) Checked ColeWeight for ${data.name}`)
                        interaction.editReply({ embeds: [embed] })
                    }
                    else
                    {
                        const embed = new EmbedBuilder()
                        .setColor(0x009900)
                        .setTitle(`(${i+1}/${lengthOfGuild}) Checked ColeWeight for ${data.name}`)
                        interaction.editReply({ embeds: [embed] })
                    }
                }
              
                for(let i = 0; i < lb.length; i++)
                {
                    sort(lb)
                }

                for(let i = 0; i < lb.length; i++)
                {
                    let row = lb[i].split(" ")     
                    tempName = discordMarkdownFix(row[0])
                    desc = desc + (i+1) + ". " + tempName + " " + row[1] + "\r\n"
                }

              const embed = new EmbedBuilder()
              .setColor(0x0099FF)
              .setTitle(`Average ColeWeight of ${guild}: ${Math.ceil((coleweightSum / lengthOfGuild) * 100) / 100}`)
              .setDescription(desc)
              .setFooter({ text: `Made by Ninjune#0670`})
              interaction.editReply({ embeds: [embed] })
            }
            catch(e) { "cwguild.js: " + console.log(e)}
        }
        else
        {
            badResponse(interaction, "Only Owners and Admins have permission to use this command")
        }
    }
}