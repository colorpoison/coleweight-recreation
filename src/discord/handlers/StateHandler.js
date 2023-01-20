// Written by DuckySoLucky or Senither on ?/?/??
const config = require('../../../config.json')

class StateHandler {
    constructor(discord) {
        this.discord = discord
    }

    async onReady() {
        console.log('Client ready, logged in as ' + this.discord.client.user.tag)
        this.discord.client.user.setActivity('Calculating ColeWeight.', { type: 'WATCHING' }) // doesn't work /shrug
        global.bridgeChat = config.discord.guildChatChannel
        global.uptime = new Date().getTime()
    }
}

module.exports = StateHandler
