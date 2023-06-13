const { EmbedBuilder } = require("discord.js")
const fs = require("node:fs")
const coleweightFunctions = require("../../contracts/coleweightFunctions")

module.exports = {
    name: "coleweightlb",
    description: "Coleweight Leaderboard",
    options: [{
      name: "page",
      description: "Page #",
      type: 3,
      required: false
    }],

    execute: async (interaction, client) => {
        let desc = ""
        let page = interaction.options.getString("page")
        let rows = fs.readFileSync("./csvs/coleweightlb.csv", "utf8").split("\r\n") // get rows to check length for max page
        if(page != undefined && (page > Math.ceil(rows.length/20) || page < 1)) desc = "That is not a valid page! Current max page is: " + Math.ceil(rows.length/20)
        if(page != undefined) page--
        let lb = coleweightFunctions.getLeaderboard("./csvs/coleweightlb.csv", 20, ((page ?? 0)*20)+1)


        if(desc == "") // if page > max page
        {
            for(let i = 0; i < 20; i++)
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
                    desc = desc + lb[i].rank + "." + " " + lb[i].name + " " + lb[i].coleweight + "\r\n"
                }
            }
        }

        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("ColeWeight leaderboard")
        .setDescription(`${desc}`)
        .setFooter({ text: "Made by Ninjune#0670"})
        interaction.followUp({ embeds: [embed] })
    },
}
