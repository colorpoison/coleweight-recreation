const { EmbedBuilder } = require("discord.js");
const maliciousMiners = require("../../contracts/MMinersFunctions")

module.exports = {
    name: 'findmminer',
    description: 'Finds a MMiner (malicious miner) on the database.',
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
         result = maliciousMiners.findMM(username)
        console.log(result.found)
        if(result.found)
        {
            const embed = new EmbedBuilder()
            .setColor(0x999900)
            .setTitle("Malicious Miner")
            .setDescription(`${result.name} is a ${result.type}! (added by ${result.discordUser})`)
            .addFields()
            .setFooter({ text: `Made by Ninjune#0670`})
            interaction.followUp({ embeds: [embed] })
        }
        else
        {
            const embed = new EmbedBuilder()
            .setColor(0x999900)
            .setTitle("Malicious Miner")
            .setDescription(`${username} is not a malicious miner.`)
            .addFields()
            .setFooter({ text: `Made by Ninjune#0670`})
            interaction.followUp({ embeds: [embed] })
        }
        
    },
};
