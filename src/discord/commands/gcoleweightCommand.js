const config = require('../../../config.json')
const { EmbedBuilder } = require("discord.js");
const axios = require('axios');
const fs = require('node:fs');
const coleweightFunctions = require("../../contracts/coleweightFunctions")

module.exports = {
  name: 'gcoleweight',
  description: 'Updates the coleweight leaderboard CSV with the members of the guild.',
  options: [{
    name: 'guild',
    description: 'Hypixel Guild',
    type: 3,
    required: true
  }],

  execute: async (interaction, client) => {
    //if ((await interaction.guild.members.fetch(interaction.user)).roles.cache.has(config.discord.commandRole)) {
      try 
      {
        const guild = interaction.options.getString("guild")
        const guildData = (await axios.get(`${config.api.hypixelAPI}/guild?key=${config.api.hypixelAPIkey}&name=${guild}`)).data
        
        var lengthOfGuild = guildData.guild.members.length,
          max = 0
        for( let i=0; i < lengthOfGuild; i+=1 ) 
        {

          var member = guildData.guild.members[i].uuid
          var data = await coleweightFunctions.getColeweight(member)

          if(data.coleweight > max) { max = data.coleweight}
          if(i == 0)
          {
          var embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Adding ${guild} data to lb!`)
            .setDescription(`**${i}/${lengthOfGuild}**`)
            .setFooter({ text: `Command by Ninjune#0670 | /help [command] for more information`})
          var msg = await interaction.channel.send({ embeds: [embed] })
          }
          else if(i == Math.ceil(lengthOfGuild*0.25) || i == Math.ceil(lengthOfGuild*0.5) 
            || i == Math.ceil(lengthOfGuild*0.75) || i == lengthOfGuild - 1)
          {
            var embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Adding ${guild} data to lb!`)
            .setDescription(`**${i+1}/${lengthOfGuild}** Highest Coleweight found: ${max}`)
            .setFooter({ text: `Command by Ninjune#0670 | /help [command] for more information`})
            msg.edit({ embeds: [embed] })
          }
        }
        console.log("Finished " + guild)
      }
      catch 
      {
        interaction.followUp("API key throttle!")
        console.log("API key throttle!")
      }
    /*}
    else
    {
      interaction.followUp("No perm.")
    }*/
  },
};
