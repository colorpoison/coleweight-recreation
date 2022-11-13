const config = require('../../../config.json')
const { EmbedBuilder } = require("discord.js");
const axios = require('axios');
const fs = require('node:fs');
const coleweightFunctions = require("../../contracts/coleweightFunctions");
const { json } = require('express');

function sort(lb) 
{
    for( let i=0; i < lb.length; i += 1 ) 
    {
        if(lb[i] == undefined || lb[i] == "") { lb.splice(i, 1) }
        let row = lb[i].split(" "), previousRow = ["", Infinity], nextRow = ["", 0], lbTemp = lb[i]
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
    description: 'Updates the coleweight leaderboard CSV with the members of the guild.',
    options: [
        {
            name: 'guild',
            description: 'Hypixel Guild',
            type: 3,
            required: true
        }
    ],

    execute: async (interaction, client) => {
        user = await interaction.guild.members.fetch(interaction.user)
        if (user.roles.cache.has(config.discord.commandRole) || user.roles.cache.has("1010967755031314432") || user.roles.cache.has("1022928933299167332")) {
            try 
            {
                const guild = interaction.options.getString("guild")
                const guildData = (await axios.get(`${config.api.hypixelAPI}/guild?key=${config.api.hypixelAPIkey}&name=${guild}`)).data
                let lengthOfGuild = guildData.guild.members.length,
                  max = 0,
                  lb = [],
                  coleweightSum = 0
                  desc = ""
                
                for( let i=0; i < lengthOfGuild; i+=1 ) 
                {
                    var member = guildData.guild.members[i].uuid
                    var data = await coleweightFunctions.getColeweight(member)
                    if (data == undefined) continue
                    lb.push(data.name + " " + data.coleweight)
                    coleweightSum += data.coleweight

                    if(data.coleweight > max) { max = data.coleweight}
                    if(i == 0)
                    {
                        const embed = new EmbedBuilder()
                        .setColor(0x009900)
                        .setTitle(`(${i+1}/${lengthOfGuild}) Checked ColeWeight for ${data.name}`)
                        var msg = await interaction.channel.send({ embeds: [embed] })
                    }
                    else
                    {
                        const embed = new EmbedBuilder()
                        .setColor(0x009900)
                        .setTitle(`(${i+1}/${lengthOfGuild}) Checked ColeWeight for ${data.name}`)
                        await msg.edit({ embeds: [embed] })
                    }
                }
              
                for(let i = 0; i < lengthOfGuild; i++)
                {
                    sort(lb)
                }

                for(let i = 0; i < lengthOfGuild; i++) 
                {
                    if(lb[i] != undefined) 
                    {
                        let row = lb[i].split(" ")
                        
                        for(let j = 0; j < row[0].length; j++)
                        {
                            if(row[0][j] == "_")
                            {
                                row[0] = row[0].slice(0, j) + "\\" + row[0].slice(j)
                                j++
                            }
                        }
                        
                        desc = desc + (i+1) + ". " + row[0] + " " + row[1] + "\r\n"
                    }
                }

              const embed = new EmbedBuilder()
              .setColor(0x0099FF)
              .setTitle(`Average ColeWeight of ${guild}: ${Math.ceil((coleweightSum / lengthOfGuild) * 100) / 100}`)
              .setDescription(desc)
              .setFooter({ text: `Made by Ninjune#0670`})
              await msg.edit({ embeds: [embed] })
            }
            catch(e) {console.log(e)}
        }
        else
        {
            const embed = new EmbedBuilder()
            .setColor(0x990000)
            .setTitle(`Error`)
            .setDescription("Only Owners and Admins have permission to use this command")
            .setFooter({ text: `Made by Ninjune#0670`})
            interaction.followUp({ embeds: [embed] })
        }
    },
}