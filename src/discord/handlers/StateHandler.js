const config = require('../../../config.json')
const Logger = require('../../Logger')

class StateHandler {
  constructor(discord) {
    this.discord = discord
  }

  async onReady() {
    Logger.discordMessage('Client ready, logged in as ' + this.discord.client.user.tag)
    this.discord.client.user.setActivity('Calculating ColeWeight.', { type: 'WATCHING' })
    global.bridgeChat = config.discord.guildChatChannel
    global.uptime = new Date().getTime()
  }
}

module.exports = StateHandler
