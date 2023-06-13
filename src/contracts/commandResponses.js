const { EmbedBuilder } = require("discord.js")


async function badResponse(interaction, message = "Unknown", ephemeral = false)
{
    const embed = new EmbedBuilder()
    .setColor(0x990000)
    .setTitle("Error")
    .setDescription(`${message}`)
    .setFooter({ text: "Made by Ninjune#0670"})
    interaction.followUp({ embeds: [embed], ephemeral: ephemeral })
}

async function cwResponse(interaction, data, type = "editReply", components = [])
{
    let username = data.name

    for(let i = 0; i < data.name.length; i++)
    {
        if(data.name[i] == "_")
            username = data.name.slice(0, i) + "\\" + data.name.slice(i)
    }

    const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`${username}'s ColeWeight: ${Math.round(data.coleweight*100)/100}`)
    .setDescription(`Leaderboard (on highest profile): **#${data.rank}** (**Top ${data.percentile}%**)\r\nProfile: *${data.profile}*`)
    .addFields(
        { name: "Experience", value: `${Math.round(data.experience.total*100)/100}`, inline: true},
        { name: "Powder", value: `${Math.round(data.powder.total*100)/100}`, inline: true},
        { name: "Collections", value: `${Math.round(data.collection.total*100)/100}`, inline: true},
        { name: "Miscellaneous", value: `${Math.round(data.miscellaneous.total*100)/100}`, inline: true},
    )
    .setFooter({ text: `/cwinfo for information on the calculations | Ping: ${data.ping ?? -1}ms`})
    switch(type)
    {
        case "editReply":
            await interaction.editReply({ embeds: [embed] })
            break
        case "followUp":
            await interaction.followUp({ embeds: [embed], components: components })
            break
        case "update":
            await interaction.update({ embeds: [embed] })
            break
    }

}

module.exports = { badResponse, cwResponse }