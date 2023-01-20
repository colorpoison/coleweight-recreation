const { EmbedBuilder } = require("discord.js")
const maliciousMiners = require("../../contracts/MMinersFunctions")
const fs = require("node:fs")
const { badResponse } = require("../../contracts/commandResponses")
const { getMojangData } = require("../../contracts/coleweightFunctions")

module.exports = {
    name: 'removemm',
    description: 'Removes a MMiner (malicious miner) from the database.',
    options: [
        {
            name: 'name',
            description: 'Minecraft Username',
            type: 3,
            required: true
        }
    ],
    
    execute: async (interaction, client) => {
        let username = interaction.options.getString("name"),
         permUsersRows = fs.readFileSync("./csvs/mminerUsers.csv", "utf8"),
         discordData = await interaction.guild.members.fetch(interaction.user),
         discordID = discordData.user.id
        
        try 
        {
            mojangData = await getMojangData(username)
        } catch (error)
        { 
            await badResponse(interaction, `'${username}' is not a player! (${error})`)
            return 
        }
        let uuid = mojangData.uuid
        username = mojangData.username

        if(permUsersRows.indexOf(discordID) != -1)
        {
            result = maliciousMiners.removeMM(uuid)
            if(result == 0)
            {
                const embed = new EmbedBuilder()
                .setColor(0x999900)
                .setTitle("Malicious Miner")
                .setDescription(`${username} removed from the database.`)
                .setFooter({ text: `Made by Ninjune#0670`})
                interaction.followUp({ embeds: [embed] })
            }
            else
            {
                const embed = new EmbedBuilder()
                .setColor(0x990000)
                .setTitle("Malicious Miner")
                .setDescription(`${username} was not on the database!`)
                .setFooter({ text: `Made by Ninjune#0670`})
                interaction.followUp({ embeds: [embed] })
            }
        }
            
        else
        {
            const embed = new EmbedBuilder()
            .setColor(0x990000)
            .setTitle(`Error`)
            .setDescription("Only people on a certain list have permission to use this command.")
            .setFooter({ text: `Made by Ninjune#0670`})
            interaction.reply({ embeds: [embed] })
        }
    },
}
