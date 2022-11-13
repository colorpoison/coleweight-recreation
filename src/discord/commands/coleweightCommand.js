/*
Updated by Ninjune on 11/4/22
- Added profile select menu.
Written by Ninjune on 10/?/22
*/
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require("discord.js");
const coleweightFunctions = require("../../contracts/coleweightFunctions")
const fs = require("node:fs")

module.exports = {
    name: 'coleweight',
    description: 'Returns the coleweight of the user.',
    options: [
        {
            name: 'name',
            description: 'Minecraft Username',
            type: 3,
            required: false
        },
        {
            name: 'profile',
            description: 'Minecraft Profile',
            type: 3,
            required: false
        }
    ],

    execute: async (interaction, client) => {
        try {
            let profile = interaction.options.getString("profile"),
             name = interaction.options.getString("name"),
             data = await coleweightFunctions.getColeweight(name, profile, interaction),
             profileSelectOptions = []
            
            for(let i = 0; i < data.profiles.length; i++)
            {
                profileSelectOptions.push({label: `${data.profiles[i]}`, value: `${data.profiles[i]}`})
            }

            if(data.coleweight == undefined) 
            {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Error`)
                    .setDescription(`Enter a valid name! (or /link (username))`)
                    .setFooter({ text: `Made by Ninjune#0670`})
                interaction.followUp({ embeds: [embed] })
            }
            else 
            {
                const row = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                    .setCustomId('profileSelect')
                    .setPlaceholder('Choose Profile')
                    .addOptions(profileSelectOptions)
                )
                const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('advancedStatsButton')
                    .setLabel('Advanced Stats')
                    .setStyle(ButtonStyle.Primary),
                )
                
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
                interaction.followUp({ embeds: [embed], components: [row, row2]  })
            }
        } catch(e)
        {
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Error`)
                .setDescription(`Enter a valid name! (or /link (username))`)
                .setFooter({ text: `Made by Ninjune#0670`})
            interaction.followUp({ embeds: [embed] })
        }
    }
}