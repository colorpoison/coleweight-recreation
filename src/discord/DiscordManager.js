const { Client, Collection, AttachmentBuilder, GatewayIntentBits } = require('discord.js')
const MessageHandler = require('./handlers/MessageHandler')
const StateHandler = require('./handlers/StateHandler')
const CommandHandler = require('./CommandHandler')
const config = require('../../config.json')
const Logger = require('.././Logger')
const path = require('node:path')
const fs = require('fs')

class DiscordManager {
  constructor(app) {

    this.app = app

    this.stateHandler = new StateHandler(this)
    this.messageHandler = new MessageHandler(this)
    this.commandHandler = new CommandHandler(this)
  }

  async connect() {
    global.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
    this.client = client
    this.client.on('ready', () => this.stateHandler.onReady())
    this.client.on('messageCreate', message => this.messageHandler.onMessage(message))
    
    this.client.login(config.discord.token).catch(error => {Logger.errorMessage(error)})


    client.commands = new Collection()
    const commandFiles = fs.readdirSync('src/discord/commands').filter(file => file.endsWith('.js'))
    
    for (const file of commandFiles) {
      const command = require(`./commands/${file}`)
      client.commands.set(command.name, command)
    }

    const eventsPath = path.join(__dirname, 'events')
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file)
      const event = require(filePath)
      if (event.once) {client.once(event.name, (...args) => event.execute(...args))} 
      else {client.on(event.name, (...args) => event.execute(...args))} 
    }

    global.guild = await client.guilds.fetch(config.discord.serverID)

    process.on('SIGINT', () => this.stateHandler.onClose())
  }
  
  async getWebhook(discord, type) {
    channel = await this.getChannel(type)
    let webhooks = await channel.fetchWebhooks()
    if (webhooks.first()) {
      return webhooks.first()
    } else {
      const response = await channel.createWebhook(discord.client.user.username, {avatar: discord.client.user.avatarURL()})
      return response
    }
  }

  async onBroadcastCleanEmbed({ message, color, channel }) {
    if (message.length < config.console.maxEventSize) Logger.broadcastMessage(message, 'Event')
    channel = await this.getChannel(channel)
    channel.send({
      embeds: [{
        color: color,
        description: message,
      }]
    })
  }

  async onBroadcastHeadedEmbed({ message, title, icon, color, channel }) {
    if (message) if (message.length < config.console.maxEventSize) Logger.broadcastMessage(message, 'Event')
    channel = await this.getChannel(channel)
    channel.send({
      embeds: [{
        color: color,
        author: {
          name: title,
          icon_url: icon,
        },
        description: message,
      }]
    })
  }
}

module.exports = DiscordManager
