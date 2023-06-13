const { EmbedBuilder } = require("discord.js")
const { addCommas } = require("../../contracts/helperFunctions")
const fs = require("node:fs")


module.exports = {
    name: "cwinfo",
    description: "Coleweight values.",

    execute: async (interaction, client) => {
        let cwinfo = JSON.parse(fs.readFileSync("./csvs/cwinfo.json", "utf8"))
        let values = {}

        const embed = new EmbedBuilder()
        .setColor(0x999900)
        .setTitle("ColeWeight Values")
        .setDescription("Each of the following are equivalent to one unit of ColeWeight")

        .setFooter({ text: "Formulated by Implodent and Rvval | Made by Ninjune#0670"})

        cwinfo.forEach((info, index) => {
            if(values[info.category] == undefined)
                values[info.category] = ""
            values[info.category] += `${addCommas(info.cost)} **${info.nameStringed}**\r\n`
        })

        Object.keys(values).forEach(key => {
            embed.addFields({name: key, value: values[key]})
        })

        interaction.followUp({ embeds: [embed] })
    },
}
