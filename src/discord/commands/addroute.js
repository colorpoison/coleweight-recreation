const { default: axios } = require("axios")
const { EmbedBuilder } = require("discord.js")
const fs = require("node:fs")
const { badResponse } = require("../../contracts/commandResponses")
const { updateRoutes } = require("../../web/express")

module.exports = {
    name: "addroute",
    description: "(Requires permission) adds a route to the route database",
    options: [
        {
            name: "name",
            description: "Name of the route (spaces will be changed to '_' so don't use them)",
            type: 3,
            required: true
        },
        {
            name: "route",
            description: "RAW pastebin link of route.",
            type: 3,
            required: true
        },
        {
            name: "description",
            description: "Description of the route",
            type: 3,
            required: true
        },
        {
            name: "format",
            description: "Format, either 'skytils' or 'soopy' (old skytils & non compressed soopy)",
            type: 3,
            required: true
        }
    ],

    execute: async (interaction, client) => {
        const permUsersRows = fs.readFileSync("./csvs/mminerUsers.csv", "utf8").split("\r\n")
        const nameOfRoute = interaction.options.getString("name")
        const pastebin = interaction.options.getString("route")
        const descOfRoute = interaction.options.getString("description")
        const format = interaction.options.getString("format")

        if(permUsersRows.includes(interaction.user.id))
        {
            routeToAdd = (await axios.get(pastebin)).data
            try
            {
                if(format == "skytils" && !routeToAdd.startsWith("eyJ"))
                    return await badResponse(interaction, "Not in old skytils route format.")
                else if(format == "soopy" && !JSON.stringify(routeToAdd.startsWith("[{")))
                    return await badResponse(interaction, "Not in uncompressed soopy route format.")
                else if (!(format == "soopy" || format == "skytils"))
                    return await badResponse(interaction, "Not a valid format.")
            }
            catch (e)
            {
                return await badResponse(interaction, "Error parsing route.")
            }

            let data = JSON.parse(fs.readFileSync("./csvs/routeDB.csv"))
            if(data.find(route => route.name == nameOfRoute))
                return await badResponse(interaction, "Cant add a route that already exists.")

            data.push({
                name: nameOfRoute.replaceAll(" ", "_"),
                description: descOfRoute,
                route: routeToAdd,
                format: format
            })
            fs.writeFileSync("./csvs/routeDB.csv", JSON.stringify(data))
            updateRoutes()

            const embed = new EmbedBuilder()
            .setColor(0x999900)
            .setTitle("Added route!")
            .setDescription("Route was added to database!")
            .setFooter({ text: "Made by Ninjune#0670"})
            interaction.followUp({ embeds: [embed] })
        }
        else
            await badResponse(interaction, "No permission. :nerd:")
    }
}
