const { EmbedBuilder } = require("discord.js")
const { getMojangData } = require("../../contracts/api")
const { badResponse } = require("../../contracts/commandResponses")
const maliciousMiners = require("../../contracts/MMinersFunctions")
const { isStaff } = require("../../contracts/util")

module.exports = {
    name: "findmminer",
    description: "Finds a MMiner (malicious miner) on the database.",
    options: [
        {
            name: "name",
            description: "Minecraft Username",
            type: 3,
            required: true
        }
    ],

    execute: async (interaction, client) => {
        const user = await interaction.guild.members.fetch(interaction.user)
        let username = interaction.options.getString("name"),
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
        let result = maliciousMiners.findMM(uuid, isStaff(user))

        if(result.found)
        {
            const userThatAddedGriefer = await client.users.fetch(result.discordUser, { cache: true })
            const tag = `${userThatAddedGriefer.username}#${userThatAddedGriefer.discriminator}`
            let dateObj = new Date(0)
            dateObj.setUTCMilliseconds(result.timestamp)

            const embed = new EmbedBuilder()
            .setColor(0x999900)
            .setTitle("Malicious Miner")
            .setDescription(`**${mojangData.username}** is a **${result.type}**. Their last offence was on ${dateObj.toString().slice(4, 15)}. (added by ${tag ?? result.discordUser})`)
            .setFooter({ text: "Made by Ninjune#0670"})

            if(isStaff(user))
                embed.setDescription(`**${mojangData.username}** has commited **${result.griefcount}** offenses as a **${result.type}**! (added by ${tag ?? result.discordUser} on ${dateObj.toString().slice(4, 15)})`)
            interaction.followUp({ embeds: [embed] })
        }
        else
        {
            const embed = new EmbedBuilder()
            .setColor(0x999900)
            .setTitle("Malicious Miner")
            .setDescription(`${username} is not a malicious miner.`)
            .setFooter({ text: "Made by Ninjune#0670"})
            interaction.followUp({ embeds: [embed] })
        }
    }
}