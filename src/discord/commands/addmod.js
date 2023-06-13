const { EmbedBuilder } = require("discord.js")
const fs = require("node:fs")
const { badResponse } = require("../../contracts/commandResponses")

module.exports = {
    name: "addmod",
    description: "(Requires permission) adds a user to the list of people that can use /addmminer",
    options: [
        {
            name: "id",
            description: "discord id, dont type wrong data or something will break ",
            type: 3,
            required: true
        }
    ],

    execute: async (interaction, client) => {
        const permUsersRows = fs.readFileSync("./csvs/mminerUsers.csv", "utf8").split("\r\n")
        const discIDToAdd = interaction.options.getString("id")

        if(permUsersRows.includes(interaction.user.id))
        {
            fs.appendFileSync("./csvs/mminerUsers.csv", "\r\n" + discIDToAdd)

            const embed = new EmbedBuilder()
            .setColor(0x999900)
            .setTitle("Added mod!")
            .setDescription(`${discIDToAdd} is now a mod!`)
            .setFooter({ text: "Made by Ninjune#0670"})
            interaction.followUp({ embeds: [embed] })
        }
        else
            badResponse(interaction, "No permission. :nerd:")
    }
}
