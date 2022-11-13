/*
Updated by Ninjune on 11/4/22
- Made it so it uses .update to update the message instead of replying.
- Added select menu reply.
- Added scanning for profile & name in the embed.

Updated by Ninjune on 10/?/22
- Added button interaction (yes my code is bad)

Written by DuckySoLucky or Senither on ?/?/??
*/
const Logger = require('../.././Logger')
const coleweightFunctions = require("../../contracts/coleweightFunctions")
const { EmbedBuilder } = require("discord.js")
const fs = require('node:fs')

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            await interaction.deferReply({ ephemeral: false }).catch(() => { });
            
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return

            try {
                Logger.discordMessage(`${interaction.user.username} - [${interaction.commandName}]`)
                await command.execute(interaction, interaction.client)
            } catch (error) {
                console.log(error)
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
            }
        }
        else if (interaction.isButton()) 
        {
            if(interaction.customId == 'cwButton') 
            {
                let data = await coleweightFunctions.getColeweight(undefined, undefined, interaction)
                
                if(data.coleweight == undefined) 
                {
                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Error`)
                    .setDescription(`Enter a valid name! (or /link (username))`)
                    .setFooter({ text: `Made by Ninjune#0670`})
                    interaction.reply({ embeds: [embed], ephemeral: true })
                }
                else 
                {
                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`${data.name}'s ColeWeight: ${data.coleweight}`)
                    .setDescription(`Leaderboard: **#${data.rank}** (**Top ${data.percentile}%**)\r\nProfile: *${data.profileData['cute_name']}*`)
                    .addFields(
                        { name: 'Experience', value: `${data.exp}`, inline: true},
                        { name: 'Powder', value: `${data.pow}`, inline: true},
                        { name: 'Collections', value: `${data.col}`, inline: true},
                        { name: 'Miscellaneous', value: `${data.bes+data.nuc}`, inline: true},
                    ) 
                    .setFooter({ text: `/cwinfo for information on the calculations | Made by Ninjune#0670`})
                    interaction.reply({ embeds: [embed], ephemeral: true })
                }
            }
            else if(interaction.customId == 'advancedStatsButton')
            {
                let embedTitle = interaction.message.embeds[0].data.title,
                 username = embedTitle.substring(0, embedTitle.indexOf("'")),
                 embedProfile = interaction.message.embeds[0].data.description,
                 profile = embedProfile.substring(embedProfile.indexOf('*', embedProfile.indexOf("\r\n")) + 1, embedProfile.length - 1),
                 data = await coleweightFunctions.getColeweight(username, profile, interaction)

                if(data.coleweight == undefined) 
                {
                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Error`)
                    .setDescription(`Enter a valid name! (or /link (username))`)
                    .setFooter({ text: `Made by Ninjune#0670`})
                    interaction.reply({ embeds: [embed], ephemeral: true })
                }
                else 
                {
                    let experienceValue = "",
                     powderValue = "",
                     collectionValue = "",
                     miscellaneousValue = "",
                     coleweightRows = fs.readFileSync("./csvs/coleweight.csv", "utf8").split("\r\n"),
                     row0 = coleweightRows[0].split(",")
                    
                    experienceValue = row0[0] + " **" + data.experience.experience_skill_mining + "**\r\n"
                    for(let i = 1; i < 3; i++)
                    {
                        let row = coleweightRows[i].split(",")

                        powderValue = powderValue + row[0] + " **" + data.powder[row[0]] + "**\r\n"
                    }
                    for(let i = 3; i < 25; i++)
                    {
                        let row = coleweightRows[i].split(",")

                        collectionValue = collectionValue + row[0] + " **" + data.collection[row[0]] + "**\r\n"
                    }
                    for(let i = 25; i < 28; i++)
                    {
                        let row = coleweightRows[i].split(",")

                        miscellaneousValue = miscellaneousValue + row[0] + " **" + data.miscellaneous[row[0]] + "**\r\n"
                    }

                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`${data.name}'s ColeWeight: ${data.coleweight}`)
                    .setDescription(`Leaderboard: **#${data.rank}** (**Top ${data.percentile}%**)\r\nProfile: *${data.profile}*`)
                    .addFields(
                        { name: 'Experience', value: `${experienceValue}`},
                        { name: 'Powder', value: `${powderValue}`},
                        { name: 'Collections', value: `${collectionValue}`},
                        { name: 'Miscellaneous', value: `${miscellaneousValue}`},
                    )
                    .setFooter({ text: `/cwinfo for information on the calculations | Made by Ninjune#0670`})
                    interaction.update({ embeds: [embed] })
                }
            }
            
        }
        else if(interaction.isSelectMenu())
        {
            if(interaction.customId == 'profileSelect') 
            {
                let embedTitle = interaction.message.embeds[0].data.title,
                 username = embedTitle.substring(0, embedTitle.indexOf("'")),
                 profile = interaction.values[0],
                 data = await coleweightFunctions.getColeweight(username, profile, interaction)
                
                if(data.coleweight == undefined) 
                {
                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Error`)
                    .setDescription(`Enter a valid name! (or /link (username))`)
                    .setFooter({ text: `Made by Ninjune#0670`})
                    interaction.reply({ embeds: [embed], ephemeral: true })
                }
                else 
                {
                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`${data.name}'s ColeWeight: ${data.coleweight}`)
                    .setDescription(`Leaderboard (on highest profile): **#${data.rank}** (**Top ${data.percentile}%**)\r\nProfile: *${data.profile}*`)
                    .addFields(
                        { name: 'Experience', value: `${data.exp}`, inline: true},
                        { name: 'Powder', value: `${data.pow}`, inline: true},
                        { name: 'Collections', value: `${data.col}`, inline: true},
                        { name: 'Miscellaneous', value: `${data.bes+data.nuc}`, inline: true},
                    ) 
                    .setFooter({ text: `/cwinfo for information on the calculations | Made by Ninjune#0670`})
                    interaction.update({ embeds: [embed]})
                }
            }
        }
    }
};