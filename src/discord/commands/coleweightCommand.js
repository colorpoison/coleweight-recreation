const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require("discord.js")
const coleweightFunctions = require("../../contracts/coleweightFunctions")
const { cwResponse, badResponse } = require("../../contracts/commandResponses")
const { logToFile } = require("../../contracts/log")


module.exports = {
    name: "coleweight",
    description: "Returns the coleweight of the user.",
    options: [
        {
            name: "name",
            description: "Minecraft Username",
            type: 3,
            required: false
        },
        {
            name: "profile",
            description: "Minecraft Profile",
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

            if (data?.name == undefined)
            {
                if(data?.code)
                    await badResponse(interaction, data.error)
                else
                    await badName(interaction, name)
				return
            }
            for(let i = 0; i < data.profiles.length; i++)
            {
                profileSelectOptions.push({label: `${data.profiles[i]}`, value: `${data.profiles[i]}`})
            }
            const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                .setCustomId("profileSelect")
                .setPlaceholder("Choose Profile")
                .addOptions(profileSelectOptions)
            ),
            row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("advancedStatsButton")
                .setLabel("Advanced Stats")
                .setStyle(ButtonStyle.Primary),
            )

            cwResponse(interaction, data, "followUp", [row, row2])
        } catch(e)
        {
            const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("Error")
            .setDescription(`Enter a valid name! (or /link (username)) (if you think this is an error report this to Ninjune#0670: ${e})`)
            .setFooter({ text: "Made by Ninjune#0670"})
            interaction.followUp({ embeds: [embed] })
            logToFile(e.stack)
        }
    }
}

async function badName(interaction, name)
{
	const embed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle("Error")
	.setDescription(`'${name}' not a valid name! \n'/link (username)' to link disc acc and Hypixel (must be linked in Hypixel.)`)
	.setFooter({ text: "Made by Ninjune#0670"})
	await interaction.followUp({ embeds: [embed] })
	return
}