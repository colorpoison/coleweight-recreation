const { EmbedBuilder } = require("discord.js");
const maliciousMiners = require("../../contracts/MMinersFunctions")
const fs = require("node:fs")
const axios = require("axios")

module.exports = {
    name: 'addmminer',
    description: 'Adds a MMiner (malicious miner) on the database.',
    options: [
        {
            name: 'name',
            description: 'Minecraft Username',
            type: 3,
            required: true
        },
        {
            name: 'type',
            description: '"macroer" or "griefer"',
            type: 3,
            required: true
        }
    ],
    
    execute: async (interaction, client) => {
        let name = interaction.options.getString("name"),
         type = interaction.options.getString("type"),
         discordData = await interaction.guild.members.fetch(interaction.user),
         discordUser = discordData.user.username + "#" + discordData.user.discriminator,
         permUsersRows = fs.readFileSync("./csvs/mminerUsers.csv", "utf8"),
         mojangData = "",
         username = ""
        
        try 
        {
            mojangData = (await axios.get(`https://api.ashcon.app/mojang/v2/user/${name}`)).data
        } catch 
        { 
            const embed = new EmbedBuilder()
            .setColor(0x990000)
            .setTitle("Malicious Miners")
            .setDescription(`Error! '${name}' is not a player!`)
            .setFooter({ text: `Made by Ninjune#0670`})
            interaction.followUp({ embeds: [embed] })
            return 
        }

        username = mojangData.username
        if(permUsersRows.indexOf(discordUser) != -1)
        {
            res = maliciousMiners.addMM(username, type, discordUser)
            if(res == 0)
            {
                const embed = new EmbedBuilder()
                .setColor(0x999900)
                .setTitle("Malicious Miners")
                .setDescription(`Successfully added ${username} as a ${type} to the database!`)
                .setFooter({ text: `Made by Ninjune#0670`})
                interaction.followUp({ embeds: [embed] })
            }
            else
            {
                const embed = new EmbedBuilder()
                .setColor(0x990000)
                .setTitle("Malicious Miners")
                .setDescription(`Error! ${username} is already on the database! (or type was wrong)`)
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
            interaction.followUp({ embeds: [embed] })
        }
    },
};
