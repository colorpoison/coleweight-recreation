const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'cwinfo',
    description: 'Coleweight values.',

    execute: async (interaction, client) => {
        const embed = new EmbedBuilder()
        .setColor(0x999900)
        .setTitle("ColeWeight Values")
        .setDescription(`Each of the following are equivalent to one unit of ColeWeight`)
        .addFields(
            { name: 'Experience', value: `1,000,000 mining xp\r\n`},
            { name: 'Powder', value: `60,000 mithril powder\r\n60,000 gemstone powder\r\n`},
            { name: 'Collections', value: `500,000 mithril\r\n1,400,000 gemstone\r\n500,000 gold\r\n45,000 netherrack\r\n1,000,000 diamond\r\n1,000,000 ice\r\n2,000,000 redstone\r\n4,000,000 lapis\r\n9,999,999,999 sulphur\r\n500,000 coal\r\n400,000 emerald\r\n400,000 endstone\r\n1,000,000 glowstone\r\n333,333 gravel\r\n1,000,000 iron\r\n50,000 mycelium\r\n400,000 quartz\r\n200,000 obsidian\r\n50,000 red sand\r\n500,000 sand\r\n1,000,000 cobblestone\r\n200,000 hardstone\r\n`},
            { name: 'Miscellaneous', value: `2.5 scatha kills\r\n10 worm kills\r\n1 nucleus runs\r\n`},
        )
        .setFooter({ text: `Formulated by Implodent and Rvval | Made by Ninjune#0670`})
        interaction.followUp({ embeds: [embed] })
    },
};
