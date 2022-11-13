/*
Updated on 11/7/22 by Ninjune
- Fixed underscore checker.
Written on 10/?/22 by Ninjune
*/
const { EmbedBuilder } = require("discord.js");
const fs = require('node:fs');
const coleweightFunctions = require("../../contracts/coleweightFunctions")

module.exports = {
    name: 'coleweightlb',
    description: 'Coleweight Leaderboard',
    options: [{
      name: 'page',
      description: 'Page #',
      type: 3,
      required: false
    }],

    execute: async (interaction, client) => {
        let desc = ""
        var page = interaction.options.getString("page")
        

        lb = coleweightFunctions.getLeaderboard("./csvs/coleweightlb.csv")
        
        if(page == undefined) { page = 1 }

        if(lb[page*20-20] == undefined) 
        {
            desc = "That is not a valid page! Current max page is: " + Math.ceil(lb.length/20)
        }
        else {
            for(let i = (page*20)-20; i < page*20; i++) 
            {
                if(lb[i] != undefined) 
                {
                    for(let j = 0; j < lb[i].name.length; j++)
                    {
                        if(lb[i].name[j] == "_")
                        {
                            lb[i].name = lb[i].name.slice(0, j) + "\\" + lb[i].name.slice(j)
                            j++
                        }
                    }
                    desc = desc + (i+1) + "." + " " + lb[i].name + " " + lb[i].coleweight + "\r\n"
                }
            }
        }
   
        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("ColeWeight leaderboard")
        .setDescription(`${desc}`)
        .setFooter({ text: `Made by Ninjune#0670`})
        interaction.followUp({ embeds: [embed] })
    },
};
