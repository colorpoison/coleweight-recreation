const { EmbedBuilder } = require("discord.js");
const coleweightFunctions = require("../../contracts/coleweightFunctions")

module.exports = {
  name: 'coleweight',
  description: 'Returns the coleweight of the user.',
  options: [
    {
        name: 'name',
        description: 'Minecraft Username',
        type: 3,
        required: false
    },
    {
        name: 'profile',
        description: 'Minecraft Profile',
        type: 3,
        required: false
    }
  ],

  execute: async (interaction, client) => {
    try {
        var discordUserData = await interaction.guild.members.fetch(interaction.user)
        var profile = interaction.options.getString("profile")
        var name = interaction.options.getString("name")
        if( name == undefined ) { name = discordUserData.nickname }
        var data = await coleweightFunctions.getColeweight(name, profile)

        if(data.coleweight == undefined) 
        {
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Error`)
                .setDescription(`Enter a valid name! (or change your nickname to minecraft ign)`)
                .setFooter({ text: `Command by Ninjune#0670 | /help [command] for more information`})
            interaction.followUp({ embeds: [embed] })
        }
        else 
        {
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`${data.name}'s ColeWeight: ${data.coleweight}`)
                .setDescription(`Leaderboard: **#${data.rank}** (**Top ${data.percentile}%**)\r\nProfile: *${data.profileData['cute_name']}*`)
                .addFields(
                    { name: 'Experience', value: `${data.exp}`, inline: true},
                    { name: 'Powder', value: `${data.pow}`, inline: true},
                    { name: 'Collections', value: `${data.col}`, inline: true},
                    { name: 'Miscellaneous', value: `${data.bes+data.nuc}`, inline: true},
                ) 
                .setFooter({ text: `Command by Ninjune#0670 | /help [command] for more information`})
            interaction.followUp({ embeds: [embed] })
        }
    } catch(e) 
    {
        console.log(e)
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Error`)
            .setDescription(`Enter a valid name! (or change your nickname to minecraft ign)`)
            .setFooter({ text: `Command by Ninjune#0670 | /help [command] for more information`})
        interaction.followUp({ embeds: [embed] })
    }
    
}
}