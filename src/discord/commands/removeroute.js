const { EmbedBuilder } = require("discord.js")
const fs = require("node:fs")
const { badResponse } = require("../../contracts/commandResponses")
const { updateRoutes } = require("../../web/express")

module.exports = {
    name: "removeroute",
    description: "(Requires permission) removes a route from the route database",
    options: [
        {
            name: "name",
            description: "Name of the route.",
            type: 3,
            required: true
        }
    ],

    execute: async (interaction, client) => {
        const permUsersRows = fs.readFileSync("./csvs/mminerUsers.csv", "utf8").split("\r\n")
        const nameOfRoute = interaction.options.getString("name")

        if(permUsersRows.includes(interaction.user.id))
        {
            let data = JSON.parse(fs.readFileSync("./csvs/routeDB.csv"))
            let index = data.findIndex(route => route.name == nameOfRoute)
            if(index == -1)
                return await badResponse(interaction, "Route doesn't exist.")
            data.splice(index, 1)
            fs.writeFileSync("./csvs/routeDB.csv", JSON.stringify(data))
            updateRoutes()

            const embed = new EmbedBuilder()
            .setColor(0x999900)
            .setTitle("Removed route!")
            .setDescription("Route was removed from database!")
            .setFooter({ text: "Made by Ninjune#0670"})
            interaction.followUp({ embeds: [embed] })
        }
        else
            await badResponse(interaction, "No permission. :nerd:")
    }
}
