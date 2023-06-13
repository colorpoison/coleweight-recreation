const coleweightFunctions = require("../../contracts/coleweightFunctions")
const { EmbedBuilder } = require("discord.js")
const fs = require("node:fs")
const { cwResponse } = require("../../contracts/commandResponses")
const { logToFile } = require("../../contracts/log")

module.exports = {
	name: "interactionCreate",
	async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            await interaction.deferReply({ ephemeral: false }).catch(() => { })

            const command = interaction.client.commands.get(interaction.commandName)
            if (!command) return

            try {
                await command.execute(interaction, interaction.client)
            } catch (error) {
                logToFile(error)
                await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
            }
        }
        else if (interaction.isButton())
        {
            if(interaction.customId == "cwButton")
            {
                interaction.deferReply({ ephemeral: true })
                let data = await coleweightFunctions.getColeweight(undefined, undefined, interaction)

                if(data.coleweight == undefined)
                {
                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("Error")
                    .setDescription("Enter a valid name! (or /link (username))")
                    .setFooter({ text: "Made by Ninjune#0670"})
                    await interaction.editReply({ embeds: [embed], ephemeral: true })
                }
                else
                {
                    await cwResponse(interaction, data)
                }
            }
            else if(interaction.customId == "advancedStatsButton")
            {
                let embedTitle = interaction.message.embeds[0].data.title.replaceAll("\\", ""),
                 username = embedTitle.substring(0, embedTitle.indexOf("'")),
                 embedProfile = interaction.message.embeds[0].data.description,
                 profile = embedProfile.substring(embedProfile.indexOf("*", embedProfile.indexOf("\r\n")) + 1, embedProfile.length - 1),
                 data = await coleweightFunctions.getColeweight(username, profile, interaction)

                if(data.coleweight == undefined)
                {
                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("Error")
                    .setDescription("Enter a valid name! (or /link (username))")
                    .setFooter({ text: "Made by Ninjune#0670"})
                    interaction.reply({ embeds: [embed], ephemeral: true })
                }
                else
                {
                    let values = {"experience" : "", "powder": "", "collection": "", "miscellaneous": ""},
                     cwinfo = JSON.parse(fs.readFileSync("./csvs/cwinfo.json", "utf8"))

                    cwinfo.forEach((info, index) => {
                        values[info.category] += `${info.nameStringed} **${data[info.category][info.nameStringed]}**\r\n`
                    })

                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`${data.name}'s ColeWeight: ${data.coleweight}`)
                    .setDescription(`Leaderboard: **#${data.rank}** (**Top ${data.percentile}%**)\r\nProfile: *${data.profile}*`)
                    .addFields(
                        { name: "Experience", value: values["experience"]},
                        { name: "Powder", value: values["powder"]},
                        { name: "Collections", value: values["collection"]},
                        { name: "Miscellaneous", value: values["miscellaneous"]},
                    )
                    .setFooter({ text: "/cwinfo for information on the calculations | Made by Ninjune#0670"})
                    interaction.update({ embeds: [embed] })
                }
            }

        }
        else if(interaction.isSelectMenu())
        {
            if(interaction.customId == "profileSelect")
            {
                let embedTitle = interaction.message.embeds[0].data.title.replaceAll(/\\/g, ""),
                 username = embedTitle.substring(0, embedTitle.indexOf("'")),
                 profile = interaction.values[0],
                 data = await coleweightFunctions.getColeweight(username, profile, interaction)

                if(data.coleweight == undefined)
                {
                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("Error")
                    .setDescription("Enter a valid name! (or /link (username))")
                    .setFooter({ text: "Made by Ninjune#0670"})
                    interaction.reply({ embeds: [embed], ephemeral: true })
                }
                else
                {
                    cwResponse(interaction, data, "update")
                }
            }
        }
    }
}