/*
Made by Ninjune on 11/6/22 (Do not use probably...)
*/
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require("discord.js");
const coleweightFunctions = require("../../contracts/coleweightFunctions")
const fs = require("node:fs")

module.exports = {
    name: 'recheckleaderboard',
    description: `Do not use. (you won't have perm to anyway)`,

    execute: async (interaction, client) => {
        let discordData = await interaction.guild.members.fetch(interaction.user),
         discordUser = discordData.user.username + "#" + discordData.user.discriminator
        
        if(discordUser != "Ninjune#0670") {interaction.reply("No access."); return}
		
        try 
        {
            let lbRows = fs.readFileSync("./csvs/coleweightlb.csv", "utf8").split("\r\n")

            for(let i = 0; i < lbRows.length; i++)
            {
                let row = lbRows[i].split(" "),
                 data = await coleweightFunctions.getColeweight(row[0])
                
                try 
				{
					if(i == 0)
					{
						const embed = new EmbedBuilder()
						.setColor(0x009900)
						.setTitle(`Working... Eta ${Math.ceil((lbRows.length*2)/60/60)}h`)
						await interaction.channel.send({ embeds: [embed] })
					}
				} catch {}
            }
        } catch(e)
        { 
            console.log("Error with rechecking lb: " + e) 
        }
    }
}