const { EmbedBuilder } = require("discord.js")
const config = require("../../../config.json")
const axios = require('axios')
const fs = require('node:fs')
const { getMojangData } = require("../../contracts/coleweightFunctions")
const { badResponse } = require("../../contracts/commandResponses")

module.exports = {
    name: 'link',
    description: 'Sets inputted name to default for /coleweight.',
    options: [
    {
        name: 'name',
        description: 'Minecraft Username',
        type: 3,
        required: true
    }
    ],

    execute: async (interaction, client) => {
        try {
            let name = interaction.options.getString("name"),
             mojangData = "",
             userData = "",
             user = "",
             discRows = fs.readFileSync("./csvs/discord.csv", "utf-8").split('\r\n'),
             discordPath = "./csvs/discord.csv",
             userID,
             writeData
            
            try 
            {
                let discordData = await interaction.guild.members.fetch(interaction.user)
                user = discordData.user.username + "#" + discordData.user.discriminator
                userID = discordData.user.id
            }
            catch 
            {
                console.log("Error! " + e)
            }


            mojangData = await getMojangData(name)
            name = mojangData.username
            uuid = mojangData.uuid
            if(mojangData == 101)
            {
                badResponse(interaction, `The bot may be rate limited on Mojang API (or name is wrong.)`)
                return
            }
            try 
            {
                userData = (await axios.get(`https://api.hypixel.net/player?key=${config.api.hypixelAPIkey}&uuid=${uuid}`)).data
            }
            catch(e) 
            {
                badResponse(interaction, `DM Nin (linkCommand ${new Error().lineNumber}): ${e}`)
                return
            }

            if(userData.player.socialMedia.links.DISCORD == user)
            {
                for(let i = 0; i < discRows.length; i++)
                {
                    let row = discRows[i].split(" ")

                    if(row[0] == userID || row[0] == undefined || row[0] == "")
                        discRows.splice(i, 1)
                }

                discRows.push(userID + " " + name)
                writeData = discRows.join("\r\n")
                fs.writeFileSync(discordPath, writeData)

                const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Success!`)
                .setDescription(`Successfully linked ${user} to ${name}!`)
                .setFooter({ text: `Made by Ninjune#0670`})
                interaction.followUp({ embeds: [embed] })
            }
            else 
                badResponse(interaction, `${name} is not linked to ${user} in Hypixel!`)
        } catch(e) 
        {
            console.log(e)
            badResponse(interaction, `Enter a valid name! (or change your nickname to minecraft ign)`)
        }
    }
}