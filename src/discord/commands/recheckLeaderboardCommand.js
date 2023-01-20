const { EmbedBuilder } = require("discord.js")
const coleweightFunctions = require("../../contracts/coleweightFunctions")
const fs = require("node:fs")
const config = require('../../../config.json')

module.exports = {
    name: 'recheckleaderboard',
    description: `Do not use. (you won't have perm to anyway)`,

    execute: async (interaction, client) => {
        let discordData = await interaction.guild.members.fetch(interaction.user),
         discordUser = discordData.user.username + "#" + discordData.user.discriminator
        
        if(discordUser != config.discord.owner) {interaction.followUp("No access."); return}
		
        try 
        {
            let lbRows = fs.readFileSync("./csvs/coleweightlb.csv", "utf8").split("\r\n")

            const embed = new EmbedBuilder()
            .setColor(0x009900)
            .setTitle(`Working... Eta ${Math.ceil((lbRows.length*2)/60/60)}h`)
            await interaction.followUp({ embeds: [embed] })
            
            for(let i = 0; i < lbRows.length; i++)
            {
                let row = lbRows[i].split(" ")
                
                try 
				{
					coleweightFunctions.getColeweight(row[0])
				} catch {}
            }
        } catch(e)
        { 
            console.log("Error with rechecking lb: " + e) 
        }
    }
}