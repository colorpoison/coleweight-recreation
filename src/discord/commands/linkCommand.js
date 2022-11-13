const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");
const axios = require('axios');
const fs = require('node:fs');
const e = require("express");

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
             discordPath = "./csvs/discord.csv",
             discRows = (fs.readFileSync("./csvs/discord.csv").toString()).split('\r\n')
             notLinked = true
            try 
            {
                let discordData = await interaction.guild.members.fetch(interaction.user)
                user = discordData.user.username + "#" + discordData.user.discriminator
            }
            catch 
            {
                console.log("Error! " + e)
            }
            for(let i = 0; i < discRows.length - 1; i++)
            {
                let row = discRows[i].split(" ")

                if(row[0] == user)
                {
                    name = row[1]
                    notLinked = false;
                }
            }
            if(notLinked)
            {
                try 
                {
                    mojangData = (await axios.get(`https://api.ashcon.app/mojang/v2/user/${name}`)).data
                    name = mojangData.username
                    uuid = mojangData.uuid
                }
                catch(e) 
                {
                    console.log("Error! " + e)
                }
                try 
                {
                    userData = (await axios.get(`https://api.hypixel.net/player?key=${config.api.hypixelAPIkey}&uuid=${uuid}`)).data
                }
                catch(e) 
                {
                    console.log("Error! " + e)
                }
            }

            if(notLinked && userData.player.socialMedia.links.DISCORD == user)
            {
                writeData = fs.readFileSync(discordPath, "utf8")
                writeData = writeData + user + " " + name + "\r\n"
                fs.writeFileSync(discordPath, writeData)

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Success!`)
                    .setDescription(`Successfully linked ${user} to ${name}!`)
                    .setFooter({ text: `Made by Ninjune#0670`})
                interaction.followUp({ embeds: [embed] })
            }
            else if(notLinked == false)
            {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Error!`)
                    .setDescription(`${user} is already linked to ${name}!`)
                    .setFooter({ text: `Made by Ninjune#0670`})
                interaction.followUp({ embeds: [embed] })
            }
            else 
            {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Error!`)
                    .setDescription(`${user} is not linked to ${name} in Hypixel!`)
                    .setFooter({ text: `Made by Ninjune#0670`})
                interaction.followUp({ embeds: [embed] })
            }
        } catch(e) 
        {
            console.log(e)
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Error`)
                .setDescription(`Enter a valid name! (or change your nickname to minecraft ign)`)
                .setFooter({ text: `Made by Ninjune#0670`})
            interaction.followUp({ embeds: [embed] })
        }
    }
}