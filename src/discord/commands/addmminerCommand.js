const { EmbedBuilder } = require("discord.js")
const maliciousMiners = require("../../contracts/MMinersFunctions")
const fs = require("node:fs")
const axios = require("axios")
const { getMojangData } = require("../../contracts/api")
const { badResponse } = require("../../contracts/commandResponses")
const { logToFile } = require("../../contracts/log")

module.exports = {
    name: "addmminer",
    description: "Adds a MMiner (malicious miner) on the database.",
    options: [
        {
            name: "name",
            description: "Minecraft Username",
            type: 3,
            required: true
        },
        {
            name: "type",
            description: "\"macroer\", \"griefer\", or \"scammer\"",
            type: 3,
            required: true
        },
        {
            name: "griefcount",
            description: "Amount of griefs (to add!)",
            type: 3,
            required: false
        },
        {
            name: "visible",
            description: "If set to false, the griefer will not be visible ingame but will still be on /findmminer.",
            type: 3,
            required: false
        },
        {
            name: "proof",
            description: "Proof",
            type: 3,
            required: false
        }
    ],

    execute: async (interaction, client) => {
        let name = interaction.options.getString("name"),
         type = interaction.options.getString("type"),
         proof = interaction.options.getString("proof") ?? "",
         griefcount = parseInt(interaction.options.getString("griefcount") ?? 1),
         visible = interaction.options.getString("visible") ?? true,
         discordData = await interaction.guild.members.fetch(interaction.user),
         discordID = discordData.user.id,
         permUsersRows = fs.readFileSync("./csvs/mminerUsers.csv", "utf8").split("\r\n"),
         mojangData = ""

        if(visible == "false")
            visible = false
        else if (visible == "true")
            visible = true

        if(griefcount != parseInt(griefcount))
        {
            await badResponse(interaction, `'${griefcount}' is not an integer!`)
        }

        try
        {
            mojangData = await getMojangData(name)
        } catch (error)
        {
            await badResponse(interaction, `'${name}' is not a player! (${error})`)
            return
        }

        let username = mojangData.username,
         uuid = mojangData.uuid

        if(username == undefined)
        {
            await badResponse(interaction, "idk, ~line 65 addMMinerCommand")
            return
        }

        if(permUsersRows.includes(discordID))
        {
            let res = maliciousMiners.addMM(uuid, type, discordID, griefcount, visible, proof)

            if(res == -1)
            {
                badResponse(interaction, "incorrect role added")
                return
            }
            logToFile(`${username} added as griefer. ${discordID}`)
            const embed = new EmbedBuilder()
            .setColor(0x999900)
            .setTitle("Malicious Miners")
            .setDescription(`${username} as a ${type} now has ${res} offenses!`)
            .setFooter({ text: "Made by Ninjune#0670"})
            interaction.followUp({ embeds: [embed] })
        }
        else
        {
            await badResponse(interaction, "You do not have permission!", true)
        }
    },
}
