const { EmbedBuilder } = require("discord.js")

module.exports = {
    name: 'ping',
    description: 'Pong.',

    execute: async (interaction, client) => {
        const embed = new EmbedBuilder()
        .setColor(0x999900)
        .setTitle("Pong")
        .setDescription(`${Date.now() - interaction.createdTimestamp}ms (not accurate at all idk)`)
        interaction.editReply({ embeds: [embed] })
    },
}
