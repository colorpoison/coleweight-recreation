const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const config = require("../../../config.json")
const { isStaff } = require("../../contracts/util")
const { logToFile } = require("../../contracts/log")

module.exports = {
  name: "cwbutton",
  description: "(ADMIN) Makes a button to find Coleweight of anyone who clicks it.",
  options: [
    {
        name: "color",
        description: "Hex color. Should be like '00ff00' ",
        type: 3,
        required: false
    }
],

  execute: async (interaction, client) => {
    const hexColor = interaction.options.getString("color")

    if (isStaff(await interaction.guild.members.fetch(interaction.user))) {
        try {
            const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
                .setCustomId("cwButton")
                .setLabel("Calculate Coleweight")
                .setStyle(ButtonStyle.Primary),
			)
            const buttonEmbed = new EmbedBuilder()
                .setColor(hexColor ?? "00fff9")
                .setTitle("Coleweight Button")
                .setDescription("Press below to calculate your coleweight!")
                .setFooter({ text: "Made by Ninjune#0670"})
            interaction.followUp({ embeds: [buttonEmbed], components: [row] })

        } catch(e)
        {
            logToFile(e)
            const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("Error")
            .setDescription(e)
            .setFooter({ text: "Made by Ninjune#0670"})
            interaction.followUp({ embeds: [embed] })
        }
    }
    else
    {
        const embed = new EmbedBuilder()
                .setColor(0x990000)
                .setTitle("Error")
                .setDescription("Only Owners and Admins have permission to use this command")
                .setFooter({ text: "Made by Ninjune#0670"})
            interaction.followUp({ embeds: [embed] })
    }
}
}