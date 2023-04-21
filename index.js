const { Client, GatewayIntentBits } = require(`discord.js`)
require('dotenv').config()
const express = require(`express`)
const app = express()

app.get(`/`, (req,res)=>{
    res.sendStatus(200)
})


var initialCommand = `!`
const helpMenu = `
normal -- shows current/next map and time remaining for normal game modes. 
ranked -- shows current/next map and time remaining for ranked.
changeCommand -- changes initial symbol for commands. (Will always reset after I restart computer or turn off application)
`

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    ]
})

client.on(`ready`, ()=> {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on(`messageCreate`, (message) => {
    if (message.content.startsWith(initialCommand)){
        //change the initial symbol for commands
        if(message.content.endsWith(`changeCommand`)){
            message.reply(`What would you like to change the initial command to?`)
                .then(() =>{
                    const filter = (msg) => msg.author.id === message.author.id
                    const collector = message.channel.createMessageCollector(filter, {
                        max: 1,
                        time: 60000
                    })
                    
                    collector.on(`collect`, (message)=>{
                        initialCommand = message.content
                        message.reply(`Initial command successfully changed!`)
                        collector.stop()
                    })

                    collector.on(`end`, (collected, reason)=>{
                        if(reason ===`time`){
                            message.reply(`Command change timed out.`)
                        }
                    })
                })
        }
        //normal apex times
        if(message.content.endsWith(`normal`)){
            fetch(`https://api.mozambiquehe.re/maprotation?auth=${process.env.API_KEY}&version=2`)
            .then(res => res.json())
            .then(data=>{
                const currentMap = data.battle_royale.current.map
                const currentRemainingTimer = data.battle_royale.current.remainingTimer
                const nextMap = data.battle_royale.next.map
                message.reply(`The current normal map is ${currentMap} for ${currentRemainingTimer}.\nThe next map is ${nextMap}`)
            })
        }
        //ranked apex times
        if(message.content.endsWith(`ranked`)){
            fetch(`https://api.mozambiquehe.re/maprotation?auth=${process.env.API_KEY}&version=2`)
            .then(res => res.json())
            .then(data=>{
                const rankedMap = data.ranked.current.map
                const rankedRemainingTimer = data.ranked.current.remainingTimer
                const nextRankedMap = data.ranked.next.map
                message.reply(`The current ranked map is ${rankedMap} for ${rankedRemainingTimer}. \nThe next map is ${nextRankedMap}`)
            })
        }
        //list commands
        if(message.content.endsWith(`help`)){
            message.reply(helpMenu)
        }
        //add notify when map change
            //get user.id
            //fetch data timer
            //compare to current time probably with date util
            //set timer when reach timer then message.reply to user.id


    }
})

client.login(process.env.DISCORD_TOKEN)
app.listen(process.env.PORT || 3001, ()=>{
    console.log(`Listening on PORT:${process.env.PORT}`)
})