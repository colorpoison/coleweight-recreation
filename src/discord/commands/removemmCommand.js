const { EmbedBuilder } = require("discord.js")
const maliciousMiners = require("../../contracts/MMinersFunctions")
const fs = require("node:fs")
const { badResponse } = require("../../contracts/commandResponses")
const { getMojangData } = require("../../contracts/api")
const { logToFile } = require("../../contracts/log")

module.exports = {
    name: "removemm",
    description: "Removes a MMiner (malicious miner) from the database.",
    options: [
        {
            name: "name",
            description: "Minecraft Username",
            type: 3,
            required: true
        }
    ],

    execute: async (interaction, client) => {
        let username = interaction.options.getString("name"),
         permUsersRows = fs.readFileSync("./csvs/mminerUsers.csv", "utf8").split("\r\n"),
         discordData = await interaction.guild.members.fetch(interaction.user),
         discordID = discordData.user.id,
         mojangData

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
        if(mojangData.error || uuid == undefined || username == undefined)
            return badResponse(interaction, `'${username}' is not a player! (${error})`)

        if(permUsersRows.includes(discordID))
        {
            result = maliciousMiners.removeMM(uuid)
            if(result == 0)
            {
                logToFile(`${username} removed as griefer. ${discordData.user.id}`)
                const embed = new EmbedBuilder()
                .setColor(0x999900)
                .setTitle("Malicious Miner")
                .setDescription(`${username} removed from the database.`)
                .setFooter({ text: "Made by Ninjune#0670"})
                interaction.followUp({ embeds: [embed] })
            }
            else
            {
                const embed = new EmbedBuilder()
                .setColor(0x990000)
                .setTitle("Malicious Miner")
                .setDescription(`${username} was not on the database!`)
                .setFooter({ text: "Made by Ninjune#0670"})
                interaction.followUp({ embeds: [embed] })
            }
        }
        else
        {
            const embed = new EmbedBuilder()
            .setColor(0x990000)
            .setTitle("Error")
            .setDescription("No permission.")
            .setFooter({ text: "Made by Ninjune#0670"})
            interaction.followUp({ embeds: [embed] })
        }
    },
}
