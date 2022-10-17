const { EmbedBuilder } = require("discord.js");
const fs = require('node:fs');

function sort(lb) 
{
  for( let i=0; i < lb.length; i += 1 ) 
  {
    if(lb[i] == undefined || lb[i] == "") { lb.splice(i, 1) }
    let row = lb[i].split(" "), previousRow = ["", Infinity], nextRow = ["", 0], lbTemp = lb[i]
    if(lb[i - 1] != undefined) { previousRow = lb[i - 1].split(" ") }
    if(lb[i + 1] != undefined) { nextRow = lb[i + 1].split(" ") }
    let cw = parseFloat(row[1]), previousCw = parseFloat(previousRow[1]), nextCw = parseFloat(nextRow[1])

    if(cw <= previousCw && cw >= nextCw) { }
    else if (cw > previousCw) 
    {
      lb.splice(i, 1)
      lb.splice(i - 1, 0, lbTemp)
    }
  }
}

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
    var page = interaction.options.getString("page")
    var coleweightlbPath = "./coleweightlb.csv"
    var rows = fs.readFileSync(coleweightlbPath, "utf8").split('\r\n') 
    var lb = []
    let desc = ""

    for( let i=0; i < rows.length; i+=1 ) 
    {
      let row = rows[i].split(" ")
      let name = row[0]
      let coleweight = row[1]

      lb.push((name + " " + coleweight))
    }

    /* sorting below, disabled cause unneeded

    for(let i = 0; i < lb.length; i++) {
      sort(lb)
    }
    

    fs.writeFileSync(coleweightlbPath, "")
    for( let i=0; i < lb.length; i += 1 )
    {
      var previousData = fs.readFileSync(coleweightlbPath) 
      fs.writeFileSync(coleweightlbPath, previousData + lb[i])
      previousData = fs.readFileSync(coleweightlbPath)
      if(i != lb.length - 1) {
        fs.writeFileSync(coleweightlbPath, previousData + "\r\n")
      }
    }
    */

    if(page == undefined) { page = 1 }

    if(lb[page*20-20] == undefined) 
    {
      desc = "That is not a valid page! Current max page is: " + Math.ceil(lb.length/20)
    }
    else {
      for(let i = (page*20)-20; i < page*20; i++) {
        if(lb[i] != undefined) {
          desc = desc + (i+1) + "." + " " + lb[i] + "\r\n"
        }
      }
    }
   
  const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle("ColeWeight leaderboard")
      .setDescription(`${desc}`)
      .setFooter({ text: `This command was made by Ninjune#0670 | /help [command] for more information`})
  interaction.followUp({ embeds: [embed] })
    //catch(error) {interaction.followUp("The bot broke for some reason: " + error)}
  },
};
